import type { Metadata } from "next";

export const metadata: Metadata = { title: "Seasonal Anime" };

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
