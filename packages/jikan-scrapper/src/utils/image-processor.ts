import type { ImageCollection, ImageVariants } from "@/types";

export class ImageProcessor {
	static extractOptimalImageUrl(images: ImageCollection): string {
		if (images.webp && ImageProcessor.hasValidImageUrls(images.webp)) {
			return ImageProcessor.selectHighestQuality(images.webp);
		}
		if (images.jpg && ImageProcessor.hasValidImageUrls(images.jpg)) {
			return ImageProcessor.selectHighestQuality(images.jpg);
		}
		throw new Error("No image variants available");
	}

	static preferWebpOverJpeg(images: ImageCollection): string {
		if (images.webp && ImageProcessor.hasValidImageUrls(images.webp)) {
			return ImageProcessor.selectHighestQuality(images.webp);
		}
		if (images.jpg && ImageProcessor.hasValidImageUrls(images.jpg)) {
			return ImageProcessor.selectHighestQuality(images.jpg);
		}
		throw new Error("No valid image formats available");
	}

	static selectHighestQuality(variants: ImageVariants): string {
		if (variants.large_image_url) {
			return variants.large_image_url;
		}
		if (variants.image_url) {
			return variants.image_url;
		}
		if (variants.small_image_url) {
			return variants.small_image_url;
		}
		throw new Error("No image URLs available in variants");
	}

	private static hasValidImageUrls(variants: ImageVariants): boolean {
		return !!(
			variants.large_image_url ||
			variants.image_url ||
			variants.small_image_url
		);
	}
}
