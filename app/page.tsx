import { getDailyRiddle } from "./actions";
import { DailyRiddleGame } from "./daily-riddle-game";

export default async function Home() {
	const riddle = await getDailyRiddle();

	return (
		<main className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-6 py-8">
				<DailyRiddleGame initialRiddle={riddle} />
			</div>
		</main>
	);
}
