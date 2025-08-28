import type { Metadata } from "next";
import ClientProfile from "@/app/profile/[username]/client";

export const metadata: Metadata = { title: "Profile" };

interface ProfilePageProps {
	params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const { username } = await params;
	return <ClientProfile username={username} />;
}
