import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { GetStampCardUseCase } from "@/application/use-cases/stamp-card/get-stamp-card-use-case";
import { UseRewardUseCase } from "@/application/use-cases/stamp-card/use-reward-use-case";
import { TrpcStampCardRepository } from "../repositories/trpc-stamp-card-repository";

const stampCardRepository = new TrpcStampCardRepository();

export const stampCardRouter = router({
	get: publicProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new GetStampCardUseCase(stampCardRepository);
			const stampCard = await useCase.execute(input.userId);
			return stampCard.toPlainObject();
		}),

	useReward: publicProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const useCase = new UseRewardUseCase(stampCardRepository);
			await useCase.execute(input.userId);
			return { success: true };
		}),
});
