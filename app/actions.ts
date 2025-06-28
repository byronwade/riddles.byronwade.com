"use server";

import "server-only";
import levenshtein from "fast-levenshtein";
import riddles from "../lib/riddles.json";
import { validateAnswerWithAI, getHintWithAI } from "./ai-validator";

export type Riddle = {
	riddle: string;
	answer: string;
};

export async function getDailyRiddle(): Promise<Riddle> {
	const now = new Date();
	const startOfYear = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - startOfYear.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);

	const riddleIndex = (dayOfYear - 1) % riddles.length;

	return riddles[riddleIndex];
}

export async function getTodayRiddleId(): Promise<string> {
	const now = new Date();
	const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD format
	return dateString;
}

type SubmissionStatus = "correct" | "close" | "incorrect";

// Enhanced answer matching with synonyms and variations
function normalizeAnswer(answer: string): string {
	return answer
		.toLowerCase()
		.replace(/[^\w\s]/g, "") // Remove punctuation
		.replace(/\s+/g, " ") // Normalize whitespace
		.trim();
}

function extractMainAnswer(fullAnswer: string): string[] {
	// Extract the main answer from complex answers like "It was daytime"
	const normalized = normalizeAnswer(fullAnswer);

	// Common patterns in the riddle answers
	const answers = [normalized];

	// If the answer contains explanations, try to extract the key part
	if (normalized.includes("it was")) {
		const keyPart = normalized.replace(/.*it was\s+/, "");
		if (keyPart) answers.push(keyPart);
	}

	// Add word variations
	const words = normalized.split(" ");
	if (words.length === 1) {
		answers.push(words[0]);
	} else if (words.length === 2) {
		answers.push(words[0], words[1], words.join(""));
	}

	return [...new Set(answers)]; // Remove duplicates
}

function getSynonyms(word: string): string[] {
	const synonymMap: Record<string, string[]> = {
		daytime: ["day", "daylight", "morning", "afternoon", "noon", "light"],
		day: ["daytime", "daylight", "light"],
		light: ["daylight", "daytime", "bright", "sunny"],
		bright: ["light", "sunny", "daylight"],
		sunny: ["bright", "light", "daylight"],
		sieve: ["strainer", "colander", "filter"],
		strainer: ["sieve", "colander", "filter"],
		arrow: ["dart", "bolt"],
		bell: ["chime", "gong"],
		map: ["chart", "atlas"],
		gun: ["firearm", "weapon", "pistol"],
		noon: ["midday", "12", "twelve"],
		horse: ["steed", "stallion", "mare"],
		pride: ["ego", "arrogance"],
		rain: ["precipitation", "water", "drops"],
		mountain: ["peak", "hill", "summit"],
		stars: ["star", "constellation"],
		imagination: ["mind", "fantasy", "dreams"],
		nothing: ["void", "empty", "zero"],
		dentist: ["doctor", "dr"],
		pepper: ["spice", "seasoning"],
	};

	return synonymMap[word.toLowerCase()] || [];
}

export async function submitAnswer(formData: FormData): Promise<{ status: SubmissionStatus }> {
	const userAnswer = formData.get("answer") as string;
	const correctAnswer = formData.get("riddleAnswer") as string;
	const riddleText = formData.get("riddleText") as string;

	if (!userAnswer || !correctAnswer) {
		return { status: "incorrect" };
	}

	const normalizedUser = normalizeAnswer(userAnswer);
	const possibleAnswers = extractMainAnswer(correctAnswer);

	// Check exact matches first
	for (const answer of possibleAnswers) {
		if (normalizedUser === answer) {
			return { status: "correct" };
		}
	}

	// Check synonyms
	const userWords = normalizedUser.split(" ");
	for (const answer of possibleAnswers) {
		const answerWords = answer.split(" ");

		// Check if any user word is a synonym of any answer word
		for (const userWord of userWords) {
			for (const answerWord of answerWords) {
				const synonyms = getSynonyms(answerWord);
				if (synonyms.includes(userWord) || getSynonyms(userWord).includes(answerWord)) {
					return { status: "correct" };
				}
			}
		}
	}

	// Check Levenshtein distance for close matches
	let minDistance = Infinity;
	for (const answer of possibleAnswers) {
		const distance = levenshtein.get(normalizedUser, answer);
		minDistance = Math.min(minDistance, distance);
	}

	// Be more forgiving with longer answers
	const maxLength = Math.max(normalizedUser.length, Math.max(...possibleAnswers.map((a) => a.length)));
	const threshold = maxLength > 10 ? 3 : 2;

	if (minDistance === 0) {
		return { status: "correct" };
	}

	// If basic validation shows it's close, use AI for more intelligent validation
	if (minDistance <= threshold) {
		try {
			const aiValidation = await validateAnswerWithAI(userAnswer, correctAnswer, riddleText);

			if (aiValidation.isCorrect) {
				return { status: "correct" };
			}

			// If AI says it's close, return close status
			if (aiValidation.confidence === "medium" || aiValidation.confidence === "high") {
				return { status: "close" };
			}
		} catch (error) {
			console.error("AI validation failed, falling back to basic validation:", error);
			// Fall back to basic validation if AI fails
			return { status: "close" };
		}
	}

	// For answers that are clearly wrong, still try AI validation for edge cases
	if (minDistance > threshold && minDistance <= threshold + 2) {
		try {
			const aiValidation = await validateAnswerWithAI(userAnswer, correctAnswer, riddleText);

			if (aiValidation.isCorrect) {
				return { status: "correct" };
			}

			if (aiValidation.confidence === "medium" || aiValidation.confidence === "high") {
				return { status: "close" };
			}
		} catch (error) {
			console.error("AI validation failed for edge case:", error);
		}
	}

	return { status: "incorrect" };
}

export async function getAIHint(riddleText: string, correctAnswer: string, attempts: number): Promise<string> {
	try {
		return await getHintWithAI(riddleText, correctAnswer, attempts);
	} catch (error) {
		console.error("AI hint generation failed:", error);
		return "Think about the key words in the riddle...";
	}
}
