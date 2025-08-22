import type { StaffWithRole as AnimeStaffWithRole } from "@trackyrs/database/types/anime-with-relations";
import type { StaffWithRole as MangaStaffWithRole } from "@trackyrs/database/types/manga-with-relations";
import { Badge } from "@trackyrs/ui/components/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@trackyrs/ui/components/tooltip";
import { UsersRound } from "lucide-react";
import Image from "next/image";

interface StaffGridProps {
	staff: AnimeStaffWithRole[] | MangaStaffWithRole[];
}

interface StaffCardProps {
	data: AnimeStaffWithRole | MangaStaffWithRole;
	isMain: boolean;
}

function StaffCard({ data, isMain = false }: StaffCardProps) {
	const images = data.people.images;
	const positions = Array.isArray(
		(data as unknown as { positions?: string[] }).positions,
	)
		? ((data as unknown as { positions?: string[] }).positions ?? [])
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
			<div className="py-12 text-center">
				<div className="mx-auto max-w-md">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted p-4">
						<UsersRound className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="mb-2 font-semibold text-lg">No Staff Available</h3>
					<p className="text-muted-foreground text-sm">
						There is no staff information available yet.
					</p>
				</div>
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
