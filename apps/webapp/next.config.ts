import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@trackyrs/ui"],
	images: {
		remotePatterns: [new URL("https://cdn.myanimelist.net/**")],
	},
};

export default nextConfig;
