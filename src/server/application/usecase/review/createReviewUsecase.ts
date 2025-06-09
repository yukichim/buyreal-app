import type { ReviewRepository } from "~/server/domain/repositories/reviewRepository";
import { ReviewEntity, type Review } from "~/server/domain/entities/review";

export interface CreateReviewRequest {
	productId: string;
	buyerId: string;
	sellerId: string;
	rating: number;
	comment: string;
	productTitle: string;
	buyerName: string;
}

interface CreateReviewUseCase {
	execute(request: CreateReviewRequest): Promise<ReviewEntity>;
}

export class CreateReviewUseCaseInteractor implements CreateReviewUseCase {
	constructor(private reviewRepository: ReviewRepository) {}

	async execute(request: CreateReviewRequest): Promise<ReviewEntity> {
		if (request.rating < 1 || request.rating > 5) {
			throw new Error("評価は1から5の間で入力してください");
		}

		const review: Review = {
			id: { value: crypto.randomUUID() },
			productId: request.productId,
			buyerId: request.buyerId,
			sellerId: request.sellerId,
			rating: request.rating,
			comment: request.comment,
			productTitle: request.productTitle,
			buyerName: request.buyerName,
			createdAt: new Date(),
		};

		const reviewEntity = new ReviewEntity(review);
		await this.reviewRepository.save(reviewEntity);

		return reviewEntity;
	}
}
