import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import {
	GetStampCardUseCaseInputData,
	GetStampCardUseCaseInteractor,
} from "~/application/usecase/stampCard/getStampUsecase";
import {
	UseRewardUseCaseInputData,
	UseRewardUseCaseInteractor,
} from "~/application/usecase/stampCard/useRewardUsecase";
import { TrpcStampCardRepository } from "../repository/trpcStampCardRepository";

const stampCardRepository = new TrpcStampCardRepository();

export const stampCardRouter = router({
	get: publicProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new GetStampCardUseCaseInteractor(stampCardRepository);
			const inputData = new GetStampCardUseCaseInputData(input.userId);
			const stampCard = await useCase.execute(inputData);
			return stampCard.toPlainObject();
		}),

	useReward: publicProcedure
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const useCase = new UseRewardUseCaseInteractor(stampCardRepository);
			const inputData = new UseRewardUseCaseInputData(input.userId);
			await useCase.execute(inputData);
			return { success: true };
		}),
});
