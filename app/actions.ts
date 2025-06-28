"use server";

import "server-only";
import riddles from "../lib/riddles.json";
import { validateAnswerWithAI } from "./ai-validator";

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

// Regex to remove emojis
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

export async function submitAnswer(prevState: unknown, formData: FormData): Promise<{ status: SubmissionStatus; feedback: string }> {
	const userAnswer = formData.get("answer") as string;
	const correctAnswer = formData.get("riddleAnswer") as string;
	const riddleText = formData.get("riddleText") as string;

	if (!userAnswer || !correctAnswer || !riddleText) {
		return { status: "incorrect", feedback: "Invalid submission." };
	}

	try {
		const aiValidation = await validateAnswerWithAI(userAnswer, correctAnswer, riddleText);

		const feedback = aiValidation.feedback.replace(emojiRegex, "").trim();

		if (aiValidation.isCorrect) {
			return { status: "correct", feedback };
		}

		if (aiValidation.accuracy >= 8) {
			return { status: "close", feedback };
		}

		return { status: "incorrect", feedback };
	} catch (error) {
		console.error("AI validation failed, falling back to basic string comparison:", error);
		// Basic fallback if AI service fails completely
		const normalizedUser = userAnswer.toLowerCase().trim();
		const normalizedCorrect = correctAnswer.toLowerCase().trim();
		if (normalizedUser === normalizedCorrect) {
			return { status: "correct", feedback: "Correct!" };
		}
		return { status: "incorrect", feedback: "Not quite, try again!" };
	}
}

export async function getAIResponses(userAnswer: string, correctAnswer: string, riddleText: string): Promise<{ status: SubmissionStatus; feedback: string }> {
	try {
		const aiValidation = await validateAnswerWithAI(userAnswer, correctAnswer, riddleText);

		if (aiValidation.isCorrect) {
			return { status: "correct", feedback: aiValidation.feedback };
		}

		if (aiValidation.accuracy >= 8) {
			return { status: "close", feedback: aiValidation.feedback };
		}

		return { status: "incorrect", feedback: aiValidation.feedback };
	} catch (error) {
		console.error("AI validation failed, falling back to basic string comparison:", error);
		// Basic fallback if AI service fails completely
		const normalizedUser = userAnswer.toLowerCase().trim();
		const normalizedCorrect = correctAnswer.toLowerCase().trim();
		if (normalizedUser === normalizedCorrect) {
			return { status: "correct", feedback: "Correct!" };
		}
		return { status: "incorrect", feedback: "Not quite, try again!" };
	}
}

export async function checkPracticeRiddle(prevState: unknown, formData: FormData): Promise<{ status: SubmissionStatus; feedback: string }> {
	const userAnswer = formData.get("answer") as string;
	const riddleText = formData.get("riddleText") as string;

	const riddle = riddles.find((r) => r.riddle === riddleText);

	if (!riddle) {
		return { status: "incorrect", feedback: "Could not find this riddle." };
	}

	return getAIResponses(userAnswer, riddle.answer, riddle.riddle);
}
