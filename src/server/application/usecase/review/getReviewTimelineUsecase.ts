import type { ReviewRepository } from "~/server/domain/repositories/reviewRepository";
import type { ReviewEntity } from "~/server/domain/entities/review";

export class GetReviewTimelineUseCaseInputData {
	constructor(private limit: number) {
		if (limit < 0) {
			throw new Error("limit must over 1.");
		}
	}

	get Limit(): number {
		return this.limit;
	}
}

interface GetReviewTimelineUseCase {
	execute(request: GetReviewTimelineUseCaseInputData): Promise<ReviewEntity[]>;
}

// TODO: Response(Outputdata)は別途実装
export class GetReviewTimelineUseCaseInteractor
	implements GetReviewTimelineUseCase
{
	constructor(private reviewRepository: ReviewRepository) {}

	async execute(
		request: GetReviewTimelineUseCaseInputData,
	): Promise<ReviewEntity[]> {
		return await this.reviewRepository.findRecent(request.Limit);
	}
}
