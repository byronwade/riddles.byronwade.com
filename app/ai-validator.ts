import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export interface AnswerValidation {
	isCorrect: boolean;
	confidence: "high" | "medium" | "low";
	feedback: string;
	suggestedAnswer?: string;
}

export async function validateAnswerWithAI(userAnswer: string, correctAnswer: string, riddleText: string): Promise<AnswerValidation> {
	try {
		const prompt = `You are an expert riddle validator. Your job is to determine if a user's answer to a riddle is correct, close, or incorrect.

RIDDLE: "${riddleText}"
CORRECT ANSWER: "${correctAnswer}"
USER'S ANSWER: "${userAnswer}"

Please analyze the user's answer and respond with a JSON object in this exact format:
{
  "isCorrect": boolean,
  "confidence": "high" | "medium" | "low",
  "feedback": "string explaining why the answer is correct, close, or incorrect",
  "suggestedAnswer": "string (only if the answer is close but not quite right)"
}

Guidelines:
- Consider synonyms, common misspellings, and alternative phrasings
- If the answer is essentially correct but worded differently, mark as correct
- If the answer is close but missing a key element, provide helpful feedback
- Be encouraging and educational in your feedback
- Keep feedback concise and friendly

Respond with ONLY the JSON object, no additional text.`;

		const { text } = await generateText({
			model: google("gemini-1.5-pro"),
			prompt,
		});

		// Parse the JSON response
		const validation = JSON.parse(text.trim()) as AnswerValidation;

		return validation;
	} catch (error) {
		console.error("AI validation error:", error);

		// Fallback to basic validation if AI fails
		return {
			isCorrect: false,
			confidence: "low",
			feedback: "Unable to validate with AI. Please check your spelling and try again.",
		};
	}
}

export async function getHintWithAI(riddleText: string, correctAnswer: string, attempts: number): Promise<string> {
	try {
		const prompt = `You are a helpful riddle assistant. The user is stuck on this riddle and needs a hint.

RIDDLE: "${riddleText}"
CORRECT ANSWER: "${correctAnswer}"
ATTEMPTS MADE: ${attempts}

Provide a helpful hint based on the number of attempts:
- 1-2 attempts: Give a subtle hint that points in the right direction
- 3-4 attempts: Provide a more specific hint without giving away the answer
- 5+ attempts: Give a stronger hint that narrows down the possibilities

Make the hint encouraging and educational. Keep it concise (1-2 sentences max).
Don't give away the answer completely, just guide them toward it.

Respond with ONLY the hint text, no additional formatting.`;

		const { text } = await generateText({
			model: google("gemini-1.5-pro"),
			prompt,
		});

		return text.trim();
	} catch (error) {
		console.error("AI hint generation error:", error);

		// Fallback hints
		const fallbackHints = ["Think about the key words in the riddle...", "Consider what the riddle is really asking about...", "Look for wordplay or double meanings...", "Try breaking down the riddle into parts...", "What could this riddle be describing?"];

		return fallbackHints[Math.min(attempts - 1, fallbackHints.length - 1)];
	}
}
