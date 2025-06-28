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

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0a0a0a",
					color: "#fafafa",
					fontFamily: '"Geist Sans", sans-serif',
					padding: "60px",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: "40px",
						left: "60px",
						display: "flex",
						alignItems: "center",
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
						<path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
						<path d="M12 12h.01" />
					</svg>
					<span style={{ marginLeft: "12px", fontSize: "32px", fontWeight: 700 }}>Daily Riddle</span>
				</div>

				<p
					style={{
						fontSize: "48px",
						textAlign: "center",
						lineHeight: 1.3,
						maxWidth: "90%",
					}}
				>
					{riddle.riddle}
				</p>

				<div
					style={{
						position: "absolute",
						bottom: "40px",
						right: "60px",
						fontSize: "24px",
						color: "#a1a1aa",
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
