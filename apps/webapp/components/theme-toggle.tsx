"use client";

import { Switch } from "@trackyrs/ui/components/switch";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useId, useState } from "react";

export default function ThemeToggle() {
	const id = useId();
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [checked, setChecked] = useState(false);

	useEffect(() => setMounted(true), []);
	useEffect(() => {
		setChecked(resolvedTheme === "light");
	}, [resolvedTheme]);

	if (!mounted) return null;

	const toggleSwitch = () => {
		const next = !checked;
		setChecked(next);
		setTheme(next ? "light" : "dark");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			toggleSwitch();
		}
	};

	return (
		<div
			className="group inline-flex items-center gap-2"
			data-state={checked ? "checked" : "unchecked"}
		>
			<button
				type="button"
				id={`${id}-off`}
				className="flex-1 cursor-pointer text-right font-medium text-sm transition-colors group-data-[state=checked]:text-muted-foreground/70"
				aria-controls={id}
				onClick={() => {
					setChecked(false);
					setTheme("dark");
				}}
				onKeyDown={handleKeyDown}
			>
				<MoonIcon size={16} aria-hidden="true" />
			</button>
			<Switch
				id={id}
				checked={checked}
				onCheckedChange={toggleSwitch}
				aria-labelledby={`${id}-off ${id}-on`}
				aria-label="Toggle between dark and light mode"
			/>
			<button
				type="button"
				id={`${id}-on`}
				className="flex-1 cursor-pointer text-left font-medium text-sm transition-colors group-data-[state=unchecked]:text-muted-foreground/70"
				aria-controls={id}
				onClick={() => {
					setChecked(true);
					setTheme("light");
				}}
				onKeyDown={handleKeyDown}
			>
				<SunIcon size={16} aria-hidden="true" />
			</button>
		</div>
	);
}
