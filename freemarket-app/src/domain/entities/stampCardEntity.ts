export interface StampCardId {
	value: string;
}

export interface StampCard {
	id: StampCardId;
	userId: { value: string };
	stamps: number;
	totalPurchases: number;
	lastPurchaseDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export class StampCardEntity {
	private static readonly STAMPS_FOR_REWARD = 10;

	constructor(private stampCard: StampCard) {}

	getId(): StampCardId {
		return this.stampCard.id;
	}

	getUserId(): string {
		return this.stampCard.userId.value;
	}

	getStamps(): number {
		return this.stampCard.stamps;
	}

	getTotalPurchases(): number {
		return this.stampCard.totalPurchases;
	}

	getLastPurchaseDate(): Date | null {
		return this.stampCard.lastPurchaseDate;
	}

	addStamp(): void {
		this.stampCard.stamps += 1;
		this.stampCard.totalPurchases += 1;
		this.stampCard.lastPurchaseDate = new Date();
		this.stampCard.updatedAt = new Date();
	}

	/**
	 * 報酬を受け取れるかを判断するビジネスロジック
	 */
	canGetReward(): boolean {
		return this.stampCard.stamps >= StampCardEntity.STAMPS_FOR_REWARD;
	}

	/**
	 * スタンプカードを使用して報酬を受け取る
	 */
	useReward(): void {
		if (!this.canGetReward()) {
			throw new Error("スタンプが足りません");
		}
		this.stampCard.stamps -= StampCardEntity.STAMPS_FOR_REWARD;
		this.stampCard.updatedAt = new Date();
	}

	getStampsUntilReward(): number {
		return Math.max(
			0,
			StampCardEntity.STAMPS_FOR_REWARD - this.stampCard.stamps,
		);
	}

	getRewardCount(): number {
		return Math.floor(
			this.stampCard.stamps / StampCardEntity.STAMPS_FOR_REWARD,
		);
	}

	toPlainObject(): StampCard {
		return { ...this.stampCard };
	}
}
