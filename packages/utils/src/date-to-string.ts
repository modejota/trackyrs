function formatDateToLocaleDateStringOrUnknown(dateString: string | null) {
	if (!dateString) return "Unknown";
	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "Invalid date";
	}
}

function formatDateToLocaleDateStringOrNotYetAired(dateString: string | null) {
	if (!dateString) return "Not aired";
	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	} catch {
		return "Invalid date";
	}
}

function convertSecondsDurationToString(seconds: number | null) {
	if (!seconds) return "Unknown";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} minutes`;
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return remainingMinutes > 0
		? `${hours} hours ${remainingMinutes} minutes`
		: `${hours} hours`;
}

function convertBroadcastDayAndTimeToString(
	day: string | null,
	time: string | null,
) {
	if (!day && !time) return "Unknown";
	if (day && time) return `${day} at ${time}`;
	return day || time || "Unknown";
}

function formatSeasonAndYearToString(
	season: string | null,
	year: number | null,
) {
	if (!season || !year) return "Unknown";
	const seasonName = season.charAt(0).toUpperCase() + season.slice(1);
	return `${seasonName} ${year}`;
}

export {
	formatDateToLocaleDateStringOrUnknown,
	formatDateToLocaleDateStringOrNotYetAired,
	convertSecondsDurationToString,
	convertBroadcastDayAndTimeToString,
	formatSeasonAndYearToString,
};
