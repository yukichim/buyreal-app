import type { StampCardRepository } from "~/domain/repositories/stampCardRepository";
import type { StampCardEntity } from "~/domain/entities/stampCardEntity";

export class GetStampCardUseCaseInputData {
	constructor(private userId: string) {
		if (!userId) {
			throw new Error("userID is invalid.");
		}
	}

	get UserId(): string {
		return this.userId;
	}
}

interface GetStampCardUseCase {
	execute(input: GetStampCardUseCaseInputData): Promise<StampCardEntity>;
}

export class GetStampCardUseCaseInteractor implements GetStampCardUseCase {
	constructor(private stampCardRepository: StampCardRepository) {}

	async execute(input: GetStampCardUseCaseInputData): Promise<StampCardEntity> {
		let stampCard = await this.stampCardRepository.findByUserId(input.UserId);

		if (!stampCard) {
			stampCard = await this.stampCardRepository.create(input.UserId);
		}

		return stampCard;
	}
}
