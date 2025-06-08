export interface ReviewId {
	value: string;
}

export interface Review {
	id: ReviewId;
	productId: string;
	buyerId: string;
	sellerId: string;
	rating: number;
	comment: string;
	productTitle: string;
	buyerName: string;
	createdAt: Date;
}

export class ReviewEntity {
	constructor(private review: Review) {}

	getId(): ReviewId {
		return this.review.id;
	}

	getRating(): number {
		return this.review.rating;
	}

	getComment(): string {
		return this.review.comment;
	}

	getProductTitle(): string {
		return this.review.productTitle;
	}

	getBuyerName(): string {
		return this.review.buyerName;
	}

	getCreatedAt(): Date {
		return this.review.createdAt;
	}

	isValidRating(): boolean {
		return this.review.rating >= 1 && this.review.rating <= 5;
	}

	toPlainObject(): Review {
		return { ...this.review };
	}
}
