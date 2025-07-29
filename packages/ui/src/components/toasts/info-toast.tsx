import type { CustomToastProps } from "@trackyrs/ui/components/toasts/custom-toast-props";
import { InfoIcon } from "lucide-react";

export function InfoToast({ message }: CustomToastProps) {
	return (
		<div className="w-full rounded-md border bg-background px-4 py-3 text-foreground shadow-lg sm:w-[var(--width)]">
			<div className="flex gap-2">
				<p className="grow text-sm">
					<InfoIcon
						className="-mt-0.5 me-3 inline-flex text-blue-500"
						size={16}
						aria-hidden="true"
					/>
					{message}
				</p>
			</div>
		</div>
	);
}
