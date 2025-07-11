"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitAnswer, Riddle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { InlineShareButtons } from "sharethis-reactjs";
import { useIsMobile } from "@/hooks/use-mobile";
import { Share2, Pencil, Mic, Trophy, Star, Gem, Crown, Zap, Flame, Target, XCircle, Lightbulb, CheckCircle, Info, RotateCcw, Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import RiddleArchive from "./riddle-archive";

type SubmissionStatus = "correct" | "close" | "incorrect" | "info";

type Feedback = {
	message: string;
	type: SubmissionStatus;
} | null;

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

type ShareConfig = {
	alignment: "left" | "center" | "right";
	color: "social" | "white";
	enabled: boolean;
	font_size: number;
	labels: "counts" | "cta";
	language: string;
	min_count: number;
	networks: ("facebook" | "twitter" | "pinterest" | "email" | "whatsapp" | "reddit")[];
	padding: number;
	radius: number;
	show_total: boolean;
	show_mobile: boolean;
	show_toggle: boolean;
	size: number;
	url: string;
	title: string;
	description: string;
};

// Confetti animation
const createConfetti = () => {
	const confettiCount = 100;
	const confettiContainer = document.body;

	for (let i = 0; i < confettiCount; i++) {
		const confetti = document.createElement("div");
		const size = Math.random() * 8 + 4;
		confetti.style.width = `${size}px`;
		confetti.style.height = `${size}px`;
		confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 90%, 60%)`;
		confetti.style.position = "fixed";
		confetti.style.left = `${Math.random() * 100}vw`;
		confetti.style.top = `${Math.random() * -200 - 20}px`;
		confetti.style.opacity = "0";
		confetti.style.pointerEvents = "none";
		confetti.style.zIndex = "9999";

		const fallDuration = Math.random() * 2 + 3;
		const fallDelay = Math.random() * 2;
		const swayDuration = Math.random() * 2 + 2;

		confetti.animate(
			[
				{ transform: `translateY(0) rotate(0deg)`, opacity: 1 },
				{ transform: `translateY(110vh) rotate(${Math.random() * 720}deg)`, opacity: 0 },
			],
			{
				duration: fallDuration * 1000,
				delay: fallDelay * 1000,
				easing: "ease-out",
				fill: "forwards",
			}
		);

		const sway = document.createElement("div");
		sway.appendChild(confetti);
		sway.style.animation = `sway ${swayDuration}s ease-in-out infinite alternate`;
		confettiContainer.appendChild(sway);

		setTimeout(() => {
			sway.remove();
		}, (fallDuration + fallDelay) * 1000);
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

const playSound = (type: "correct" | "incorrect" | "close" | "click" | "type" | "hint" | "swoosh") => {
	const context = initAudioContext();
	if (!context) return;

	if (context.state === "suspended") {
		context.resume();
	}

	const oscillator = context.createOscillator();
	const gainNode = context.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(context.destination);

	type Sound = { frequency: number; duration: number; type: OscillatorType; endFrequency?: number };

	// Sound configurations
	const sounds: Record<string, Sound> = {
		correct: { frequency: 523.25, duration: 0.3, type: "sine" },
		incorrect: { frequency: 146.83, duration: 0.2, type: "sawtooth" },
		close: { frequency: 329.63, duration: 0.15, type: "triangle" },
		click: { frequency: 800, duration: 0.05, type: "square" },
		type: { frequency: 1000, duration: 0.02, type: "sine" },
		hint: { frequency: 440, duration: 0.1, type: "triangle" },
		swoosh: { frequency: 150, endFrequency: 600, duration: 0.2, type: "sine" },
	};

	const sound = sounds[type];
	if (type === "swoosh" && sound.endFrequency) {
		gainNode.gain.setValueAtTime(0.001, context.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.2, context.currentTime + sound.duration * 0.2);
		gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + sound.duration);
		oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);
		oscillator.frequency.exponentialRampToValueAtTime(sound.endFrequency, context.currentTime + sound.duration);
	} else {
		oscillator.frequency.setValueAtTime(sound.frequency, context.currentTime);
		oscillator.type = sound.type;
		gainNode.gain.setValueAtTime(0.1, context.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + sound.duration);
	}

	oscillator.start();
	oscillator.stop(context.currentTime + sound.duration);
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

// Achievement system
const checkAchievements = (streak: number, totalSolved: number): Achievement[] => {
	const achievements: Achievement[] = [
		{ id: "first-solve", title: "First Success", description: "Solved your first riddle!", icon: "Target", unlocked: totalSolved >= 1 },
		{ id: "streak-3", title: "Getting Warmed Up", description: "3-day solving streak!", icon: "Flame", unlocked: streak >= 3 },
		{ id: "streak-7", title: "Week Warrior", description: "7-day solving streak!", icon: "Zap", unlocked: streak >= 7 },
		{ id: "streak-30", title: "Monthly Master", description: "30-day solving streak!", icon: "Crown", unlocked: streak >= 30 },
		{ id: "total-10", title: "Riddle Rookie", description: "Solved 10 riddles!", icon: "Star", unlocked: totalSolved >= 10 },
		{ id: "total-50", title: "Puzzle Pro", description: "Solved 50 riddles!", icon: "Gem", unlocked: totalSolved >= 50 },
		{ id: "total-100", title: "Riddle Master", description: "Solved 100 riddles!", icon: "Trophy", unlocked: totalSolved >= 100 },
	];

	return achievements.filter((a) => a.unlocked);
};

function MobileShare({ config }: { config: ShareConfig }) {
	const handleFacebookShare = () => {
		const shareUrl = encodeURIComponent(config.url);
		const shareText = encodeURIComponent(config.title);

		// Try to open Facebook app first, fallback to web
		const facebookAppUrl = `fb://facewebmodal/f?href=${shareUrl}`;
		const facebookWebUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}&hashtag=%23DailyRiddles`;

		// Check if we're on mobile
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		if (isMobile) {
			// Try to open Facebook app
			window.location.href = facebookAppUrl;
			// Fallback to web after a delay if app doesn't open
			setTimeout(() => {
				window.open(facebookWebUrl, "_blank", "noopener,noreferrer");
			}, 1000);
		} else {
			window.open(facebookWebUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleTwitterShare = () => {
		const shareText = encodeURIComponent(config.title);
		const shareUrl = encodeURIComponent(config.url);
		const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
		window.open(twitterUrl, "_blank", "noopener,noreferrer");
	};

	const handleWhatsAppShare = () => {
		const shareText = encodeURIComponent(`${config.title} ${config.url}`);
		const whatsappUrl = `https://wa.me/?text=${shareText}`;
		window.open(whatsappUrl, "_blank", "noopener,noreferrer");
	};

	const handleEmailShare = () => {
		const subject = encodeURIComponent(config.title);
		const body = encodeURIComponent(`${config.description}\n\n${config.url}`);
		const emailUrl = `mailto:?subject=${subject}&body=${body}`;
		window.location.href = emailUrl;
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
					<Share2 className="w-5 h-5 mr-2" />
					Share Your Results
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border-border">
				<DialogHeader>
					<DialogTitle className="text-foreground">Share with your friends</DialogTitle>
					<DialogDescription className="text-muted-foreground">Choose a platform to share your success.</DialogDescription>
				</DialogHeader>
				<div className="py-4 space-y-3">
					<Button onClick={handleFacebookShare} className="w-full justify-start bg-[#1877F2] hover:bg-[#166FE5] text-white">
						<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
						Share on Facebook
					</Button>
					<Button onClick={handleTwitterShare} className="w-full justify-start bg-[#1DA1F2] hover:bg-[#1A91DA] text-white">
						<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
							<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
						</svg>
						Share on Twitter
					</Button>
					<Button onClick={handleWhatsAppShare} className="w-full justify-start bg-[#25D366] hover:bg-[#22C55E] text-white">
						<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
						</svg>
						Share on WhatsApp
					</Button>
					<Button onClick={handleEmailShare} className="w-full justify-start bg-gray-600 hover:bg-gray-700 text-white">
						<svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
						</svg>
						Share via Email
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
	const icons: { [key: string]: React.ElementType } = {
		Target,
		Flame,
		Zap,
		Crown,
		Star,
		Gem,
		Trophy,
	};
	const IconComponent = icons[achievement.icon];

	return (
		<div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
			{IconComponent && <IconComponent className="w-5 h-5 text-yellow-500" />}
			<div>
				<div className="text-sm font-medium text-foreground">{achievement.title}</div>
				<div className="text-xs text-muted-foreground">{achievement.description}</div>
			</div>
		</div>
	);
}

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

function IntegratedSubmitInput({ value, onChange, disabled, onVoiceInput }: { value: string; onChange: (value: string) => void; disabled: boolean; onVoiceInput: (text: string) => void }) {
	const { pending } = useFormStatus();
	const inputRef = useRef<HTMLInputElement>(null);
	const { isListening, isSupported, startListening } = useVoiceInput(onVoiceInput);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (value.trim() && !disabled && !pending) {
				inputRef.current?.closest("form")?.requestSubmit();
			}
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
			const form = inputRef.current?.closest("form");
			if (form) {
				const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
				form.dispatchEvent(submitEvent);
			}
		}
	};

	const handleVoiceClick = () => {
		playSound("click");
		triggerHaptic("light");
		startListening();
	};

	return (
		<div className="relative group">
			<Input
				ref={inputRef}
				name="answer"
				placeholder="Type your answer..."
				required
				value={value}
				onKeyDown={handleKeyDown}
				onChange={handleChange}
				disabled={disabled || pending}
				className="w-full h-12 px-12 pr-24 text-base bg-background border-2 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-300"
				autoComplete="off"
				inputMode="text"
				style={{ fontSize: "16px" }}
			/>

			<div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
				{isSupported && (
					<Button type="button" variant="ghost" size="icon" onClick={handleVoiceClick} disabled={disabled || pending} className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
						{isListening ? <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" /> : <Mic className="w-4 h-4" />}
					</Button>
				)}
			</div>

			<Button type="button" onClick={handleButtonClick} disabled={disabled || pending || !value.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 px-4 flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100">
				{pending ? <div className="w-3 h-3 border border-background/30 border-t-background rounded-full animate-spin" /> : "Submit"}
			</Button>
		</div>
	);
}

IntegratedSubmitInput.displayName = "IntegratedSubmitInput";

function CompletionState({ streak, totalSolved, nickname, onShowArchive, feedback, riddleText }: { streak: number; totalSolved: number; nickname: string; onShowArchive: () => void; feedback: string; riddleText: string }) {
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
			const diff = midnight.getTime() - now.getTime();
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);
			setTimeLeft(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
		};

		calculateTimeLeft();
		const timer = setInterval(calculateTimeLeft, 1000);
		return () => clearInterval(timer);
	}, []);

	const achievements = checkAchievements(streak, totalSolved);
	const isMobile = useIsMobile();

	const shareUrl = typeof window !== "undefined" ? window.location.href : "";
	const shareConfig: ShareConfig = {
		alignment: "center",
		color: "social",
		enabled: true,
		font_size: 16,
		labels: "cta",
		language: "en",
		min_count: 0,
		networks: ["facebook", "twitter", "whatsapp", "reddit", "email"],
		padding: 12,
		radius: 8,
		show_total: false,
		show_mobile: true,
		show_toggle: false,
		size: 48,
		url: shareUrl,
		title: `I solved today's riddle! Can you?\n\nRiddle:\n${riddleText}`,
		description: "Challenge your mind with a new riddle every day.",
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="w-full max-w-2xl mx-auto space-y-6 py-8">
			<div className="p-6 sm:p-8 bg-gradient-to-br from-green-500/10 via-background to-background rounded-2xl border border-green-500/20 shadow-2xl shadow-green-500/10 text-center space-y-6 relative overflow-hidden">
				<div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-green-500/20 rounded-full filter blur-3xl" />
				<div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full filter blur-3xl" />

				<motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }} className="relative z-10">
					<Award className="w-16 h-16 text-green-400 mx-auto bg-green-500/10 p-3 rounded-full" />
				</motion.div>

				<h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 relative z-10">Riddle Solved!</h2>
				<p className="text-muted-foreground text-lg relative z-10">
					Well done, <span className="font-semibold text-foreground">{nickname}</span>!
				</p>

				<div className="text-center bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-700 dark:text-green-300 relative z-10">
					<p className="text-sm font-medium">{feedback}</p>
				</div>

				{/* Stats */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center relative z-10">
					<div className="p-4 bg-background/50 rounded-lg border border-border/50">
						<div className="text-2xl font-bold">{streak}</div>
						<div className="text-sm text-muted-foreground">Current Streak</div>
					</div>
					<div className="p-4 bg-background/50 rounded-lg border border-border/50">
						<div className="text-2xl font-bold">{totalSolved}</div>
						<div className="text-sm text-muted-foreground">Total Solved</div>
					</div>
					<div className="p-4 bg-background/50 rounded-lg border border-border/50">
						<div className="text-2xl font-bold">{timeLeft}</div>
						<div className="text-sm text-muted-foreground">Next Riddle</div>
					</div>
				</motion.div>

				{/* Achievements */}
				{achievements.length > 0 && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3 relative z-10">
						<h3 className="text-lg font-semibold text-left">Your Achievements</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{achievements.map((ach, i) => (
								<motion.div key={ach.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
									<AchievementBadge achievement={ach} />
								</motion.div>
							))}
						</div>
					</motion.div>
				)}

				{/* Share */}
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-4 relative z-10">
					{isMobile ? <MobileShare config={shareConfig} /> : <InlineShareButtons config={shareConfig} />}
				</motion.div>
			</div>

			<div className="text-center">
				<Button onClick={onShowArchive} variant="ghost" className="text-muted-foreground hover:text-foreground">
					<RotateCcw className="w-4 h-4 mr-2" />
					Practice in the Riddle Archive
				</Button>
			</div>
		</motion.div>
	);
}

function LoadingOverlay() {
	const { pending } = useFormStatus();

	return (
		<AnimatePresence>
			{pending && (
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="text-center">
						<div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
						<p className="text-muted-foreground font-medium animate-pulse">Checking your answer...</p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default function DailyRiddleGame({ initialRiddle, allRiddles }: { initialRiddle: Riddle; allRiddles: Riddle[] }) {
	const [state, formAction] = useActionState<FormState, FormData>(submitAnswer, null);
	const [answerInput, setAnswerInput] = useState("");
	const [feedback, setFeedback] = useState<Feedback>(null);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [showArchive, setShowArchive] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const formRef = useRef<HTMLFormElement>(null);

	// Stats state
	const [nickname, setNickname] = useState("Riddler");
	const [streak, setStreak] = useState(0);
	const [totalSolved, setTotalSolved] = useState(0);
	const [attempts, setAttempts] = useState(0);
	const [lastSolvedDate, setLastSolvedDate] = useState<string | null>(null);
	const [isEditingNickname, setIsEditingNickname] = useState(false);
	const [nicknameSaved, setNicknameSaved] = useState(false);
	const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<Achievement[]>([]);

	// Share config
	const shareUrl = typeof window !== "undefined" ? window.location.href : "";
	const shareConfig: ShareConfig = {
		alignment: "center",
		color: "social",
		enabled: true,
		font_size: 16,
		labels: "cta",
		language: "en",
		min_count: 0,
		networks: ["facebook", "twitter", "whatsapp", "reddit", "email"],
		padding: 12,
		radius: 8,
		show_total: false,
		show_mobile: true,
		show_toggle: false,
		size: 48,
		url: shareUrl,
		title: `I solved today's riddle! Can you?\n\nRiddle:\n${initialRiddle.riddle}`,
		description: "Challenge your mind with a new riddle every day.",
	};

	useEffect(() => {
		const init = () => {
			if (typeof window !== "undefined") {
				setIsLoading(true);
				// Load stats
				const savedNickname = localStorage.getItem("riddle-nickname");
				if (savedNickname) setNickname(savedNickname);

				const savedLastSolved = localStorage.getItem("riddle-last-solved");
				const today = new Date().toISOString().split("T")[0];
				const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

				const currentStreak = parseInt(localStorage.getItem("riddle-streak") || "0", 10);
				const savedAttemptsDate = localStorage.getItem("riddle-attempts-date");
				if (savedLastSolved === today) {
					setIsCorrect(true);
					setStreak(currentStreak);
				} else if (savedLastSolved !== yesterday) {
					localStorage.setItem("riddle-streak", "0");
					setStreak(0);
				} else {
					setStreak(currentStreak);
				}

				if (savedAttemptsDate === today) {
					setAttempts(parseInt(localStorage.getItem("riddle-attempts") || "0", 10));
				} else {
					localStorage.setItem("riddle-attempts", "0");
					localStorage.setItem("riddle-attempts-date", today);
					setAttempts(0);
				}

				setLastSolvedDate(savedLastSolved);
				setTotalSolved(parseInt(localStorage.getItem("riddle-total") || "0", 10));

				// Sound context & animations
				initAudioContext();
				const style = document.createElement("style");
				style.id = "riddle-animations";
				style.textContent = `
          @keyframes sway {
            from { transform: translateX(-5px) rotate(-1deg); }
            to { transform: translateX(5px) rotate(1deg); }
          }
        `;
				if (!document.getElementById("riddle-animations")) {
					document.head.appendChild(style);
				}

				setIsLoading(false);
			}
		};
		init();
	}, []);

	const handleAnswerChange = (value: string) => {
		setAnswerInput(value);
		setFeedback(null); // Clear feedback when user types
	};

	const handleVoiceInput = (text: string) => {
		setAnswerInput(text);
	};

	useEffect(() => {
		if (state) {
			setAttempts((prev) => {
				const newAttempts = prev + 1;
				localStorage.setItem("riddle-attempts", newAttempts.toString());
				return newAttempts;
			});

			setFeedback({ message: state.feedback, type: state.status });
			if (state.status === "correct") {
				playSound("correct");
				triggerHaptic("medium");

				const today = new Date().toISOString().split("T")[0];
				if (lastSolvedDate !== today) {
					const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

					setStreak((prevStreak) => {
						setTotalSolved((prevTotal) => {
							const oldAchievements = checkAchievements(prevStreak, prevTotal);
							const newStreak = lastSolvedDate === yesterday ? prevStreak + 1 : 1;
							const newTotal = prevTotal + 1;
							const newAchievements = checkAchievements(newStreak, newTotal);
							const unlocked = newAchievements.filter((a) => !oldAchievements.some((oa) => oa.id === a.id));
							setNewlyUnlockedAchievements(unlocked);

							localStorage.setItem("riddle-streak", newStreak.toString());
							localStorage.setItem("riddle-total", newTotal.toString());
							localStorage.setItem("riddle-last-solved", today);

							return newTotal;
						});
						return lastSolvedDate === yesterday ? prevStreak + 1 : 1;
					});

					setLastSolvedDate(today);
				}
				setTimeout(() => setIsCorrect(true), 500); // Delay for feedback visibility
				createConfetti();
				playSound("swoosh");
			} else if (state.status === "close") {
				playSound("close");
				triggerHaptic("light");
			} else {
				playSound("incorrect");
				triggerHaptic("heavy");
			}
		}
	}, [state, lastSolvedDate || ""]);

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

	const handleShowArchive = () => {
		setShowArchive(true);
		playSound("click");
		triggerHaptic("light");
	};

	const handleExitArchive = () => {
		setShowArchive(false);
		playSound("click");
		triggerHaptic("light");
	};

	const isMobile = useIsMobile();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
					<p className="text-muted-foreground font-medium animate-pulse">Loading your daily riddle...</p>
				</div>
			</div>
		);
	}

	if (showArchive) {
		const practiceRiddles = allRiddles.map((r) => ({ riddle: r.riddle, answer: "" }));
		return <RiddleArchive allRiddles={practiceRiddles} dailyRiddle={initialRiddle} onExit={handleExitArchive} />;
	}

	return (
		<TooltipProvider>
			<div className="relative min-h-screen">
				{/* Top Bar with Stats and Theme Toggle */}
				<div className="flex items-start justify-between mb-8 sm:mb-12 lg:mb-16">
					{/* Stats */}
					<div className="flex items-center gap-2 sm:gap-4 text-sm">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="text-center cursor-pointer hover:scale-105 transition-transform duration-200 group" onClick={() => !isEditingNickname && setIsEditingNickname(true)}>
									{isEditingNickname ? (
										<Input type="text" value={nickname} onChange={handleNicknameChange} onBlur={handleNicknameSave} onKeyDown={handleNicknameKeyDown} className="w-24 h-8 text-center bg-transparent border-b-2" style={{ fontSize: "16px" }} />
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
								<p>Your current daily solving streak.</p>
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
								<p>Total riddles solved.</p>
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
								<p>Your attempts for today&apos;s riddle.</p>
							</TooltipContent>
						</Tooltip>

						{!isCorrect && (
							<>
								<div className="w-px h-6 bg-border" />
								<Button onClick={handleShowArchive} variant="ghost" size="sm" className="hidden sm:inline-flex">
									<RotateCcw className="w-4 h-4 mr-2" />
									Practice
								</Button>
							</>
						)}
					</div>

					{/* Controls */}
					<div className="flex items-center gap-2">
						{!isCorrect && !isMobile && (
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm">
										<Share2 className="w-4 h-4 mr-2" />
										Share
									</Button>
								</DialogTrigger>
								<DialogContent className="bg-white dark:bg-gray-900 border-border">
									<DialogHeader>
										<DialogTitle className="text-foreground">Share this riddle</DialogTitle>
										<DialogDescription className="text-muted-foreground">Challenge your friends with today&apos;s riddle!</DialogDescription>
									</DialogHeader>
									<div className="py-4">
										<InlineShareButtons config={shareConfig} />
									</div>
								</DialogContent>
							</Dialog>
						)}
						<ThemeToggle />
					</div>
				</div>

				{/* Newly Unlocked Achievements */}
				<AnimatePresence>
					{newlyUnlockedAchievements.length > 0 && (
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mb-6 space-y-2">
							<h3 className="text-sm font-medium text-center text-yellow-500">New Achievement Unlocked!</h3>
							<div className="flex flex-wrap justify-center gap-2">
								{newlyUnlockedAchievements.map((ach) => (
									<AchievementBadge key={ach.id} achievement={ach} />
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Main Content */}
				<div className="relative max-w-2xl mx-auto">
					<AnimatePresence mode="wait">
						{isCorrect ? (
							<motion.div key="completion">
								<CompletionState streak={streak} totalSolved={totalSolved} nickname={nickname} onShowArchive={handleShowArchive} feedback={state?.feedback || ""} riddleText={initialRiddle.riddle} />
							</motion.div>
						) : (
							<motion.div key="riddle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 sm:space-y-12">
								{/* Riddle Text */}
								<div className="text-center space-y-4 sm:space-y-6">
									<div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
										<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground leading-relaxed text-balance hover:text-foreground/80 transition-colors duration-300">{initialRiddle.riddle}</p>
									</div>
								</div>

								{/* Answer Form */}
								<div className={cn("max-w-md mx-auto space-y-4 sm:space-y-6")}>
									<form
										action={(formData) => {
											setFeedback(null);
											formAction(formData);
										}}
										ref={formRef}
										className="w-full max-w-2xl relative"
									>
										<input type="hidden" name="riddleAnswer" value={initialRiddle.answer} />
										<input type="hidden" name="riddleText" value={initialRiddle.riddle} />

										<div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
											<IntegratedSubmitInput value={answerInput} onChange={handleAnswerChange} disabled={!!isCorrect} onVoiceInput={handleVoiceInput} />
										</div>
										<LoadingOverlay />
									</form>
									<AnimatePresence>
										<FeedbackMessage feedback={feedback} />
									</AnimatePresence>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{isMobile && !isCorrect && (
					<div className="mt-8 flex justify-center">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">
									<Share2 className="w-4 h-4 mr-2" /> Share
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-white dark:bg-gray-900 border-border">
								<DialogHeader>
									<DialogTitle className="text-foreground">Share this riddle</DialogTitle>
									<DialogDescription className="text-muted-foreground">Challenge your friends with today&apos;s riddle!</DialogDescription>
								</DialogHeader>
								<div className="py-4">
									<InlineShareButtons config={shareConfig} />
								</div>
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>
		</TooltipProvider>
	);
}
