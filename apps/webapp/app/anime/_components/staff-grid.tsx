import type { StaffWithRole } from "@trackyrs/database/types/anime-with-relations";
import { Badge } from "@trackyrs/ui/components/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@trackyrs/ui/components/tooltip";
import Image from "next/image";

interface StaffGridProps {
	staff: StaffWithRole[];
}

interface StaffCardProps {
	data: StaffWithRole;
	isMain: boolean;
}

function StaffCard({ data, isMain = false }: StaffCardProps) {
	const images = data.people.images;
	const positions = Array.isArray(
		(data as unknown as { positions?: string[] }).positions,
	)
		? ((data as unknown as { positions?: string[] }).positions ?? [])
		: [];
	const alternateNames = Array.isArray(data.people.nicknames)
		? data.people.nicknames
		: [];

	return (
		<div className="h-full overflow-hidden rounded-lg border bg-card shadow transition-shadow duration-200 hover:shadow-md">
			<div
				className={`relative ${isMain ? "aspect-[3/4]" : "aspect-[3/4]"} overflow-hidden`}
			>
				<Image
					src={images}
					alt={`${data.people.name || "Staff member"} - ${positions.join(", ") || "Staff member"}`}
					fill
					className="object-cover"
					sizes={
						isMain
							? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
							: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
					}
				/>
			</div>

			<div className={`${isMain ? "p-3" : "p-2"} space-y-1`}>
				<h4
					className={`font-medium leading-tight ${isMain ? "text-sm sm:text-base" : "text-xs sm:text-sm"} truncate`}
					title={data.people.name || "Unknown Staff Member"}
				>
					{data.people.name || "Unknown Staff Member"}
				</h4>

				{data.people.givenName && data.people.familyName && (
					<p
						className={`text-muted-foreground ${isMain ? "text-xs sm:text-sm" : "text-xs"} truncate`}
						title={`${data.people.givenName} ${data.people.familyName}`}
					>
						{data.people.givenName} {data.people.familyName}
					</p>
				)}

				{alternateNames.length > 0 && (
					<ul className="flex flex-wrap gap-1" aria-label="Alternate names">
						{alternateNames.map((name: string) => (
							<li key={name}>
								<Badge
									variant="outline"
									className={`${isMain ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-xs"} max-w-full truncate`}
									title={name}
								>
									{name}
								</Badge>
							</li>
						))}
						{alternateNames.length > 3 && (
							<li>
								<Tooltip>
									<TooltipTrigger asChild>
										<Badge
											variant="outline"
											className={`${isMain ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-xs"} cursor-help`}
											aria-label={`${alternateNames.length - 3} more alternate names`}
										>
											+{alternateNames.length - 3}
										</Badge>
									</TooltipTrigger>
									<TooltipContent>
										<div className="space-y-1">
											<p className="font-medium text-xs">Additional names:</p>
											<div className="flex flex-wrap gap-1">
												{alternateNames.map((name: string) => (
													<Badge
														key={`alt-${name}`}
														variant="outline"
														className="text-xs"
													>
														{name}
													</Badge>
												))}
											</div>
										</div>
									</TooltipContent>
								</Tooltip>
							</li>
						)}
					</ul>
				)}

				{positions.length > 0 && (
					<ul className="flex flex-wrap gap-1" aria-label="Staff positions">
						{positions.map((position: string) => (
							<li key={position}>
								<Badge
									variant="secondary"
									className={`${isMain ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-xs"} max-w-full truncate`}
									title={position}
								>
									{position}
								</Badge>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

export function StaffGrid({ staff }: StaffGridProps) {
	if (!staff || staff.length === 0) {
		return (
			<div className="py-12 text-center" aria-live="polite">
				<div
					className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted"
					aria-hidden="true"
				>
					<svg
						className="h-12 w-12 text-muted-foreground"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>No staff members</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6a2 2 0 00-2 2v6.002"
						/>
					</svg>
				</div>
				<h3 className="mb-2 font-medium text-base text-muted-foreground sm:text-lg">
					No Staff Information Available
				</h3>
				<p className="mx-auto max-w-md text-muted-foreground text-sm">
					Staff information is not available for this anime yet. Check back
					later for updates.
				</p>
			</div>
		);
	}

	// For staff, we'll consider "Director" and "Producer" as main roles, others as supporting
	const mainStaff = staff.filter((staffMember) => {
		const positions = Array.isArray((staffMember as any).positions)
			? (staffMember as any).positions
			: [];
		return positions.some(
			(pos: string) =>
				pos === "Director" ||
				pos === "Producer" ||
				pos === "Executive Producer" ||
				pos === "Series Director",
		);
	});

	const supportingStaff = staff.filter((staffMember) => {
		const positions = Array.isArray((staffMember as any).positions)
			? (staffMember as any).positions
			: [];
		return !positions.some(
			(pos: string) =>
				pos === "Director" ||
				pos === "Producer" ||
				pos === "Executive Producer" ||
				pos === "Series Director",
		);
	});

	return (
		<div className="space-y-8">
			{/* Main Staff Section */}
			{mainStaff.length > 0 && (
				<section aria-labelledby="main-staff-heading">
					<div className="mb-4 flex items-center justify-between">
						<h3
							id="main-staff-heading"
							className="font-semibold text-base sm:text-lg"
						>
							Main Staff
						</h3>
						<span className="text-muted-foreground text-sm">
							{mainStaff.length} member{mainStaff.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{mainStaff.map((staffMember) => {
							const staffData = staffMember as any;
							return (
								<StaffCard
									key={`${staffData.animeId}-${staffData.peopleId}-${Array.isArray(staffData.positions) ? staffData.positions.join("-") : "unknown"}`}
									data={staffMember}
									isMain={true}
								/>
							);
						})}
					</div>
				</section>
			)}

			{/* Supporting Staff Section */}
			{supportingStaff.length > 0 && (
				<section aria-labelledby="supporting-staff-heading">
					<div className="mb-4 flex items-center justify-between">
						<h3
							id="supporting-staff-heading"
							className="font-semibold text-base sm:text-lg"
						>
							Supporting Staff
						</h3>
						<span className="text-muted-foreground text-sm">
							{supportingStaff.length} member
							{supportingStaff.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
						{supportingStaff.map((staffMember) => {
							const staffData = staffMember as any;
							return (
								<StaffCard
									key={`${staffData.animeId}-${staffData.peopleId}-${Array.isArray(staffData.positions) ? staffData.positions.join("-") : "unknown"}`}
									data={staffMember}
									isMain={false}
								/>
							);
						})}
					</div>
				</section>
			)}

			{mainStaff.length === 0 && supportingStaff.length > 0 && (
				<div className="py-4 text-center" aria-live="polite">
					<p className="text-muted-foreground text-sm">
						Only supporting staff are available for this anime.
					</p>
				</div>
			)}

			{supportingStaff.length === 0 && mainStaff.length > 0 && (
				<div className="py-4 text-center" aria-live="polite">
					<p className="text-muted-foreground text-sm">
						Only main staff are available for this anime.
					</p>
				</div>
			)}
		</div>
	);
}
