"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Riddle, checkPracticeRiddle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowLeft, Pencil, XCircle, Lightbulb, CheckCircle, Info } from "lucide-react";

type SubmissionStatus = "correct" | "close" | "incorrect" | "info";

type Feedback = {
	message: string;
	type: SubmissionStatus;
} | null;

type PracticeRiddle = Omit<Riddle, "answer">;

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
let audioContext: AudioContext | null = null;
const initAudioContext = () => {
	if (typeof window !== "undefined" && !audioContext) {
		const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (AudioContextClass) {
			audioContext = new AudioContextClass();
		}
	}
	return audioContext;
};

const playSound = (type: "correct" | "incorrect" | "close" | "click" | "type" | "hint") => {
	const context = initAudioContext();
	if (!context) return;

	if (context.state === "suspended") {
		context.resume();
	}

	const oscillator = context.createOscillator();
	const gainNode = context.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(context.destination);

	// Sound configurations
	const sounds = {
		correct: { frequency: 523.25, duration: 0.3, type: "sine" as OscillatorType },
		incorrect: { frequency: 146.83, duration: 0.2, type: "sawtooth" as OscillatorType },
		close: { frequency: 329.63, duration: 0.15, type: "triangle" as OscillatorType },
		click: { frequency: 800, duration: 0.05, type: "square" as OscillatorType },
		type: { frequency: 1000, duration: 0.02, type: "sine" as OscillatorType },
		hint: { frequency: 440, duration: 0.1, type: "triangle" as OscillatorType },
	};

	const sound = sounds[type];
	oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);
	oscillator.type = sound.type;

	gainNode.gain.setValueAtTime(0.1, context.currentTime);
	gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + sound.duration);

	oscillator.start(context.currentTime);
	oscillator.stop(context.currentTime + sound.duration);
};

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
	if (!feedback) return null;

	const messageConfig = {
		incorrect: {
			icon: <XCircle className="w-5 h-5 text-red-500" />,
			className: "text-red-500",
		},
		close: {
			icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
			className: "text-yellow-500",
		},
		correct: {
			icon: <CheckCircle className="w-5 h-5 text-green-500" />,
			className: "text-green-500",
		},
		info: {
			icon: <Info className="w-5 h-5 text-blue-500" />,
			className: "text-blue-500",
		},
	};

	const config = messageConfig[feedback.type];

	return (
		<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex items-center justify-center gap-2 pt-2">
			{config.icon}
			<p className={`text-sm font-medium ${config.className}`}>{feedback.message}</p>
		</motion.div>
	);
}

function IntegratedSubmitInput({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
	const { pending } = useFormStatus();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
		if (e.target.value.length > value.length) {
			playSound("type");
		}
	};

	const handleButtonClick = () => {
		if (value.trim() && !disabled && !pending) {
			const form = inputRef.current?.closest("form");
			if (form) {
				const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
				form.dispatchEvent(submitEvent);
			}
		}
	};

	return (
		<div className="relative group">
			<Input ref={inputRef} name="answer" placeholder="Type your answer..." required value={value} onChange={handleChange} disabled={disabled || pending} className="w-full h-16 px-6 pr-32 text-lg bg-background border-2 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300" autoComplete="off" autoFocus />

			<Button type="button" onClick={handleButtonClick} disabled={disabled || pending || !value.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 px-6 flex items-center justify-center text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100">
				{pending ? <div className="w-4 h-4 border border-background/30 border-t-background rounded-full animate-spin" /> : "Submit"}
			</Button>
		</div>
	);
}

IntegratedSubmitInput.displayName = "IntegratedSubmitInput";

export default function RiddleArchive({ allRiddles, dailyRiddle, onExit }: { allRiddles: PracticeRiddle[]; dailyRiddle: Riddle; onExit: () => void }) {
	const practiceRiddles = allRiddles.filter((r) => r.riddle !== dailyRiddle.riddle);
	const [riddleIndex, setRiddleIndex] = useState(0);
	const [answerInput, setAnswerInput] = useState("");
	const [feedback, setFeedback] = useState<Feedback>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [attempts, setAttempts] = useState(0);
	const formRef = useRef<HTMLFormElement>(null);
	const [nickname, setNickname] = useState("Riddler");
	const [streak, setStreak] = useState(0);
	const [totalSolved, setTotalSolved] = useState(0);
	const [isEditingNickname, setIsEditingNickname] = useState(false);
	const [nicknameSaved, setNicknameSaved] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedNickname = localStorage.getItem("riddle-nickname");
			if (savedNickname) setNickname(savedNickname);

			const savedStreak = localStorage.getItem("riddle-streak");
			if (savedStreak) setStreak(parseInt(savedStreak));

			const savedTotal = localStorage.getItem("riddle-total");
			if (savedTotal) setTotalSolved(parseInt(savedTotal));
		}
	}, []);

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNickname(e.target.value);
	};

	const handleNicknameSave = () => {
		setIsEditingNickname(false);
		if (typeof window !== "undefined") {
			localStorage.setItem("riddle-nickname", nickname);
		}
		setNicknameSaved(true);
		setTimeout(() => setNicknameSaved(false), 2000);
	};

	const handleNicknameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleNicknameSave();
		}
	};

	const [state, formAction] = useActionState(checkPracticeRiddle, null);

	useEffect(() => {
		if (state) {
			setFeedback({ message: state.feedback, type: state.status });

			if (state.status === "correct") {
				playSound("correct");
				triggerHaptic("medium");
				setIsCorrect(true);
			} else if (state.status === "close") {
				playSound("close");
				triggerHaptic("light");
			} else {
				playSound("incorrect");
				triggerHaptic("heavy");
			}
		}
	}, [state]);

	const handleNextRiddle = () => {
		setIsCorrect(null);
		setFeedback(null);
		setAnswerInput("");
		setAttempts(0);
		setRiddleIndex((prevIndex) => (prevIndex + 1) % practiceRiddles.length);
		formRef.current?.reset();
	};

	const currentRiddle = practiceRiddles[riddleIndex];

	return (
		<TooltipProvider>
			<div className="relative min-h-screen">
				{/* Top Bar */}
				<div className="flex items-start justify-between mb-8 sm:mb-12 lg:mb-16">
					{/* Stats */}
					<div className="flex items-center gap-2 sm:gap-4 text-sm">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-pointer hover:scale-105 transition-transform duration-200 group" onClick={() => !isEditingNickname && setIsEditingNickname(true)}>
									{isEditingNickname ? (
										<Input type="text" value={nickname} onChange={handleNicknameChange} onBlur={handleNicknameSave} onKeyDown={handleNicknameKeyDown} className="w-24 h-8 text-center bg-transparent border-b-2" autoFocus />
									) : (
										<>
											<div className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1">
												{nickname}
												<Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
											</div>
											<div className="text-muted-foreground text-xs relative">
												Nickname
												{nicknameSaved && (
													<motion.span initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute -right-12 top-0 text-xs text-green-500">
														Saved!
													</motion.span>
												)}
											</div>
										</>
									)}
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Click to edit your nickname</p>
							</TooltipContent>
						</Tooltip>
						<div className="w-px h-6 bg-border" />
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
									<div className="text-lg sm:text-xl font-bold text-foreground">{streak}</div>
									<div className="text-muted-foreground text-xs">Streak</div>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Daily streak (not affected in archive)</p>
							</TooltipContent>
						</Tooltip>
						<div className="w-px h-6 bg-border" />
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
									<div className="text-lg sm:text-xl font-bold text-foreground">{totalSolved}</div>
									<div className="text-muted-foreground text-xs">Solved</div>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Total solved (not affected in archive)</p>
							</TooltipContent>
						</Tooltip>
						<div className="w-px h-6 bg-border" />
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-help hover:scale-105 transition-transform duration-200">
									<div className="text-lg sm:text-xl font-bold text-foreground">{attempts}</div>
									<div className="text-muted-foreground text-xs">Attempts</div>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Attempts on current practice riddle</p>
							</TooltipContent>
						</Tooltip>
					</div>

					{/* Controls */}
					<div className="flex items-center gap-2">
						<Button variant="ghost" onClick={onExit} className="hover:scale-105 transition-transform duration-200">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Daily
						</Button>
						<div className="hover:scale-105 transition-transform duration-200">
							<ThemeToggle />
						</div>
					</div>
				</div>

				{/* Main Content */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl mx-auto space-y-8 py-8">
					<div className="p-6 bg-muted/30 rounded-lg border border-border/50 space-y-6">
						<p className="text-xl font-medium text-center text-balance">{currentRiddle.riddle}</p>

						<form
							action={(formData) => {
								setAttempts((prev) => prev + 1);
								formAction(formData);
							}}
							ref={formRef}
							className="w-full max-w-md mx-auto"
						>
							<input type="hidden" name="riddleText" value={currentRiddle.riddle} />
							<IntegratedSubmitInput value={answerInput} onChange={setAnswerInput} disabled={isCorrect === true} />
						</form>
						<AnimatePresence>
							<FeedbackMessage feedback={feedback} />
						</AnimatePresence>
						{isCorrect && (
							<div className="text-center">
								<Button onClick={handleNextRiddle} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
									<RefreshCw className="w-4 h-4 mr-2" />
									Next Riddle
								</Button>
							</div>
						)}
					</div>
					<p className="text-xs text-center text-muted-foreground">You are in practice mode. Streaks and stats are not affected.</p>
				</motion.div>
			</div>
		</TooltipProvider>
	);
}
