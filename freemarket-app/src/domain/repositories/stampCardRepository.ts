import type { StampCardEntity } from "../entities/stampCardEntity";

export interface StampCardRepository {
	findByUserId(userId: string): Promise<StampCardEntity | null>;
	save(stampCard: StampCardEntity): Promise<void>;
	create(userId: string): Promise<StampCardEntity>;
}
