import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

const categoryRankingRepository = new InMemoryCategoryRankingRepository();

export const rankingRouter = createTRPCRouter({
	getCategories: publicProcedure
		.input(
			z.object({
				limit: z.number().default(5),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new GetCategoryRankingUseCase(categoryRankingRepository);
			const rankings = await useCase.execute(input.limit);
			return rankings.map((ranking) => ranking.toPlainObject());
		}),
});
