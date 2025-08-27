export const navigationLinks = [
	{
		label: "Anime",
		submenu: true,
		type: "simple",
		items: [
			{ href: "/anime/search", label: "Search Animes" },
			{ href: "/anime/season", label: "Season Animes" },
			{ href: "/anime/top", label: "Top Animes" },
		],
	},
	{
		label: "Manga",
		submenu: true,
		type: "simple",
		items: [
			{ href: "/manga/search", label: "Search Mangas" },
			{ href: "/manga/ongoing", label: "Ongoing Mangas" },
			{ href: "/manga/top", label: "Top Mangas" },
		],
	},
	{
		label: "Others",
		submenu: true,
		type: "simple",
		items: [
			{ href: "/characters/search", label: "Search Characters" },
			{ href: "/people/search", label: "Search People" },
		],
	},
];
