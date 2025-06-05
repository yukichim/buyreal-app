import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { CreateReviewUseCase } from "~/application/use-cases/review/create-review-use-case";
import { GetReviewTimelineUseCase } from "~/application/use-cases/review/get-review-timeline-use-case";
import { TrpcReviewRepository } from "../repositories/trpc-review-repository";

const reviewRepository = new TrpcReviewRepository();

export const reviewRouter = router({
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
			const useCase = new CreateReviewUseCase(reviewRepository);
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
			const useCase = new GetReviewTimelineUseCase(reviewRepository);
			const reviews = await useCase.execute(input.limit);
			return reviews.map((review) => review.toPlainObject());
		}),
});
