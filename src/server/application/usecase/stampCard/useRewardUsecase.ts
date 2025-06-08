import type { StampCardRepository } from "~/server/domain/repositories/stampCardRepository";

export class UseRewardUseCaseInputData {
	constructor(private userId: string) {}

	get UserId(): string {
		return this.userId;
	}
}

interface UseRewardUseCase {
	execute(input: UseRewardUseCaseInputData): Promise<void>;
}

export class UseRewardUseCaseInteractor implements UseRewardUseCase {
	constructor(private stampCardRepository: StampCardRepository) {}

	async execute(input: UseRewardUseCaseInputData): Promise<void> {
		const stampCard = await this.stampCardRepository.findByUserId(input.UserId);

		if (!stampCard) {
			throw new Error("スタンプカードが見つかりません");
		}

		if (!stampCard.canGetReward()) {
			throw new Error("スタンプが足りません");
		}

		stampCard.useReward();
		await this.stampCardRepository.save(stampCard);
	}
}
