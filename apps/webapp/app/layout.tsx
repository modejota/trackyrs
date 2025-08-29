import "@trackyrs/ui/globals.css";

import { Toaster } from "@trackyrs/ui/components/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/navbar/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/providers";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL("https://trackyrs.app"),
	title: {
		default: "Trackyrs",
		template: "Trackyrs | %s",
	},
	description:
		"Track and discover anime and manga. Search, browse top lists, and manage your watchlist on Trackyrs.",
	applicationName: "Trackyrs",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<Navbar />
						{children}
						<Toaster />
					</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
