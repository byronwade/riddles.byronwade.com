"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { submitAnswer, getDailyRiddle, Riddle } from "./actions";
import { Loader, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type LeaderboardPlayer = {
	username: string;
	score: number;
};

type SubmissionStatus = "correct" | "close" | "incorrect";

type FormState = {
	status: SubmissionStatus;
} | null;

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
			{pending ? <Loader className="h-4 w-4 animate-spin" /> : "Submit"}
		</Button>
	);
}

export function RiddleGame({ initialRiddle }: { initialRiddle: Riddle }) {
	const [riddle, setRiddle] = useState(initialRiddle);
	const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
	const [username, setUsername] = useState("Guest");
	const [isUsernameSet, setIsUsernameSet] = useState(false);
	const [answerInput, setAnswerInput] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (typeof window !== "undefined") {
			const storedUsername = localStorage.getItem("riddle-username");
			if (storedUsername) {
				setUsername(storedUsername);
				setIsUsernameSet(true);
			}
			const localLeaderboard = JSON.parse(localStorage.getItem("riddle-leaderboard") || "[]");
			setLeaderboard(localLeaderboard);
		}
	}, []);

	const [state, formAction] = useActionState(async (previousState: FormState, formData: FormData) => {
		const result = await submitAnswer(previousState, formData);

		if (result.status === "correct") {
			toast.success("Correct! Well done.");
			const newRiddle = await getDailyRiddle();
			setRiddle(newRiddle);
			setAnswerInput("");

			const newLeaderboard = [...leaderboard];
			const playerIndex = newLeaderboard.findIndex((p) => p.username === username);
			if (playerIndex > -1) {
				newLeaderboard[playerIndex].score += 1;
			} else {
				newLeaderboard.push({ username, score: 1 });
			}
			newLeaderboard.sort((a, b) => b.score - a.score);
			const updatedLeaderboard = newLeaderboard.slice(0, 10);
			setLeaderboard(updatedLeaderboard);
			if (typeof window !== "undefined") {
				localStorage.setItem("riddle-leaderboard", JSON.stringify(updatedLeaderboard));
			}
		} else if (result.status === "close") {
			toast.info("So close! Check your spelling.");
		} else {
			toast.error("Not quite. Try again!");
		}
		return result;
	}, null);

	if (!mounted) {
		return (
			<div className="w-full max-w-md mx-auto">
				<Card className="border-0">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Loading...</CardTitle>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!isUsernameSet) {
		return (
			<div className="w-full max-w-md mx-auto">
				<Card className="border-0">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">What should we call you?</CardTitle>
						<CardDescription>Enter a username to start playing.</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const form = e.target as HTMLFormElement;
								const input = form.elements.namedItem("username") as HTMLInputElement;
								if (input.value) {
									setUsername(input.value);
									setIsUsernameSet(true);
									if (typeof window !== "undefined") {
										localStorage.setItem("riddle-username", input.value);
									}
								}
							}}
							className="flex flex-col sm:flex-row gap-2"
						>
							<Input name="username" placeholder="e.g. RiddleMaster42" />
							<Button type="submit" size="lg">
								Let&apos;s Play
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="grid lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
			<div className="space-y-8">
				<Card className="border-0">
					<CardHeader>
						<CardTitle className="text-xl">Your Riddle</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-center min-h-[120px]">
						<p className="text-center text-3xl font-semibold leading-relaxed tracking-tight">{riddle.riddle}</p>
					</CardContent>
				</Card>
				<Card className="border-0">
					<CardHeader>
						<CardTitle>Your Answer</CardTitle>
						<CardDescription>Type your answer below and hit submit.</CardDescription>
					</CardHeader>
					<CardContent>
						<form action={formAction} className="flex flex-col sm:flex-row w-full gap-2">
							<input type="hidden" name="riddleAnswer" value={riddle.answer} />
							<Input name="answer" placeholder="It could be anything..." required value={answerInput} onChange={(e) => setAnswerInput(e.target.value)} className="text-lg py-6" />
							<SubmitButton />
						</form>
					</CardContent>
					{state?.status === "close" && (
						<CardFooter>
							<p className="text-yellow-400 w-full text-center">So close! Check your spelling.</p>
						</CardFooter>
					)}
					{state?.status === "incorrect" && (
						<CardFooter>
							<p className="text-red-500 w-full text-center">Not quite. Try again!</p>
						</CardFooter>
					)}
				</Card>
			</div>

			<Card className="border-0">
				<CardHeader>
					<CardTitle className="flex items-center">
						<Trophy className="mr-2 text-yellow-400" /> Leaderboard
					</CardTitle>
					<CardDescription>Your local high scores. Top 10 players.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">Rank</TableHead>
								<TableHead>Player</TableHead>
								<TableHead className="text-right">Score</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{leaderboard.length > 0 ? (
								leaderboard.map((player, index) => (
									<TableRow key={index}>
										<TableCell className="font-medium">{index + 1}</TableCell>
										<TableCell>{player.username}</TableCell>
										<TableCell className="text-right">{player.score}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={3} className="h-24 text-center">
										No scores yet. Be the first to get on the board!
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
