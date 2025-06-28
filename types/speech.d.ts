// Web Speech API types
interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
	onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
	onend: ((this: SpeechRecognition, ev: Event) => void) | null;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
	error: string;
	message: string;
}

interface SpeechRecognitionResultList {
	readonly length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	readonly length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	readonly transcript: string;
	readonly confidence: number;
}

declare const SpeechRecognition: {
	prototype: SpeechRecognition;
	new (): SpeechRecognition;
};

declare const webkitSpeechRecognition: {
	prototype: SpeechRecognition;
	new (): SpeechRecognition;
};

interface Window {
	SpeechRecognition?: typeof SpeechRecognition;
	webkitSpeechRecognition?: typeof SpeechRecognition;
}
