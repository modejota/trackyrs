import type { NewMagazine } from "@trackyrs/database/schemas/myanimelist/manga/manga-magazine-schema";
import type { MagazineData } from "@/types";

export class MagazineMapper {
	static mapMagazineData(data: MagazineData): NewMagazine {
		return {
			id: data.mal_id,
			name: data.name,
		};
	}
}
