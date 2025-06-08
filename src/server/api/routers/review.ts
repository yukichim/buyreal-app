import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TrpcReviewRepository } from "../repository/trpcReviewRepository";
import { CreateReviewUseCaseInteractor } from "~/application/usecase/review/createReviewUsecase";
import {
	GetReviewTimelineUseCaseInputData,
	GetReviewTimelineUseCaseInteractor,
} from "~/application/usecase/review/getReviewTimelineUsecase";

const reviewRepository = new TrpcReviewRepository();

export const reviewRouter = createTRPCRouter({
	create: publicProcedure
		.input(
			z.object({
				productId: z.string(),
				buyerId: z.string(),
				sellerId: z.string(),
				rating: z.number().min(1).max(5),
				comment: z.string(),
				productTitle: z.string(),
				buyerName: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const useCase = new CreateReviewUseCaseInteractor(reviewRepository);
			const review = await useCase.execute(input);
			return review.toPlainObject();
		}),

	getTimeline: publicProcedure
		.input(
			z.object({
				limit: z.number().default(10),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new GetReviewTimelineUseCaseInteractor(reviewRepository);
			const inputData = new GetReviewTimelineUseCaseInputData(input.limit);
			const reviews = await useCase.execute(inputData);
			return reviews.map((review) => review.toPlainObject());
		}),
});
