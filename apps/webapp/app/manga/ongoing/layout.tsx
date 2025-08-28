import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ongoing Manga" };

export default function Layout({ children }: { children: React.ReactNode }) {
	return children;
}
