"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@trackyrs/ui/components/avatar";
import { Button } from "@trackyrs/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@trackyrs/ui/components/dropdown-menu";
import { capitalize } from "@trackyrs/utils/src/string";
import { LogOutIcon, UserPenIcon } from "lucide-react";
import Link from "next/link";
import { authClient, type User } from "@/lib/auth-client";

interface UserMenuProps {
	user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
	const initials = capitalize(user.displayUsername as string)[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
					<Avatar>
						<AvatarImage src={user.image as string} alt="Profile image" />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="max-w-64" align="end">
				<DropdownMenuLabel className="flex min-w-0 flex-col">
					<span className="truncate font-medium text-foreground text-sm">
						{user.displayUsername}
					</span>
					<span className="truncate font-normal text-muted-foreground text-xs">
						{user.email}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href={`/profile/${user.username}`}>
							<UserPenIcon
								size={16}
								className="opacity-60"
								aria-hidden="true"
							/>
							<span>My Profile</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={() => void authClient.signOut()}>
					<LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
					<span>Logout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
