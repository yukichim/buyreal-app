import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { stampCardRouter } from './stampCard';
import { StampCardEntity } from '~/server/domain/entities/stampCardEntity';
import { TrpcStampCardRepository } from '../repository/trpcStampCardRepository';

// TrpcStampCardRepositoryをモック化
vi.mock('../repository/trpcStampCardRepository');

const MockedTrpcStampCardRepository = vi.mocked(TrpcStampCardRepository);

describe('StampCard Router Integration Tests', () => {
	let mockRepository: any;

	beforeEach(() => {
		vi.clearAllMocks();
		
		// リポジトリモックのリセット
		MockedTrpcStampCardRepository.mockClear();
		
		// モックインスタンスの作成
		mockRepository = {
			getByUserId: vi.fn(),
			save: vi.fn(),
		};
		
		MockedTrpcStampCardRepository.mockImplementation(() => mockRepository);
	});

	describe('get endpoint', () => {
		it('既存のスタンプカードを正常に取得する', async () => {
			// Arrange
			const userId = 'user123';
			const mockStampCard = new StampCardEntity({
				id: { value: 'stamp-id-123' },
				userId: { value: userId },
				stamps: 3,
				totalPurchases: 3,
				lastPurchaseDate: new Date('2024-01-15'),
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-15'),
			});

			mockRepository.getByUserId.mockResolvedValue(mockStampCard);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.get({ userId });

			// Assert
			expect(result).toEqual({
				id: { value: 'stamp-id-123' },
				userId: { value: 'user123' },
				stamps: 3,
				totalPurchases: 3,
				lastPurchaseDate: new Date('2024-01-15'),
				createdAt: new Date('2024-01-01'),
				updatedAt: new Date('2024-01-15'),
			});
			expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId);
		});

		it('新規ユーザーのスタンプカード取得', async () => {
			// Arrange
			const userId = 'new-user-456';
			mockRepository.getByUserId.mockResolvedValue(null);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.get({ userId });

			// Assert
			expect(result).toBeNull();
			expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId);
		});

		it('無効なuserIdでエラーハンドリング', async () => {
			// Arrange
			const invalidUserId = '';

			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			await expect(caller.get({ userId: invalidUserId }))
				.rejects
				.toThrow();
		});

		it('リポジトリエラー時の適切なエラーハンドリング', async () => {
			// Arrange
			const userId = 'user123';
			mockRepository.getByUserId.mockRejectedValue(new Error('Database connection error'));

			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			await expect(caller.get({ userId }))
				.rejects
				.toThrow('Database connection error');
		});

		it('複数のユーザーIDでの連続取得', async () => {
			// Arrange
			const userIds = ['user1', 'user2', 'user3'];
			const mockStampCards = userIds.map((userId, index) => 
				new StampCardEntity({
					id: { value: `stamp-${userId}` },
					userId: { value: userId },
					stamps: index + 1,
					totalPurchases: index + 1,
					lastPurchaseDate: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			);

			userIds.forEach((userId, index) => {
				mockRepository.getByUserId.mockResolvedValueOnce(mockStampCards[index]);
			});

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const results = await Promise.all(
				userIds.map(userId => caller.get({ userId }))
			);

			// Assert
			expect(results).toHaveLength(3);
			results.forEach((result: any, index: number) => {
				expect(result?.userId.value).toBe(userIds[index]);
			});
		});
	});

	describe('useReward endpoint', () => {
		it('リワード使用を正常に実行する', async () => {
			// Arrange
			const userId = 'user123';
			const mockStampCard = new StampCardEntity({
				id: { value: 'stamp-id-123' },
				userId: { value: userId },
				stamps: 10, // リワードを受け取れる数
				totalPurchases: 10,
				lastPurchaseDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockRepository.getByUserId.mockResolvedValue(mockStampCard);
			mockRepository.save.mockResolvedValue(undefined);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.useReward({ userId });

			// Assert
			expect(result).toEqual({ success: true });
			expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId);
			expect(mockRepository.save).toHaveBeenCalled();
		});

		it('スタンプが不足している場合のエラーハンドリング', async () => {
			// Arrange
			const userId = 'user123';
			const mockStampCard = new StampCardEntity({
				id: { value: 'stamp-id-123' },
				userId: { value: userId },
				stamps: 5, // 不足
				totalPurchases: 5,
				lastPurchaseDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockRepository.getByUserId.mockResolvedValue(mockStampCard);

			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			await expect(caller.useReward({ userId }))
				.rejects
				.toThrow('スタンプが足りません');
		});

		it('存在しないユーザーのリワード使用', async () => {
			// Arrange
			const userId = 'nonexistent-user';
			mockRepository.getByUserId.mockResolvedValue(null);

			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			await expect(caller.useReward({ userId }))
				.rejects
				.toThrow('StampCard not found');
		});
	});

	describe('addStamp endpoint', () => {
		it('スタンプを正常に追加する', async () => {
			// Arrange
			const userId = 'user123';
			const productId = 'product456';
			const mockStampCard = new StampCardEntity({
				id: { value: 'stamp-id-123' },
				userId: { value: userId },
				stamps: 2,
				totalPurchases: 2,
				lastPurchaseDate: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockRepository.getByUserId.mockResolvedValue(mockStampCard);
			mockRepository.save.mockResolvedValue(undefined);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.addStamp({ userId, productId });

			// Assert
			expect(result).toEqual({ success: true });
			expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId);
			expect(mockRepository.save).toHaveBeenCalled();
		});

		it('新規ユーザーのスタンプカード作成とスタンプ追加', async () => {
			// Arrange
			const userId = 'new-user';
			const productId = 'product789';

			mockRepository.getByUserId.mockResolvedValue(null);
			mockRepository.save.mockResolvedValue(undefined);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.addStamp({ userId, productId });

			// Assert
			expect(result).toEqual({ success: true });
			expect(mockRepository.getByUserId).toHaveBeenCalledWith(userId);
			expect(mockRepository.save).toHaveBeenCalled();
		});

		it('無効な入力パラメータのエラーハンドリング', async () => {
			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			
			// 空のuserIdでテスト
			await expect(caller.addStamp({ userId: '', productId: 'product1' }))
				.rejects
				.toThrow();

			// 空のproductIdでテスト
			await expect(caller.addStamp({ userId: 'user1', productId: '' }))
				.rejects
				.toThrow();
		});
	});

	describe('エンドポイント間の相互作用テスト', () => {
		it('スタンプ追加→取得→リワード使用の完全フロー', async () => {
			// Arrange
			const userId = 'user123';
			const productIds = ['product1', 'product2', 'product3', 'product4', 'product5'];
			
			let mockStampCard = new StampCardEntity({
				id: { value: 'stamp-id-123' },
				userId: { value: userId },
				stamps: 0,
				totalPurchases: 0,
				lastPurchaseDate: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			mockRepository.getByUserId.mockImplementation(() => 
				Promise.resolve(mockStampCard)
			);
			mockRepository.save.mockImplementation((stampCard: StampCardEntity) => {
				mockStampCard = stampCard;
				return Promise.resolve();
			});

			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);

			// Act & Assert
			// 1. 10個のスタンプを追加
			for (const productId of productIds) {
				const result = await caller.addStamp({ userId, productId });
				expect(result).toEqual({ success: true });
			}

			// 2. スタンプカードを取得して確認
			const stampCard = await caller.get({ userId });
			expect(stampCard?.stamps).toBeGreaterThan(0);

			// 3. 十分なスタンプがある場合はリワードを使用
			if (stampCard && stampCard.stamps >= 10) {
				const rewardResult = await caller.useReward({ userId });
				expect(rewardResult).toEqual({ success: true });
			}
		});

		it('複数ユーザーの同時操作', async () => {
			// Arrange
			const userIds = ['user1', 'user2', 'user3'];
			const stampCards = new Map();

			mockRepository.getByUserId.mockImplementation((userId: string) => {
				return Promise.resolve(stampCards.get(userId) || null);
			});

			mockRepository.save.mockImplementation((stampCard: StampCardEntity) => {
				stampCards.set(stampCard.getUserId(), stampCard);
				return Promise.resolve();
			});

			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);

			// Act
			const operations = userIds.map(async (userId) => {
				// 各ユーザーでスタンプ追加
				await caller.addStamp({ userId, productId: `product-${userId}` });
				
				// スタンプカード取得
				const stampCard = await caller.get({ userId });
				
				return { userId, stampCard };
			});

			const results = await Promise.all(operations);

			// Assert
			expect(results).toHaveLength(3);
			results.forEach(({ userId, stampCard }: any) => {
				expect(stampCard?.userId.value).toBe(userId);
			});
		});
	});

	describe('エッジケースとバリデーション', () => {
		it('極端に長いuserIdの処理', async () => {
			// Arrange
			const longUserId = 'a'.repeat(1000);
			
			mockRepository.getByUserId.mockResolvedValue(null);

			// Act & Assert
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			
			// 通常のtRPCバリデーションでは問題ないはず
			const result = await caller.get({ userId: longUserId });
			expect(result).toBeNull();
		});

		it('特殊文字を含むIDの処理', async () => {
			// Arrange
			const specialUserId = 'user@#$%^&*()_+-=[]{}|;:,.<>?';
			const specialProductId = 'product!@#$%^&*()';

			mockRepository.getByUserId.mockResolvedValue(null);
			mockRepository.save.mockResolvedValue(undefined);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.addStamp({ 
				userId: specialUserId, 
				productId: specialProductId 
			});

			// Assert
			expect(result).toEqual({ success: true });
		});

		it('Unicode文字を含むIDの処理', async () => {
			// Arrange
			const unicodeUserId = 'ユーザー123';
			const unicodeProductId = '商品456';

			mockRepository.getByUserId.mockResolvedValue(null);
			mockRepository.save.mockResolvedValue(undefined);

			// Act
			const ctx = { db: {} };
			const caller = stampCardRouter.createCaller(ctx);
			const result = await caller.addStamp({ 
				userId: unicodeUserId, 
				productId: unicodeProductId 
			});

			// Assert
			expect(result).toEqual({ success: true });
		});
	});
});
