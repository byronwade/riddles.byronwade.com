import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export interface AnswerValidation {
	accuracy: number; // Scale of 1-10
	clarity: number; // Scale of 1-10
	feedback: string;
	isCorrect: boolean; // Derived from accuracy score
}

export async function validateAnswerWithAI(userAnswer: string, correctAnswer: string, riddleText: string): Promise<AnswerValidation> {
	try {
		const prompt = `You are an expert riddle validator. Your job is to determine if a user's answer to a riddle is correct by rating it on clarity and accuracy.

RIDDLE: "${riddleText}"
CORRECT ANSWER: "${correctAnswer}"
USER'S ANSWER: "${userAnswer}"

Please analyze the user's answer and respond with a JSON object in this exact format:
{
  "accuracy": number,  // A score from 1-10 on how accurate the user's answer is.
  "clarity": number,   // A score from 1-10 on how clear the user's answer is.
  "feedback": "string" // A brief, friendly explanation for your rating.
}

Guidelines for scoring:
- **Accuracy (1-10)**:
  - 10: Perfect match or a negligible difference.
  - 8-9: Essentially correct, captures the main idea, may have minor wording differences.
    - Example: Correct is "What time is it? Who said this happened during the night?" and user says "what time is it, who said it was at night time". This is an 8-10.
  - 5-7: On the right track, partially correct, but misses a key component.
  - 1-4: Incorrect or completely off-topic.
- **Clarity (1-10)**:
  - 8-10: Very clear and easy to understand.
  - 5-7: Mostly clear but could be phrased better.
  - 1-4: Unclear, confusing, or nonsensical.
- **Feedback**:
  - Be encouraging. If the answer is close, say so!
  - Keep it brief (1-2 sentences).

Respond with ONLY the JSON object, no additional text.`;

		const { text } = await generateText({
			model: google("gemini-1.5-pro"),
			prompt,
		});

		const validationResult = JSON.parse(text.trim()) as Omit<AnswerValidation, "isCorrect">;

		const finalValidation: AnswerValidation = {
			...validationResult,
			isCorrect: validationResult.accuracy >= 8,
		};

		return finalValidation;
	} catch (error) {
		console.error("AI validation error:", error);

		// Fallback to basic validation if AI fails
		return {
			accuracy: 0,
			clarity: 0,
			isCorrect: false,
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
