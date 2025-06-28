import fs from "fs/promises";
import path from "path";

const RIDDLE_COUNT = 366;
const API_URL = "https://riddles-api.vercel.app/random";
const OUTPUT_PATH = path.join(process.cwd(), "lib/riddles.json");

async function fetchRiddle() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to fetch riddle:", error);
		return null;
	}
}

async function main() {
	console.log(`Fetching ${RIDDLE_COUNT} unique riddles. This may take a few minutes...`);
	const riddles = [];
	const existingRiddles = new Set();

	while (riddles.length < RIDDLE_COUNT) {
		const riddle = await fetchRiddle();
		if (riddle && riddle.riddle && !existingRiddles.has(riddle.riddle)) {
			riddles.push(riddle);
			existingRiddles.add(riddle.riddle);
			process.stdout.write(`\rFetched riddle ${riddles.length}/${RIDDLE_COUNT}`);
		}
		// Add a small delay to be kind to the API
		await new Promise((resolve) => setTimeout(resolve, 200));
	}

	process.stdout.write("\n");
	console.log("All riddles fetched. Saving to file...");

	try {
		await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
		await fs.writeFile(OUTPUT_PATH, JSON.stringify(riddles, null, 2));
		console.log(`Successfully saved ${riddles.length} riddles to ${OUTPUT_PATH}`);
	} catch (error) {
		console.error("Failed to save riddles:", error);
	}
}

main();
