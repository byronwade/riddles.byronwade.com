import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://riddles.byronwade.com";
	const currentDate = new Date();

	return [
		{
			url: baseUrl,
			lastModified: currentDate,
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/#game`,
			lastModified: currentDate,
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/#achievements`,
			lastModified: currentDate,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/#stats`,
			lastModified: currentDate,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/#faq`,
			lastModified: currentDate,
			changeFrequency: "monthly",
			priority: 0.7,
		},
	];
}
