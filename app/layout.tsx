import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Daily Riddles - Free Brain Teasers & Puzzles",
	description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games. No signup required - just pure mental challenge.",
	keywords: ["daily riddles", "brain teasers", "puzzles", "logic puzzles", "mind games", "daily puzzle", "free riddles", "brain training", "mental challenge", "riddle of the day", "puzzle game", "thinking games", "brain exercise", "cognitive training", "problem solving"],
	authors: [{ name: "Daily Riddles" }],
	creator: "Daily Riddles",
	publisher: "Daily Riddles",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL("https://riddles.byronwade.com"),
	alternates: {
		canonical: "/",
	},
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 5,
		userScalable: true,
	},
	openGraph: {
		title: "Daily Riddles - Free Brain Teasers & Puzzles",
		description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games.",
		url: "https://riddles.byronwade.com",
		siteName: "Daily Riddles",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Daily Riddles - Challenge Your Mind",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Daily Riddles - Free Brain Teasers & Puzzles",
		description: "Challenge your mind with a new riddle every day. Free daily brain teasers and puzzles.",
		images: ["/og-image.jpg"],
		creator: "@dailyriddles",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "your-google-verification-code",
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "Daily Riddles",
		"application-name": "Daily Riddles",
		"msapplication-TileColor": "#2563eb",
		"msapplication-config": "/browserconfig.xml",
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
									description: "Challenge your mind with a new riddle every day. Free daily brain teasers, logic puzzles, and mind games.",
									url: "https://riddles.byronwade.com",
									inLanguage: "en-US",
									potentialAction: {
										"@type": "SearchAction",
										target: {
											"@type": "EntryPoint",
											urlTemplate: "https://riddles.byronwade.com/?q={search_term_string}",
										},
										"query-input": "required name=search_term_string",
									},
								},
								{
									"@type": "Organization",
									"@id": "https://riddles.byronwade.com/#organization",
									name: "Daily Riddles",
									url: "https://riddles.byronwade.com",
									description: "Providing free daily brain teasers and puzzles to challenge minds worldwide.",
									foundingDate: "2024",
									sameAs: ["https://twitter.com/dailyriddles"],
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
									inLanguage: "en-US",
									datePublished: "2024-01-01",
									dateModified: new Date().toISOString().split("T")[0],
								},
								{
									"@type": "Game",
									"@id": "https://riddles.byronwade.com/#game",
									name: "Daily Riddles Game",
									description: "A daily brain teaser game featuring new riddles every day at midnight.",
									url: "https://riddles.byronwade.com",
									gameItem: {
										"@type": "Thing",
										name: "Daily Riddle",
										description: "A new challenging riddle released every day at midnight.",
									},
									numberOfPlayers: "1",
									genre: ["Puzzle", "Brain Teaser", "Logic Game"],
									gamePlatform: ["Web Browser", "Mobile", "Desktop"],
									operatingSystem: ["Any"],
									applicationCategory: "Game",
									isAccessibleForFree: true,
								},
							],
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
