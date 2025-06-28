"use server";

import "server-only";
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

export async function submitAnswer(formData: FormData): Promise<{ status: SubmissionStatus; feedback: string }> {
	const userAnswer = formData.get("answer") as string;
	const correctAnswer = formData.get("riddleAnswer") as string;
	const riddleText = formData.get("riddleText") as string;

	if (!userAnswer || !correctAnswer || !riddleText) {
		return { status: "incorrect", feedback: "Invalid submission." };
	}

	try {
		const aiValidation = await validateAnswerWithAI(userAnswer, correctAnswer, riddleText);

		if (aiValidation.isCorrect) {
			return { status: "correct", feedback: aiValidation.feedback };
		}

		if (aiValidation.accuracy >= 5) {
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

export async function getAIHint(riddleText: string, correctAnswer: string, attempts: number): Promise<string> {
	try {
		return await getHintWithAI(riddleText, correctAnswer, attempts);
	} catch (error) {
		console.error("AI hint generation failed:", error);
		return "Think about the key words in the riddle...";
	}
}
