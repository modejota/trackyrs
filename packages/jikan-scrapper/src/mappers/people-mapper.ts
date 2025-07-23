import type { NewPeople } from "@trackyrs/database/schemas/myanimelist/people-schema";
import type { PersonData } from "@/types";
import { ImageProcessor } from "@/utils/image-processor";

export class PeopleMapper {
	static mapPeopleData(data: PersonData): NewPeople {
		return {
			id: data.mal_id,
			name: data.name,
			givenName: data.given_name,
			familyName: data.family_name,
			alternateNames: data.alternate_names,
			birthday: data.birthday,
			images: ImageProcessor.extractOptimalImageUrl(data.images),
			about: data.about,
		};
	}
}
