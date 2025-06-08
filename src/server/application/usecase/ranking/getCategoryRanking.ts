import type { CategoryRankingRepository } from "~/server/domain/repositories/categoryRankingRepository";
import type { CategoryRankingEntity } from "~/server/domain/entities/categoryRanking";

export class GetCategoryRankingUseCaseInputData {
	constructor(private limit: number) {
		if (limit < 0) {
			throw new Error("limit is invalid. plese setting over 1.");
		}
	}

	get Limit(): number {
		return this.limit;
	}
}

interface GetCategoryRankingUseCase {
	execute(
		request: GetCategoryRankingUseCaseInputData,
	): Promise<CategoryRankingEntity[]>;
}

export class GetCategoryRankingUseCaseInteractor
	implements GetCategoryRankingUseCase
{
	constructor(private categoryRankingRepository: CategoryRankingRepository) {}

	async execute(
		request: GetCategoryRankingUseCaseInputData,
	): Promise<CategoryRankingEntity[]> {
		return await this.categoryRankingRepository.getTopCategories(request.Limit);
	}
}
