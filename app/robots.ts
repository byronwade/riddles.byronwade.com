import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/admin/", "/_next/", "/private/"],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				disallow: ["/api/", "/admin/", "/_next/", "/private/"],
			},
			{
				userAgent: "Bingbot",
				allow: "/",
				disallow: ["/api/", "/admin/", "/_next/", "/private/"],
			},
		],
		sitemap: "https://riddles.byronwade.com/sitemap.xml",
		host: "https://riddles.byronwade.com",
	};
}
