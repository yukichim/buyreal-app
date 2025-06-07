import type { ReviewEntity, ReviewId } from "../entities/review";

export interface ReviewRepository {
	findById(id: ReviewId): Promise<ReviewEntity | null>;
	findByProductId(productId: string): Promise<ReviewEntity[]>;
	findRecent(limit: number): Promise<ReviewEntity[]>;
	save(review: ReviewEntity): Promise<void>;
}
