import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
	width: 32,
	height: 32,
};
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 24,
					background: "#0a0a0a",
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#fafafa",
					borderRadius: "8px",
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
					<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
					<path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
					<path d="M12 12h.01" />
				</svg>
			</div>
		),
		{
			...size,
		}
	);
}
