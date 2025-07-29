import type { CustomToastProps } from "@trackyrs/ui/components/toasts/custom-toast-props";
import { TriangleAlert } from "lucide-react";

export function WarningToast({ message }: CustomToastProps) {
	return (
		<div className="w-full rounded-md border bg-background px-4 py-3 text-foreground shadow-lg sm:w-[var(--width)]">
			<div className="flex items-start gap-2 text-sm">
				<TriangleAlert
					className="mt-0.5 text-amber-500"
					size={16}
					aria-hidden="true"
				/>
				{message}
			</div>
		</div>
	);
}
