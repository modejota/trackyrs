import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@trackyrs/ui", "@trackyrs/utils", "@trackyrs/database"],
	images: {
		unoptimized: true,
		remotePatterns: [new URL("https://cdn.myanimelist.net/**")],
	},
};

export default nextConfig;
