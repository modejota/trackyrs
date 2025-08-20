import { Season } from "@trackyrs/database/types/anime-with-relations";

export function getCurrentSeasonAndYear(): { season: Season; year: number } {
	const now = new Date();
	const month = now.getMonth(); // 0-11
	const year = now.getFullYear();

	let season: Season;
	if (month >= 0 && month <= 2) {
		season = Season.WINTER; // Jan-Mar
	} else if (month >= 3 && month <= 5) {
		season = Season.SPRING; // Apr-Jun
	} else if (month >= 6 && month <= 8) {
		season = Season.SUMMER; // Jul-Sep
	} else {
		season = Season.FALL; // Oct-Dec
	}

	return { season, year };
}

export function getNextSeasonAndYear(): { season: Season; year: number } {
	const { season, year } = getCurrentSeasonAndYear();

	let nextSeason: Season;
	let nextYear = year;

	switch (season) {
		case Season.WINTER:
			nextSeason = Season.SPRING;
			break;
		case Season.SPRING:
			nextSeason = Season.SUMMER;
			break;
		case Season.SUMMER:
			nextSeason = Season.FALL;
			break;
		case Season.FALL:
			nextSeason = Season.WINTER;
			nextYear = year + 1;
			break;
	}

	return { season: nextSeason, year: nextYear };
}

export const SEASON_LABELS: Record<Season, string> = {
	[Season.WINTER]: "Winter",
	[Season.SPRING]: "Spring",
	[Season.SUMMER]: "Summer",
	[Season.FALL]: "Fall",
} as const;
