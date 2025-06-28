"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { submitAnswer, Riddle, getAIHint } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type SubmissionStatus = "correct" | "close" | "incorrect";

type FormState = {
	status: SubmissionStatus;
	feedback: string;
} | null;

type Achievement = {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlocked: boolean;
};

// Confetti animation
const createConfetti = () => {
	const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
	const confettiCount = 50;

	for (let i = 0; i < confettiCount; i++) {
		const confetti = document.createElement("div");
		confetti.style.position = "fixed";
		confetti.style.left = Math.random() * 100 + "vw";
		confetti.style.top = "-10px";
		confetti.style.width = Math.random() * 10 + 5 + "px";
		confetti.style.height = confetti.style.width;
		confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
		confetti.style.borderRadius = "50%";
		confetti.style.pointerEvents = "none";
		confetti.style.zIndex = "9999";
		confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear forwards`;

		document.body.appendChild(confetti);

		setTimeout(() => {
			confetti.remove();
		}, 4000);
	}
};

// Haptic feedback
const triggerHaptic = (type: "light" | "medium" | "heavy") => {
	if ("vibrate" in navigator) {
		const patterns = {
			light: [10],
			medium: [20],
			heavy: [30],
		};
		navigator.vibrate(patterns[type]);
	}
};

// Sound system
const playSound = (type: "correct" | "incorrect" | "close" | "click" | "type") => {
	if (typeof window === "undefined") return;

	const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
	if (!AudioContextClass) return;

	const audioContext = new AudioContextClass();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	// Sound configurations
	const sounds = {
		correct: { frequency: 523.25, duration: 0.3, type: "sine" as OscillatorType },
		incorrect: { frequency: 146.83, duration: 0.2, type: "sawtooth" as OscillatorType },
		close: { frequency: 329.63, duration: 0.15, type: "triangle" as OscillatorType },
		click: { frequency: 800, duration: 0.05, type: "square" as OscillatorType },
		type: { frequency: 1000, duration: 0.02, type: "sine" as OscillatorType },
	};

	const sound = sounds[type];
	oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
	oscillator.type = sound.type;

	gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

	oscillator.start(audioContext.currentTime);
	oscillator.stop(audioContext.currentTime + sound.duration);
};

// Voice input hook
const useVoiceInput = (onResult: (text: string) => void) => {
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognitionClass) {
			setIsSupported(true);
			recognitionRef.current = new SpeechRecognitionClass();
			recognitionRef.current.continuous = false;
			recognitionRef.current.interimResults = false;
			recognitionRef.current.lang = "en-US";

			recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
				const transcript = event.results[0][0].transcript;
				onResult(transcript);
				setIsListening(false);
			};

			recognitionRef.current.onerror = () => {
				setIsListening(false);
			};

			recognitionRef.current.onend = () => {
				setIsListening(false);
			};
		}
	}, [onResult]);

	const startListening = () => {
		if (recognitionRef.current && !isListening) {
			setIsListening(true);
			recognitionRef.current.start();
		}
	};

	return { isListening, isSupported, startListening };
};

// Progressive hints
const getProgressiveHint = (attempts: number): string | null => {
	if (attempts < 2) return null;
	if (attempts === 2) return "💡 Think about the key words in the riddle...";
	if (attempts === 3) return "🤔 Consider what the riddle is really asking about...";
	if (attempts === 4) return "🔍 Look for wordplay or double meanings...";
	if (attempts >= 5) return "💭 Try breaking down the riddle into parts...";
	return null;
};

// Achievement system
const checkAchievements = (streak: number, totalSolved: number): Achievement[] => {
	const achievements: Achievement[] = [
		{ id: "first-solve", title: "First Success", description: "Solved your first riddle!", icon: "🎯", unlocked: totalSolved >= 1 },
		{ id: "streak-3", title: "Getting Warmed Up", description: "3-day solving streak!", icon: "🔥", unlocked: streak >= 3 },
		{ id: "streak-7", title: "Week Warrior", description: "7-day solving streak!", icon: "⚡", unlocked: streak >= 7 },
		{ id: "streak-30", title: "Monthly Master", description: "30-day solving streak!", icon: "👑", unlocked: streak >= 30 },
		{ id: "total-10", title: "Riddle Rookie", description: "Solved 10 riddles!", icon: "🌟", unlocked: totalSolved >= 10 },
		{ id: "total-50", title: "Puzzle Pro", description: "Solved 50 riddles!", icon: "💎", unlocked: totalSolved >= 50 },
		{ id: "total-100", title: "Riddle Master", description: "Solved 100 riddles!", icon: "🏆", unlocked: totalSolved >= 100 },
	];

	return achievements.filter((a) => a.unlocked);
};

// Share functionality with debouncing
let shareTimeout: NodeJS.Timeout | null = null;
const shareResults = (streak: number, totalSolved: number, todaysSolved: boolean) => {
	if (shareTimeout) return; // Prevent multiple rapid calls

	const text = `🧩 Daily Riddles Challenge!\n${todaysSolved ? "✅" : "⏳"} Today's riddle: ${todaysSolved ? "SOLVED" : "In progress"}\n🔥 Current streak: ${streak} days\n🎯 Total solved: ${totalSolved}\n\nChallenge your mind at riddles.byronwade.com`;

	shareTimeout = setTimeout(() => {
		shareTimeout = null;
	}, 1000); // Debounce for 1 second

	if (navigator.share) {
		navigator
			.share({
				title: "Daily Riddles Challenge",
				text: text,
				url: "https://riddles.byronwade.com",
			})
			.catch(() => {
				// If share fails or is cancelled, fall back to clipboard
				navigator.clipboard.writeText(text);
				toast.success("Results copied to clipboard!", { duration: 5000 });
			});
	} else {
		navigator.clipboard.writeText(text);
		toast.success("Results copied to clipboard!", { duration: 5000 });
	}
};

function AchievementBadge({ achievement }: { achievement: Achievement }) {
	return (
		<div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
			<span className="text-lg">{achievement.icon}</span>
			<div>
				<div className="text-sm font-medium text-foreground">{achievement.title}</div>
				<div className="text-xs text-muted-foreground">{achievement.description}</div>
			</div>
		</div>
	);
}

function IntegratedSubmitInput({ value, onChange, disabled, onVoiceInput }: { value: string; onChange: (value: string) => void; disabled: boolean; onVoiceInput: (text: string) => void }) {
	const { pending } = useFormStatus();
	const inputRef = useRef<HTMLInputElement>(null);
	const { isListening, isSupported, startListening } = useVoiceInput(onVoiceInput);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && value.trim() && !disabled && !pending) {
			playSound("click");
			triggerHaptic("light");
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
		if (e.target.value.length > value.length) {
			playSound("type");
		}
	};

	const handleButtonClick = () => {
		if (value.trim() && !disabled && !pending) {
			playSound("click");
			triggerHaptic("medium");
			const form = inputRef.current?.closest("form");
			if (form) {
				const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
				form.dispatchEvent(submitEvent);
			}
		}
	};

	const handleVoiceClick = () => {
		triggerHaptic("light");
		startListening();
	};

	return (
		<div className="relative group">
			<Input ref={inputRef} name="answer" placeholder="Type your answer and press Enter..." required value={value} onChange={handleChange} onKeyDown={handleKeyDown} disabled={disabled || pending} className="w-full h-14 px-4 pr-32 text-lg bg-transparent border-2 border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all duration-200 disabled:opacity-50 group-hover:border-foreground/50" autoComplete="off" autoFocus />

			{isSupported && (
				<Button type="button" onClick={handleVoiceClick} disabled={disabled || pending} size="sm" className={`absolute right-14 top-1/2 -translate-y-1/2 bg-muted text-foreground hover:bg-muted/80 disabled:opacity-50 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] ${isListening ? "bg-red-500 text-white animate-pulse" : ""}`}>
					🎤
				</Button>
			)}

			<Button type="button" onClick={handleButtonClick} disabled={disabled || pending || !value.trim()} size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] disabled:hover:scale-100">
				{pending ? <div className="w-4 h-4 border border-background/30 border-t-background rounded-full animate-spin" /> : "→"}
			</Button>
		</div>
	);
}

IntegratedSubmitInput.displayName = "IntegratedSubmitInput";

function CompletionState({ streak, totalSolved }: { streak: number; totalSolved: number }) {
	const [timeUntilNext, setTimeUntilNext] = useState("");
	const achievements = checkAchievements(streak, totalSolved);

	useEffect(() => {
		const updateCountdown = () => {
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);

			const diff = tomorrow.getTime() - now.getTime();
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			setTimeUntilNext(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="text-center space-y-6 sm:space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
			<div className="space-y-3 sm:space-y-4">
				<div className="text-4xl sm:text-5xl lg:text-6xl">🎉</div>
				<h2 className="text-xl sm:text-2xl font-bold text-foreground">Congratulations!</h2>
				<p className="text-sm sm:text-base text-muted-foreground">You&apos;ve completed today&apos;s riddle!</p>
			</div>

			<div className="space-y-3 sm:space-y-4">
				<div className="flex justify-center gap-4 sm:gap-8 text-sm">
					<div className="text-center">
						<div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{streak}</div>
						<div className="text-muted-foreground text-xs sm:text-sm">Day Streak</div>
					</div>
					<div className="w-px h-10 sm:h-12 bg-border" />
					<div className="text-center">
						<div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{totalSolved}</div>
						<div className="text-muted-foreground text-xs sm:text-sm">Total Solved</div>
					</div>
				</div>
			</div>

			{/* Achievements */}
			{achievements.length > 0 && (
				<div className="space-y-2 sm:space-y-3">
					<h3 className="text-base sm:text-lg font-semibold text-foreground">🏆 Achievements</h3>
					<div className="space-y-2 max-w-md mx-auto">
						{achievements.slice(-3).map((achievement) => (
							<AchievementBadge key={achievement.id} achievement={achievement} />
						))}
					</div>
				</div>
			)}

			{/* Share Button */}
			<Button onClick={() => shareResults(streak, totalSolved, true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02]">
				📱 Share Results
			</Button>

			<div className="space-y-1 sm:space-y-2">
				<p className="text-xs sm:text-sm text-muted-foreground">Next riddle in:</p>
				<div className="text-xl sm:text-2xl font-mono font-bold text-foreground">{timeUntilNext}</div>
				<p className="text-xs text-muted-foreground">Come back tomorrow for a new challenge!</p>
			</div>
		</div>
	);
}

function LoadingOverlay() {
	const { pending } = useFormStatus();
	if (!pending) return null;
	return (
		<div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="flex flex-col items-center gap-4">
				<div className="w-10 h-10 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
				<p className="text-lg text-muted-foreground font-semibold">🤖 AI is validating your answer...</p>
			</div>
		</div>
	);
}

export default function DailyRiddleGame({ initialRiddle }: { initialRiddle: Riddle }) {
	const [riddle] = useState(initialRiddle);
	const [answerInput, setAnswerInput] = useState("");
	const [streak, setStreak] = useState(0);
	const [totalSolved, setTotalSolved] = useState(0);
	const [attempts, setAttempts] = useState(0);
	const [mounted, setMounted] = useState(false);
	const [isCompleted, setIsCompleted] = useState(false);
	const [showShake, setShowShake] = useState(false);
	const [aiHint, setAiHint] = useState<string | null>(null);
	const [isLoadingHint, setIsLoadingHint] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	// Add CSS animations
	useEffect(() => {
		if (typeof document !== "undefined") {
			const style = document.createElement("style");
			style.id = "riddle-animations";
			style.textContent = `
				@keyframes confetti-fall {
					0% {
						transform: translateY(-10px) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(360deg);
						opacity: 0;
					}
				}
				@keyframes shake {
					0%, 100% { transform: translateX(0); }
					10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
					20%, 40%, 60%, 80% { transform: translateX(5px); }
				}
				.shake {
					animation: shake 0.5s ease-in-out;
				}
			`;
			if (!document.getElementById("riddle-animations")) {
				document.head.appendChild(style);
			}
		}
	}, []);

	useEffect(() => {
		setMounted(true);
		if (typeof window !== "undefined") {
			const savedStreak = localStorage.getItem("riddle-streak");
			const savedTotal = localStorage.getItem("riddle-total");
			const lastCompletedDate = localStorage.getItem("last-completed-date");
			const today = new Date().toISOString().split("T")[0];

			if (savedStreak) setStreak(parseInt(savedStreak));
			if (savedTotal) setTotalSolved(parseInt(savedTotal));

			if (lastCompletedDate === today) {
				setIsCompleted(true);
			}
		}
	}, []);

	const handleVoiceInput = (text: string) => {
		setAnswerInput(text);
		toast.success(`Voice input: "${text}"`, { duration: 5000 });
	};

	// Generate AI hint when attempts increase
	useEffect(() => {
		if (attempts >= 3 && !aiHint && !isLoadingHint) {
			setIsLoadingHint(true);
			getAIHint(riddle.riddle, riddle.answer, attempts)
				.then((hint) => {
					setAiHint(hint);
					setIsLoadingHint(false);
				})
				.catch(() => {
					setIsLoadingHint(false);
				});
		}
	}, [attempts, aiHint, isLoadingHint, riddle.riddle, riddle.answer]);

	const [state, formAction] = useActionState(async (previousState: FormState, formData: FormData) => {
		const result = await submitAnswer(formData);
		setAttempts((prev) => prev + 1);

		if (result.status === "correct") {
			playSound("correct");
			triggerHaptic("medium");
			createConfetti();

			toast.success(`🎉 ${result.feedback}`, {
				duration: 5000,
				style: {
					background: "hsl(var(--background))",
					color: "hsl(var(--foreground))",
					border: "1px solid hsl(var(--border))",
				},
			});

			const newStreak = streak + 1;
			const newTotal = totalSolved + 1;
			const today = new Date().toISOString().split("T")[0];

			setStreak(newStreak);
			setTotalSolved(newTotal);
			setAnswerInput("");
			setAttempts(0);
			setAiHint(null);

			if (typeof window !== "undefined") {
				localStorage.setItem("riddle-streak", newStreak.toString());
				localStorage.setItem("riddle-total", newTotal.toString());
				localStorage.setItem("last-completed-date", today);
			}

			setTimeout(() => {
				setIsCompleted(true);
			}, 2000);
		} else if (result.status === "close") {
			playSound("close");
			triggerHaptic("medium");
			toast.info(`💭 ${result.feedback}`, {
				duration: 5000,
				style: {
					background: "hsl(var(--background))",
					color: "hsl(var(--foreground))",
					border: "1px solid hsl(var(--border))",
				},
			});
		} else {
			playSound("incorrect");
			triggerHaptic("heavy");
			setShowShake(true);
			setTimeout(() => setShowShake(false), 500);

			toast.error(`🤔 ${result.feedback}`, {
				duration: 5000,
				style: {
					background: "hsl(var(--background))",
					color: "hsl(var(--foreground))",
					border: "1px solid hsl(var(--border))",
				},
			});
		}
		return result;
	}, null);

	if (!mounted) {
		return (
			<div className="text-center py-12">
				<div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
				<p className="text-muted-foreground animate-pulse">Loading your daily riddle...</p>
			</div>
		);
	}

	const currentHint = getProgressiveHint(attempts);
	const achievements = checkAchievements(streak, totalSolved);

	return (
		<TooltipProvider>
			<div className="relative min-h-screen">
				{/* Top Bar with Stats and Theme Toggle */}
				<div className="flex items-start justify-between mb-8 sm:mb-12 lg:mb-16">
					{/* Stats - Top Left Corner */}
					<div className="flex items-center gap-2 sm:gap-4 text-sm">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
									<div className="text-lg sm:text-xl font-bold text-foreground">{streak}</div>
									<div className="text-muted-foreground text-xs">Streak</div>
									{achievements.some((a) => a.id.includes("streak")) && <div className="text-xs">🏆</div>}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Consecutive days with correct answers</p>
							</TooltipContent>
						</Tooltip>

						<div className="w-px h-6 bg-border" />

						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
									<div className="text-lg sm:text-xl font-bold text-foreground">{totalSolved}</div>
									<div className="text-muted-foreground text-xs">Solved</div>
									{achievements.some((a) => a.id.includes("total")) && <div className="text-xs">🏆</div>}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Total riddles solved correctly</p>
							</TooltipContent>
						</Tooltip>

						{!isCompleted && (
							<>
								<div className="w-px h-6 bg-border" />

								<Tooltip>
									<TooltipTrigger asChild>
										<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
											<div className="text-lg sm:text-xl font-bold text-foreground">{attempts}</div>
											<div className="text-muted-foreground text-xs">Attempts</div>
										</div>
									</TooltipTrigger>
									<TooltipContent>
										<p>Attempts on current riddle</p>
									</TooltipContent>
								</Tooltip>
							</>
						)}
					</div>

					{/* Theme Toggle and Share - Top Right Corner */}
					<div className="flex items-center gap-2">
						{!isCompleted && (
							<Button onClick={() => shareResults(streak, totalSolved, false)} size="sm" variant="outline" className="hover:scale-105 transition-transform duration-200">
								📱
							</Button>
						)}
						<div className="hover:scale-105 transition-transform duration-200">
							<ThemeToggle />
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className={cn("space-y-6 sm:space-y-8 lg:space-y-12 max-w-2xl mx-auto", showShake && "animate-shake")}>
					{isCompleted ? (
						<CompletionState streak={streak} totalSolved={totalSolved} />
					) : (
						<>
							{/* Riddle - Clean typography with better animation */}
							<div className="text-center space-y-4 sm:space-y-6">
								<div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
									<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground leading-relaxed text-balance hover:text-foreground/80 transition-colors duration-300">{riddle.riddle}</p>
								</div>
							</div>

							{/* Answer Form - Enhanced integrated input */}
							<div className={cn("max-w-md mx-auto space-y-4 sm:space-y-6", showShake && "animate-shake")}>
								<form action={formAction} ref={formRef} className="w-full max-w-2xl relative">
									<input type="hidden" name="riddleAnswer" value={riddle.answer} />
									<input type="hidden" name="riddleText" value={riddle.riddle} />

									<div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
										<IntegratedSubmitInput value={answerInput} onChange={setAnswerInput} disabled={false} onVoiceInput={handleVoiceInput} />
									</div>
									<LoadingOverlay />
								</form>

								{/* Feedback is now handled by toasts, this section can be removed or repurposed */}
								{state?.feedback && (
									<div className="sr-only" aria-live="polite">
										{state.feedback}
									</div>
								)}
							</div>

							{/* Progressive Hints */}
							{(currentHint || aiHint || isLoadingHint) && (
								<div className="text-center max-w-md mx-auto animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
									<div className="py-4 px-6 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors duration-300">
										{isLoadingHint ? (
											<div className="flex items-center justify-center gap-2">
												<div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
												<p className="text-sm text-muted-foreground">🤖 AI is thinking of a hint...</p>
											</div>
										) : (
											<p className="text-sm text-muted-foreground">{aiHint ? `🤖 ${aiHint}` : currentHint}</p>
										)}
									</div>
								</div>
							)}

							{/* Progress indicator for attempts */}
							{attempts > 0 && (
								<div className="flex justify-center space-x-1 animate-in fade-in-50 duration-300">
									{Array.from({ length: Math.min(attempts, 5) }).map((_, i) => (
										<div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-in zoom-in-50 duration-200" style={{ animationDelay: `${i * 100}ms` }} />
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
}
