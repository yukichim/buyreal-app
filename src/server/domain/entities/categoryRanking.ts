export interface CategoryRanking {
	categoryId: string;
	categoryName: string;
	soldCount: number;
	totalRevenue: number;
	rank: number;
}

export class CategoryRankingEntity {
	constructor(private ranking: CategoryRanking) {}

	getCategoryId(): string {
		return this.ranking.categoryId;
	}

	getCategoryName(): string {
		return this.ranking.categoryName;
	}

	getSoldCount(): number {
		return this.ranking.soldCount;
	}

	getTotalRevenue(): number {
		return this.ranking.totalRevenue;
	}

	getRank(): number {
		return this.ranking.rank;
	}

	toPlainObject(): CategoryRanking {
		return { ...this.ranking };
	}
}
