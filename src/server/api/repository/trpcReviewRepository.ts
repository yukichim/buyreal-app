import type { ReviewRepository } from "~/server/domain/repositories/reviewRepository";
import {
	ReviewEntity,
	type ReviewId,
	type Review,
} from "~/server/domain/entities/review";

export class TrpcReviewRepository implements ReviewRepository {
	private reviews: Map<string, ReviewEntity> = new Map();

	constructor() {
		this.initializeSampleData();
	}

	private initializeSampleData(): void {
		const sampleReviews: Review[] = [
			{
				id: { value: "1" },
				productId: "1",
				buyerId: "user2",
				sellerId: "user1",
				rating: 5,
				comment: "とても良い商品でした！梱包も丁寧で満足です。",
				productTitle: "iPhone 14 Pro",
				buyerName: "佐藤花子",
				createdAt: new Date("2024-01-22"),
			},
			{
				id: { value: "2" },
				productId: "2",
				buyerId: "user3",
				sellerId: "user2",
				rating: 4,
				comment: "思っていたより状態が良くて嬉しいです。",
				productTitle: "ナイキ エアマックス",
				buyerName: "田中次郎",
				createdAt: new Date("2024-01-21"),
			},
			{
				id: { value: "3" },
				productId: "3",
				buyerId: "user1",
				sellerId: "user3",
				rating: 5,
				comment: "新品同様でした！迅速な対応ありがとうございました。",
				productTitle: "MacBook Air M2",
				buyerName: "山田太郎",
				createdAt: new Date("2024-01-20"),
			},
		];

		for (const e of sampleReviews) {
			this.reviews.set(e.id.value, new ReviewEntity(e));
		}
	}

	async findById(id: ReviewId): Promise<ReviewEntity | null> {
		return this.reviews.get(id.value) || null;
	}

	async findByProductId(productId: string): Promise<ReviewEntity[]> {
		return Array.from(this.reviews.values()).filter(
			(review) => review.toPlainObject().productId === productId,
		);
	}

	async findRecent(limit: number): Promise<ReviewEntity[]> {
		const reviews = Array.from(this.reviews.values());
		return reviews
			.sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime())
			.slice(0, limit);
	}

	async save(review: ReviewEntity): Promise<void> {
		this.reviews.set(review.getId().value, review);
	}
}
