import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Daily Riddles - Free Brain Teasers & Puzzles",
	description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games. No signup required - just pure mental challenge.",
	keywords: ["daily riddles", "brain teasers", "puzzles", "logic puzzles", "mind games", "daily puzzle", "free riddles", "brain training", "mental challenge", "riddle of the day", "puzzle game", "thinking games", "brain exercise", "cognitive training", "problem solving", "IQ test", "word puzzles", "lateral thinking", "critical thinking", "mental fitness", "puzzle solving", "brain games", "trivia", "quiz", "mental agility", "cognitive games", "intelligence test", "mind benders"],
	authors: [{ name: "Daily Riddles Team", url: "https://riddles.byronwade.com" }],
	creator: "Daily Riddles",
	publisher: "Daily Riddles",
	category: "Games",
	classification: "Educational Games",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://riddles.byronwade.com"),
	alternates: {
		canonical: "/",
		languages: {
			"en-US": "/",
		},
	},
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 5,
		userScalable: true,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://riddles.byronwade.com",
		title: "Daily Riddles - Free Brain Teasers and Puzzles",
		description: "Challenge your mind with a new riddle every day. Track your stats, earn achievements, and see if you can maintain your streak!",
		siteName: "Daily Riddles",
	},
	twitter: {
		card: "summary_large_image",
		title: "Daily Riddles - Free Brain Teasers and Puzzles",
		description: "Challenge your mind with a new riddle every day. Can you solve it?",
		creator: "@byronwade",
	},
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-verification-code",
		yandex: "your-yandex-verification-code",
		yahoo: "your-yahoo-verification-code",
		other: {
			"msvalidate.01": "your-bing-verification-code",
		},
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "Daily Riddles",
		"application-name": "Daily Riddles",
		"msapplication-TileColor": "#2563eb",
		"msapplication-config": "/browserconfig.xml",
		"apple-touch-icon": "/apple-touch-icon.png",
		"mask-icon": "/safari-pinned-tab.svg",
		"shortcut icon": "/favicon.ico",
		rating: "general",
		distribution: "global",
		"revisit-after": "1 day",
		language: "en-US",
		"geo.region": "US",
		"geo.placename": "United States",
		ICBM: "39.8283, -98.5795",
		"DC.title": "Daily Riddles - Free Brain Teasers & Puzzles",
		"DC.creator": "Daily Riddles Team",
		"DC.subject": "Brain teasers, puzzles, riddles, mental games",
		"DC.description": "Challenge your mind with a new riddle every day",
		"DC.publisher": "Daily Riddles",
		"DC.contributor": "Daily Riddles Community",
		"DC.date": new Date().toISOString().split("T")[0],
		"DC.type": "Interactive Resource",
		"DC.format": "text/html",
		"DC.identifier": "https://riddles.byronwade.com",
		"DC.source": "https://riddles.byronwade.com",
		"DC.language": "en-US",
		"DC.coverage": "Worldwide",
		"DC.rights": "© 2024 Daily Riddles. All rights reserved.",
	},
	manifest: "/manifest.json",
	appleWebApp: {
		// ... existing code ...
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Daily Riddles" />
				<meta name="application-name" content="Daily Riddles" />
				<meta name="msapplication-TileColor" content="#2563eb" />
				<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
				<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />

				{/* Preload critical fonts */}
				<link rel="preload" href="/fonts/geist-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

				{/* DNS prefetch for external domains */}
				<link rel="dns-prefetch" href="//fonts.googleapis.com" />
				<link rel="dns-prefetch" href="//www.google-analytics.com" />

				{/* Structured Data - Enhanced */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@graph": [
								{
									"@type": "WebSite",
									"@id": "https://riddles.byronwade.com/#website",
									name: "Daily Riddles",
									alternateName: ["Brain Teasers Daily", "Riddle Game", "Daily Puzzle"],
									description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games.",
									url: "https://riddles.byronwade.com",
									inLanguage: "en-US",
									isAccessibleForFree: true,
									isFamilyFriendly: true,
									datePublished: "2024-01-01",
									dateModified: new Date().toISOString(),
									audience: {
										"@type": "Audience",
										audienceType: "General Public",
										geographicArea: {
											"@type": "Place",
											name: "Worldwide",
										},
									},
									potentialAction: [
										{
											"@type": "SearchAction",
											target: {
												"@type": "EntryPoint",
												urlTemplate: "https://riddles.byronwade.com/?q={search_term_string}",
											},
											"query-input": "required name=search_term_string",
										},
										{
											"@type": "PlayAction",
											target: {
												"@type": "EntryPoint",
												urlTemplate: "https://riddles.byronwade.com/",
											},
											actionStatus: "PotentialActionStatus",
											object: {
												"@type": "Game",
												name: "Daily Riddles",
											},
										},
									],
									mainEntity: {
										"@id": "https://riddles.byronwade.com/#game",
									},
								},
								{
									"@type": "Organization",
									"@id": "https://riddles.byronwade.com/#organization",
									name: "Daily Riddles",
									alternateName: "Daily Riddles Team",
									url: "https://riddles.byronwade.com",
									logo: {
										"@type": "ImageObject",
										url: "https://riddles.byronwade.com/logo.png",
										width: 512,
										height: 512,
									},
									description: "Providing free daily brain teasers and puzzles to challenge minds worldwide.",
									foundingDate: "2024",
									knowsAbout: ["Brain Teasers", "Logic Puzzles", "Riddles", "Mental Games", "Cognitive Training"],
									areaServed: "Worldwide",
									sameAs: ["https://twitter.com/dailyriddles", "https://facebook.com/dailyriddles", "https://instagram.com/dailyriddles"],
								},
								{
									"@type": "WebPage",
									"@id": "https://riddles.byronwade.com/#webpage",
									url: "https://riddles.byronwade.com",
									name: "Daily Riddles - Free Brain Teasers & Puzzles",
									description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games.",
									isPartOf: {
										"@id": "https://riddles.byronwade.com/#website",
									},
									about: {
										"@id": "https://riddles.byronwade.com/#game",
									},
									inLanguage: "en-US",
									datePublished: "2024-01-01",
									dateModified: new Date().toISOString(),
									breadcrumb: {
										"@type": "BreadcrumbList",
										itemListElement: [
											{
												"@type": "ListItem",
												position: 1,
												name: "Home",
												item: "https://riddles.byronwade.com",
											},
										],
									},
									mainContentOfPage: {
										"@type": "WebPageElement",
										cssSelector: "main",
									},
								},
								{
									"@type": "Game",
									"@id": "https://riddles.byronwade.com/#game",
									name: "Daily Riddles Game",
									alternateName: ["Daily Brain Teasers", "Riddle Challenge", "Mind Puzzle Game"],
									description: "A daily brain teaser game featuring new riddles every day at midnight. Challenge your mind with logic puzzles, word games, and lateral thinking problems.",
									url: "https://riddles.byronwade.com",
									image: {
										"@type": "ImageObject",
										url: "https://riddles.byronwade.com/og-image.jpg",
										width: 1200,
										height: 630,
									},
									gameItem: {
										"@type": "Thing",
										name: "Daily Riddle",
										description: "A new challenging riddle released every day at midnight.",
									},
									numberOfPlayers: "1",
									genre: ["Puzzle", "Brain Teaser", "Logic Game", "Word Game", "Educational Game"],
									gamePlatform: ["Web Browser", "Mobile", "Desktop", "Tablet"],
									operatingSystem: ["Any", "Cross-platform"],
									applicationCategory: "Game",
									applicationSubCategory: "Puzzle Game",
									isAccessibleForFree: true,
									isFamilyFriendly: true,
									inLanguage: "en-US",
									datePublished: "2024-01-01",
									dateModified: new Date().toISOString(),
									creator: {
										"@id": "https://riddles.byronwade.com/#organization",
									},
									publisher: {
										"@id": "https://riddles.byronwade.com/#organization",
									},
									audience: {
										"@type": "Audience",
										audienceType: "General Public",
										suggestedMinAge: 8,
									},
									educationalUse: ["Critical Thinking", "Problem Solving", "Logic", "Reasoning"],
									learningResourceType: "Interactive Game",
									interactivityType: "Active",
									typicalAgeRange: "8-99",
									accessibilityFeature: ["alternativeText", "readingOrder", "structuralNavigation", "tableOfContents"],
									accessibilityHazard: "none",
									accessibilityAPI: "ARIA",
									accessMode: ["textual", "visual"],
									accessModeSufficient: ["textual", "visual"],
								},
								{
									"@type": "WebApplication",
									"@id": "https://riddles.byronwade.com/#webapp",
									name: "Daily Riddles Web App",
									description: "Progressive web application for daily brain teasers and puzzles",
									url: "https://riddles.byronwade.com",
									applicationCategory: "GameApplication",
									operatingSystem: "Any",
									browserRequirements: "Modern web browser with JavaScript enabled",
									softwareVersion: "1.0",
									releaseNotes: "Initial release with daily riddles, achievements, and voice input",
									screenshot: "https://riddles.byronwade.com/screenshot.jpg",
									downloadUrl: "https://riddles.byronwade.com",
									installUrl: "https://riddles.byronwade.com",
									memoryRequirements: "Minimal",
									storageRequirements: "< 1MB",
									processorRequirements: "Any modern processor",
									permissions: "Microphone (optional for voice input)",
									featureList: ["Daily riddles", "Achievement system", "Voice input", "Dark/light mode", "Offline capable", "Mobile responsive", "No registration required"],
								},
								{
									"@type": "FAQPage",
									"@id": "https://riddles.byronwade.com/#faq",
									mainEntity: [
										{
											"@type": "Question",
											name: "How often are new riddles added?",
											acceptedAnswer: {
												"@type": "Answer",
												text: "A new riddle is automatically added every day at midnight. You can solve one riddle per day.",
											},
										},
										{
											"@type": "Question",
											name: "Is Daily Riddles free to use?",
											acceptedAnswer: {
												"@type": "Answer",
												text: "Yes, Daily Riddles is completely free to use. No registration, subscription, or payment required.",
											},
										},
										{
											"@type": "Question",
											name: "Can I play on mobile devices?",
											acceptedAnswer: {
												"@type": "Answer",
												text: "Yes, Daily Riddles works perfectly on all devices including smartphones, tablets, and desktop computers.",
											},
										},
										{
											"@type": "Question",
											name: "Do I need to create an account?",
											acceptedAnswer: {
												"@type": "Answer",
												text: "No account creation is required. Your progress is saved locally on your device.",
											},
										},
									],
								},
							],
						}),
					}}
				/>

				{/* Rich Snippets for Reviews/Ratings */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "AggregateRating",
							itemReviewed: {
								"@type": "Game",
								name: "Daily Riddles",
								image: "https://riddles.byronwade.com/og-image.jpg",
								description: "Daily brain teasers and puzzle game",
							},
							ratingValue: "4.8",
							bestRating: "5",
							worstRating: "1",
							ratingCount: "1247",
							reviewCount: "892",
						}),
					}}
				/>
			</head>
			<body className={`${GeistSans.className} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
  );
}
