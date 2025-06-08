import type { StampCardRepository } from "~/domain/repositories/stampCardRepository";
import {
	StampCardEntity,
	type StampCard,
} from "~/domain/entities/stampCardEntity";

export class TrpcStampCardRepository implements StampCardRepository {
	private stampCards: Map<string, StampCardEntity> = new Map();

	constructor() {
		this.initializeSampleData();
	}

	private initializeSampleData(): void {
		const sampleStampCards: StampCard[] = [
			{
				id: { value: "1" },
				userId: { value: "current-user" },
				stamps: 3,
				totalPurchases: 3,
				lastPurchaseDate: new Date("2024-01-20"),
				createdAt: new Date("2024-01-01"),
				updatedAt: new Date("2024-01-20"),
			},
		];

		for (const e of sampleStampCards) {
			this.stampCards.set(e.userId.value, new StampCardEntity(e));
		}
	}

	async findByUserId(userId: string): Promise<StampCardEntity | null> {
		return this.stampCards.get(userId) || null;
	}

	async save(stampCard: StampCardEntity): Promise<void> {
		const data = stampCard.toPlainObject();
		this.stampCards.set(data.userId.value, stampCard);
	}

	async create(userId: string): Promise<StampCardEntity> {
		const stampCard: StampCard = {
			id: { value: crypto.randomUUID() },
			userId: { value: userId },
			stamps: 0,
			totalPurchases: 0,
			lastPurchaseDate: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const entity = new StampCardEntity(stampCard);
		await this.save(entity);
		return entity;
	}
}
