import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { InMemoryCategoryRankingRepository } from "~/infrastcutrure/repositories/inMemoryCategoryRankingRepository";
import {
	GetCategoryRankingUseCaseInputData,
	GetCategoryRankingUseCaseInteractor,
} from "~/application/usecase/ranking/getCategoryRanking";

const categoryRankingRepository = new InMemoryCategoryRankingRepository();

export const rankingRouter = createTRPCRouter({
	getCategories: publicProcedure
		.input(
			z.object({
				limit: z.number().default(5),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new GetCategoryRankingUseCaseInteractor(
				categoryRankingRepository,
			);
			const inputData = new GetCategoryRankingUseCaseInputData(input.limit);
			const rankings = await useCase.execute(inputData);
			return rankings.map((ranking) => ranking.toPlainObject());
		}),
});
