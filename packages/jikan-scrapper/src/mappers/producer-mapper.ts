import type { NewProducer } from "@trackyrs/database/schemas/myanimelist/anime/anime-producer-schema";
import type { ProducerData } from "@/types";
import { ImageProcessor } from "@/utils/image-processor";

export class ProducerMapper {
	static mapProducerData(data: ProducerData): NewProducer {
		const defaultTitle = data.titles.find((title) => title.type === "Default");
		const name = defaultTitle?.title || data.titles[0]?.title || "Unknown";

		return {
			id: data.mal_id,
			name,
			titles: data.titles,
			images: ImageProcessor.extractOptimalImageUrl(data.images),
			about: data.about,
			established: data.established,
		};
	}
}
