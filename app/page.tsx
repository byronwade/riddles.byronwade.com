import { getDailyRiddle } from "./actions";
import DailyRiddleGame from "./daily-riddle-game";

export default async function Home() {
	const riddle = await getDailyRiddle();

	return (
		<>
			{/* Skip to main content for accessibility */}
			<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
				Skip to main content
			</a>

			<main id="main-content" className="min-h-screen bg-background" role="main">
				<div className="max-w-4xl mx-auto px-6 py-8">
					{/* Hidden SEO content */}
					<div className="sr-only">
						<h1>Daily Riddles - Free Brain Teasers and Puzzles</h1>
						<p>Challenge your mind with our daily riddle game. New brain teasers every day at midnight. No registration required - start solving puzzles now!</p>
						<nav aria-label="Main navigation">
							<ul>
								<li>
									<a href="#game">Play Today&apos;s Riddle</a>
								</li>
								<li>
									<a href="#achievements">View Achievements</a>
								</li>
								<li>
									<a href="#stats">Check Statistics</a>
								</li>
							</ul>
						</nav>
					</div>

					{/* Game Section */}
					<section id="game" aria-labelledby="game-heading">
						<h2 id="game-heading" className="sr-only">
							Today&apos;s Daily Riddle Challenge
						</h2>
						<DailyRiddleGame initialRiddle={riddle} />
					</section>

					{/* Hidden FAQ for SEO */}
					<section id="faq" className="sr-only" aria-labelledby="faq-heading">
						<h2 id="faq-heading">Frequently Asked Questions</h2>
						<div itemScope itemType="https://schema.org/FAQPage">
							<div itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
								<h3 itemProp="name">How often are new riddles added?</h3>
								<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
									<p itemProp="text">A new riddle is automatically added every day at midnight. You can solve one riddle per day.</p>
								</div>
							</div>
							<div itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
								<h3 itemProp="name">Is Daily Riddles free to use?</h3>
								<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
									<p itemProp="text">Yes, Daily Riddles is completely free to use. No registration, subscription, or payment required.</p>
								</div>
							</div>
							<div itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
								<h3 itemProp="name">Can I play on mobile devices?</h3>
								<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
									<p itemProp="text">Yes, Daily Riddles works perfectly on all devices including smartphones, tablets, and desktop computers.</p>
								</div>
							</div>
							<div itemScope itemType="https://schema.org/Question" itemProp="mainEntity">
								<h3 itemProp="name">Do I need to create an account?</h3>
								<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
									<p itemProp="text">No account creation is required. Your progress is saved locally on your device.</p>
								</div>
							</div>
						</div>
					</section>

					{/* Hidden content for SEO keywords */}
					<section className="sr-only" aria-labelledby="features-heading">
						<h2 id="features-heading">Brain Training Features</h2>
						<ul>
							<li>Daily brain teasers and logic puzzles</li>
							<li>Achievement system with streak tracking</li>
							<li>Voice input for hands-free solving</li>
							<li>Progressive hints for challenging riddles</li>
							<li>Mobile-friendly responsive design</li>
							<li>Dark and light theme support</li>
							<li>Offline capability for continuous play</li>
							<li>No ads or registration required</li>
						</ul>
					</section>

					{/* Keywords for SEO */}
					<div className="sr-only">
						<p>Brain games, mental fitness, IQ test, word puzzles, lateral thinking, critical thinking, problem solving, cognitive training, mind benders, trivia, quiz games, mental agility, intelligence test, puzzle solving, thinking games, brain exercise, educational games, family friendly, free games, online puzzles</p>
					</div>
				</div>
			</main>
		</>
	);
}
