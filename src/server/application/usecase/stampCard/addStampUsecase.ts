import type { StampCardRepository } from "~/server/domain/repositories/stampCardRepository";

export class addStampUseCaseInputData {
	constructor(private userId: string) {}

	get UserId(): string {
		return this.userId;
	}
}

interface AddStampUseCase {
	execute(userId: string): Promise<void>;
}

export class AddStampUseCaseInteractor implements AddStampUseCase {
	constructor(private stampCardRepository: StampCardRepository) {}

	async execute(userId: string): Promise<void> {
		let stampCard = await this.stampCardRepository.findByUserId(userId);

		if (!stampCard) {
			stampCard = await this.stampCardRepository.create(userId);
		}

		stampCard.addStamp();
		await this.stampCardRepository.save(stampCard);
	}
}
