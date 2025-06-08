import {
	CategoryRankingEntity,
	type CategoryRanking,
} from "~/server/domain/entities/categoryRanking";
import type { CategoryRankingRepository } from "~/server/domain/repositories/categoryRankingRepository";

export class InMemoryCategoryRankingRepository
	implements CategoryRankingRepository
{
	private rankings: CategoryRankingEntity[] = [];

	constructor() {
		this.initializeSampleData();
	}
	private initializeSampleData(): void {
		const sampleRankings: CategoryRanking[] = [
			{
				categoryId: "electronics",
				categoryName: "家電・スマホ・カメラ",
				soldCount: 156,
				totalRevenue: 2340000,
				rank: 1,
			},
			{
				categoryId: "fashion",
				categoryName: "ファッション",
				soldCount: 134,
				totalRevenue: 890000,
				rank: 2,
			},
			{
				categoryId: "books",
				categoryName: "本・音楽・ゲーム",
				soldCount: 98,
				totalRevenue: 450000,
				rank: 3,
			},
			{
				categoryId: "sports",
				categoryName: "スポーツ・レジャー",
				soldCount: 76,
				totalRevenue: 680000,
				rank: 4,
			},
			{
				categoryId: "home",
				categoryName: "インテリア・住まい",
				soldCount: 54,
				totalRevenue: 320000,
				rank: 5,
			},
		];

		this.rankings = sampleRankings.map(
			(ranking) => new CategoryRankingEntity(ranking),
		);
	}

	/**
	 * 人気カテゴリランキングエンティティの取得
	 * @param limit 先頭からの取得件数
	 * @returns CategoryRankingEntitiy[]
	 */
	async getTopCategories(limit: number): Promise<CategoryRankingEntity[]> {
		return this.rankings.slice(0, limit);
	}
}
