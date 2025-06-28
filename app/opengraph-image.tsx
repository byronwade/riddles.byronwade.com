import { ImageResponse } from "next/og";
import { getDailyRiddle } from "@/app/actions";

export const runtime = "edge";

export const alt = "Riddles.ByronWade.com - Daily Brain Teasers";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	const riddle = await getDailyRiddle();

	const getFontSize = (text: string) => {
		const length = text.length;
		if (length > 250) return "32px";
		if (length > 200) return "38px";
		if (length > 150) return "44px";
		return "52px";
	};

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					background: "linear-gradient(135deg, #111827 0%, #0a0a0a 100%)",
					color: "#fafafa",
					fontFamily: '"Geist Sans", sans-serif',
				}}
			>
				{/* Header */}
				<div
					style={{
						width: "100%",
						display: "flex",
						alignItems: "center",
						padding: "40px 60px",
						flexShrink: 0,
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
						<path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
						<path d="M12 12h.01" />
					</svg>
					<span style={{ marginLeft: "16px", fontSize: "30px", fontWeight: 600, color: "#d4d4d8" }}>Today&apos;s Riddle</span>
				</div>

				{/* Riddle Content Area */}
				<div
					style={{
						flexGrow: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "0 80px",
						overflow: "hidden",
					}}
				>
					<p
						style={{
							fontSize: getFontSize(riddle.riddle),
							textAlign: "center",
							lineHeight: 1.4,
							overflowWrap: "break-word",
						}}
					>
						{riddle.riddle}
					</p>
				</div>

				{/* Footer */}
				<div
					style={{
						width: "100%",
						display: "flex",
						justifyContent: "flex-end",
						fontSize: "24px",
						color: "#71717a",
						padding: "40px 60px",
						flexShrink: 0,
					}}
				>
					riddles.byronwade.com
				</div>
			</div>
		),
		{
			...size,
		}
	);
}
