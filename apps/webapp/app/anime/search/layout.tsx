import type { Metadata } from "next";

export const metadata: Metadata = { title: "Anime Search" };

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
