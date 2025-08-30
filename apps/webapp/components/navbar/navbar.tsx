"use client";

import { Button } from "@trackyrs/ui/components/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@trackyrs/ui/components/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@trackyrs/ui/components/popover";
import { cn } from "@trackyrs/ui/lib/utils";
import { BookOpenIcon, InfoIcon, LifeBuoyIcon, Menu } from "lucide-react";
import Image from "next/image";
import GlobalSearch from "@/components/navbar/global-search";
import { navigationLinks } from "@/components/navbar/navigation-links";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<header className="border-b px-4 md:px-12">
			<div className="flex h-16 items-center justify-between gap-4 md:mx-auto md:max-w-[85%]">
				{/* Left side */}
				<div className="flex items-center gap-2">
					{/* Mobile menu trigger */}
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className="group size-8 md:hidden"
								variant="ghost"
								size="icon"
								aria-label="Open navigation menu"
							>
								<Menu className="size-6" />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-64 p-1 md:hidden">
							<NavigationMenu className="max-w-none *:w-full">
								<NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
									{navigationLinks.map((link, index) => (
										<NavigationMenuItem
											key={`nav-${link.label.toLowerCase()}`}
											className="w-full"
										>
											{link.submenu ? (
												<>
													<div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
														{link.label}
													</div>
													<ul>
														{link.items.map((item) => (
															<li
																key={`${link.label.toLowerCase()}-${item.label.toLowerCase()}`}
															>
																<NavigationMenuLink
																	href={item.href}
																	className="py-1.5"
																>
																	{item.label}
																</NavigationMenuLink>
															</li>
														))}
													</ul>
												</>
											) : null}
											{index < navigationLinks.length - 1 &&
												((!link.submenu &&
													navigationLinks[index + 1]?.submenu) ||
													(link.submenu &&
														!navigationLinks[index + 1]?.submenu) ||
													(link.submenu &&
														navigationLinks[index + 1]?.submenu &&
														link.type !==
															navigationLinks[index + 1]?.type)) && (
													<div className="-mx-1 my-1 h-px w-full bg-border" />
												)}
										</NavigationMenuItem>
									))}
								</NavigationMenuList>
							</NavigationMenu>
						</PopoverContent>
					</Popover>
					{/* Main nav */}
					<div className="flex items-center gap-6">
						<a
							href="/"
							className="text-primary hover:text-primary/90 max-md:hidden"
							aria-label="Home"
						>
							<Image
								className="dark:invert"
								src="/logo.webp"
								alt="Home"
								width={32}
								height={32}
							/>
						</a>
						{/* Navigation menu */}
						<NavigationMenu viewport={false} className="max-md:hidden">
							<NavigationMenuList className="gap-2">
								{navigationLinks.map((link) => (
									<NavigationMenuItem key={`nav-${link.label.toLowerCase()}`}>
										<>
											<NavigationMenuTrigger className="*:[svg]:-me-0.5 bg-transparent px-2 py-1.5 font-medium text-muted-foreground hover:text-primary *:[svg]:size-3.5">
												{link.label}
											</NavigationMenuTrigger>
											<NavigationMenuContent className="data-[motion=from-end]:slide-in-from-right-16! data-[motion=from-start]:slide-in-from-left-16! data-[motion=to-end]:slide-out-to-right-16! data-[motion=to-start]:slide-out-to-left-16! z-50 p-1">
												<ul
													className={cn(
														link.type === "description"
															? "min-w-64"
															: "min-w-48",
													)}
												>
													{link.items.map((item) => (
														<li
															key={`${link.label.toLowerCase()}-${item.label.toLowerCase()}`}
														>
															<NavigationMenuLink
																href={item.href}
																className="py-1.5"
															>
																{/* Display icon if present */}
																{link.type === "icon" && "icon" in item && (
																	<div className="flex items-center gap-2">
																		{item.icon === "BookOpenIcon" && (
																			<BookOpenIcon
																				size={16}
																				className="text-foreground opacity-60"
																				aria-hidden="true"
																			/>
																		)}
																		{item.icon === "LifeBuoyIcon" && (
																			<LifeBuoyIcon
																				size={16}
																				className="text-foreground opacity-60"
																				aria-hidden="true"
																			/>
																		)}
																		{item.icon === "InfoIcon" && (
																			<InfoIcon
																				size={16}
																				className="text-foreground opacity-60"
																				aria-hidden="true"
																			/>
																		)}
																		<span>{item.label}</span>
																	</div>
																)}
																{link.type === "description" &&
																"description" in item ? (
																	<div className="space-y-1">
																		<div className="font-medium">
																			{item.label}
																		</div>
																		<p className="line-clamp-2 text-muted-foreground text-xs">
																			{item.description as string}
																		</p>
																	</div>
																) : (
																	!link.type ||
																	(link.type !== "icon" &&
																		link.type !== "description" && (
																			<span>{item.label}</span>
																		))
																)}
															</NavigationMenuLink>
														</li>
													))}
												</ul>
											</NavigationMenuContent>
										</>
									</NavigationMenuItem>
								))}
							</NavigationMenuList>
						</NavigationMenu>
					</div>
				</div>
				{/* Right side */}
				<div className="flex items-center gap-2">
					<GlobalSearch />
					{isPending ? (
						<div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
					) : session ? (
						<UserMenu user={session.user} />
					) : (
						<>
							<Button asChild variant="ghost" className="text-sm">
								<a href="/login">Log in</a>
							</Button>
							<Button asChild className="text-sm">
								<a href="/register">Sign up</a>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
