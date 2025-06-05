import type { CategoryRankingEntity } from "../entities/categoryRanking";

export interface CategoryRankingRepository {
	getTopCategories(limit: number): Promise<CategoryRankingEntity[]>;
}
