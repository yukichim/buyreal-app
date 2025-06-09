import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { reviewRouter } from './review';
import { TrpcReviewRepository } from '../repository/trpcReviewRepository';

// Integration test for Review Router
describe('Review Router Integration Tests', () => {
  const trpcMsw = createTRPCMsw(reviewRouter);
  const server = setupServer();

  beforeEach(() => {
    vi.clearAllMocks();
    server.listen();
    
    // crypto.randomUUIDのモック
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('mock-review-id-123'),
    });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.unstubAllGlobals();
  });

  afterAll(() => {
    server.close();
  });

  describe('create integration', () => {
    it('should create a review through complete flow', async () => {
      const reviewInput = {
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: 'とても良い商品でした！',
        productTitle: 'テスト商品',
        buyerName: 'テストユーザー',
      };

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result = await caller.create(reviewInput);
      
      expect(result).toHaveProperty('id');
      expect(result.productId).toBe(reviewInput.productId);
      expect(result.buyerId).toBe(reviewInput.buyerId);
      expect(result.sellerId).toBe(reviewInput.sellerId);
      expect(result.rating).toBe(reviewInput.rating);
      expect(result.comment).toBe(reviewInput.comment);
      expect(result.productTitle).toBe(reviewInput.productTitle);
      expect(result.buyerName).toBe(reviewInput.buyerName);
      expect(result).toHaveProperty('createdAt');
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
    });

    it('should validate create input parameters', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      // 必須フィールドが欠けている場合
      await expect(caller.create({
        productId: '',  // 空のproductId
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: 'Good product',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();

      // 無効なrating（範囲外）
      await expect(caller.create({
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 0,  // 1未満
        comment: 'Bad rating',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();

      await expect(caller.create({
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 6,  // 5超過
        comment: 'Invalid rating',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();

      // 空のcomment
      await expect(caller.create({
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: '',  // 空のコメント
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();
    });

    it('should handle different rating values', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      const validRatings = [1, 2, 3, 4, 5];

      for (const rating of validRatings) {
        const reviewInput = {
          productId: `product-${rating}`,
          buyerId: 'buyer-456',
          sellerId: 'seller-789',
          rating,
          comment: `Rating ${rating} test`,
          productTitle: 'Test Product',
          buyerName: 'Test Buyer',
        };

        const result = await caller.create(reviewInput);
        expect(result.rating).toBe(rating);
      }
    });

    it('should handle special characters in comment', async () => {
      const specialComment = '特殊文字テスト！@#$%^&*()_+{}:"<>?[]\\;\',./ 😀🎉';
      
      const reviewInput = {
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: specialComment,
        productTitle: 'テスト商品',
        buyerName: 'テストユーザー',
      };

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result = await caller.create(reviewInput);
      expect(result.comment).toBe(specialComment);
    });

    it('should handle very long comments', async () => {
      const longComment = 'A'.repeat(5000);
      
      const reviewInput = {
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 4,
        comment: longComment,
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result = await caller.create(reviewInput);
      expect(result.comment).toBe(longComment);
    });

    it('should handle repository save errors', async () => {
      const reviewInput = {
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: 'Test comment',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      // リポジトリのsaveメソッドでエラーを発生させる
      const reviewRepo = new TrpcReviewRepository();
      vi.spyOn(reviewRepo, 'save').mockRejectedValueOnce(new Error('Save failed'));

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      await expect(caller.create(reviewInput)).rejects.toThrow();
    });
  });

  describe('getTimeline integration', () => {
    it('should return review timeline through complete flow', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result = await caller.getTimeline({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
      
      if (result.length > 0) {
        const firstReview = result[0];
        expect(firstReview).toHaveProperty('id');
        expect(firstReview).toHaveProperty('productId');
        expect(firstReview).toHaveProperty('buyerId');
        expect(firstReview).toHaveProperty('sellerId');
        expect(firstReview).toHaveProperty('rating');
        expect(firstReview).toHaveProperty('comment');
        expect(firstReview).toHaveProperty('productTitle');
        expect(firstReview).toHaveProperty('buyerName');
        expect(firstReview).toHaveProperty('createdAt');
        expect(typeof firstReview.rating).toBe('number');
        expect(firstReview.rating).toBeGreaterThanOrEqual(1);
        expect(firstReview.rating).toBeLessThanOrEqual(5);
      }
    });

    it('should respect limit parameter', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const testLimits = [1, 5, 10, 25, 50];
      
      for (const limit of testLimits) {
        const result = await caller.getTimeline({ limit });
        expect(result.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should use default limit when not provided', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // limitを指定しない場合、デフォルト値（10）が使用される
      const result = await caller.getTimeline({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle edge case limits', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // 極端なlimit値のテスト
      const edgeCases = [0, 1, 100, 1000];
      
      for (const limit of edgeCases) {
        const result = await caller.getTimeline({ limit });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should validate timeline input parameters', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      // 負のlimit
      await expect(caller.getTimeline({ limit: -1 })).rejects.toThrow();

      // 文字列のlimit
      await expect(caller.getTimeline({ limit: 'invalid' as any })).rejects.toThrow();

      // nullのlimit
      await expect(caller.getTimeline({ limit: null as any })).rejects.toThrow();
    });

    it('should return reviews in chronological order', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result = await caller.getTimeline({ limit: 20 });
      
      if (result.length > 1) {
        // レビューが時系列順（新しい順）で返されることを確認
        for (let i = 0; i < result.length - 1; i++) {
          const currentDate = new Date(result[i].createdAt);
          const nextDate = new Date(result[i + 1].createdAt);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });

    it('should handle repository findRecent errors', async () => {
      // TrpcReviewRepositoryのfindRecentメソッドがエラーを投げる場合をテスト
      const reviewRepo = new TrpcReviewRepository();
      vi.spyOn(reviewRepo, 'findRecent').mockRejectedValueOnce(new Error('Database error'));

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      await expect(caller.getTimeline({ limit: 10 })).rejects.toThrow();
    });

    it('should return consistent data structure', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const result1 = await caller.getTimeline({ limit: 5 });
      const result2 = await caller.getTimeline({ limit: 5 });
      
      // 同じパラメータで同じ構造のデータが返ることを確認
      expect(result1).toEqual(result2);
    });
  });

  describe('create and getTimeline integration', () => {
    it('should create review and appear in timeline', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      // 新しいレビューを作成
      const reviewInput = {
        productId: 'integration-test-product',
        buyerId: 'integration-test-buyer',
        sellerId: 'integration-test-seller',
        rating: 5,
        comment: 'Integration test review',
        productTitle: 'Integration Test Product',
        buyerName: 'Integration Test Buyer',
      };

      const createdReview = await caller.create(reviewInput);
      
      // タイムラインを取得
      const timeline = await caller.getTimeline({ limit: 50 });
      
      // 作成したレビューがタイムラインに含まれることを確認
      const foundReview = timeline.find(review => review.id === createdReview.id);
      expect(foundReview).toBeDefined();
      
      if (foundReview) {
        expect(foundReview.productId).toBe(reviewInput.productId);
        expect(foundReview.buyerId).toBe(reviewInput.buyerId);
        expect(foundReview.comment).toBe(reviewInput.comment);
      }
    });

    it('should handle multiple review creation and retrieval', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      // 複数のレビューを作成
      const reviewInputs = [
        {
          productId: 'multi-test-product-1',
          buyerId: 'multi-test-buyer-1',
          sellerId: 'multi-test-seller-1',
          rating: 5,
          comment: 'First multi test review',
          productTitle: 'Multi Test Product 1',
          buyerName: 'Multi Test Buyer 1',
        },
        {
          productId: 'multi-test-product-2',
          buyerId: 'multi-test-buyer-2',
          sellerId: 'multi-test-seller-2',
          rating: 4,
          comment: 'Second multi test review',
          productTitle: 'Multi Test Product 2',
          buyerName: 'Multi Test Buyer 2',
        },
        {
          productId: 'multi-test-product-3',
          buyerId: 'multi-test-buyer-3',
          sellerId: 'multi-test-seller-3',
          rating: 3,
          comment: 'Third multi test review',
          productTitle: 'Multi Test Product 3',
          buyerName: 'Multi Test Buyer 3',
        },
      ];

      const createdReviews = [];
      for (const input of reviewInputs) {
        const review = await caller.create(input);
        createdReviews.push(review);
      }

      // タイムラインを取得
      const timeline = await caller.getTimeline({ limit: 100 });
      
      // すべての作成したレビューがタイムラインに含まれることを確認
      for (const createdReview of createdReviews) {
        const foundReview = timeline.find(review => review.id === createdReview.id);
        expect(foundReview).toBeDefined();
      }
    });
  });

  describe('performance and reliability', () => {
    it('should complete operations within reasonable time', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // Create operation
      const createStartTime = Date.now();
      await caller.create({
        productId: 'perf-test-product',
        buyerId: 'perf-test-buyer',
        sellerId: 'perf-test-seller',
        rating: 4,
        comment: 'Performance test review',
        productTitle: 'Performance Test Product',
        buyerName: 'Performance Test Buyer',
      });
      const createEndTime = Date.now();
      
      // Timeline operation
      const timelineStartTime = Date.now();
      await caller.getTimeline({ limit: 10 });
      const timelineEndTime = Date.now();
      
      // 各操作が1秒以内に完了することを確認
      expect(createEndTime - createStartTime).toBeLessThan(1000);
      expect(timelineEndTime - timelineStartTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // 同時に複数のリクエストを送信
      const promises = [
        caller.getTimeline({ limit: 5 }),
        caller.create({
          productId: 'concurrent-test-1',
          buyerId: 'concurrent-buyer-1',
          sellerId: 'concurrent-seller-1',
          rating: 5,
          comment: 'Concurrent test 1',
          productTitle: 'Concurrent Product 1',
          buyerName: 'Concurrent Buyer 1',
        }),
        caller.getTimeline({ limit: 10 }),
        caller.create({
          productId: 'concurrent-test-2',
          buyerId: 'concurrent-buyer-2',
          sellerId: 'concurrent-seller-2',
          rating: 4,
          comment: 'Concurrent test 2',
          productTitle: 'Concurrent Product 2',
          buyerName: 'Concurrent Buyer 2',
        }),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(4);
      expect(Array.isArray(results[0])).toBe(true); // timeline result
      expect(results[1]).toHaveProperty('id'); // create result
      expect(Array.isArray(results[2])).toBe(true); // timeline result
      expect(results[3]).toHaveProperty('id'); // create result
    });

    it('should be deterministic for timeline queries', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      const input = { limit: 5 };
      
      const result1 = await caller.getTimeline(input);
      const result2 = await caller.getTimeline(input);
      const result3 = await caller.getTimeline(input);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should handle memory cleanup properly', async () => {
      const ctx = { db: {} };
      
      // 多数のリクエストを処理してメモリリークがないことを確認
      for (let i = 0; i < 50; i++) {
        const caller = reviewRouter.createCaller(ctx);
        await caller.getTimeline({ limit: 5 });
        
        if (i % 10 === 0) {
          await caller.create({
            productId: `memory-test-${i}`,
            buyerId: `memory-buyer-${i}`,
            sellerId: `memory-seller-${i}`,
            rating: (i % 5) + 1,
            comment: `Memory test review ${i}`,
            productTitle: `Memory Test Product ${i}`,
            buyerName: `Memory Test Buyer ${i}`,
          });
        }
      }
      
      // メモリ使用量の増加をチェック（簡易的）
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB未満
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid data gracefully', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);

      // 型が正しくない場合
      await expect(caller.create({
        productId: 123 as any,
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 5,
        comment: 'Type error test',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();

      await expect(caller.create({
        productId: 'product-123',
        buyerId: 'buyer-456',
        sellerId: 'seller-789',
        rating: 'five' as any,
        comment: 'Type error test',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      })).rejects.toThrow();
    });

    it('should handle extremely large limits', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // 非常に大きなlimitでもクラッシュしないことを確認
      const result = await caller.getTimeline({ limit: Number.MAX_SAFE_INTEGER });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle floating point limits', async () => {
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // 小数点のlimitは整数に丸められるか、エラーになることを確認
      await expect(caller.getTimeline({ limit: 5.5 })).rejects.toThrow();
    });

    it('should handle repository data corruption', async () => {
      // リポジトリが無効なデータを返す場合をテスト
      const reviewRepo = new TrpcReviewRepository();
      vi.spyOn(reviewRepo, 'findRecent').mockResolvedValueOnce([
        null as any,
        undefined as any,
        { invalidStructure: true } as any,
      ]);

      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      await expect(caller.getTimeline({ limit: 5 })).rejects.toThrow();
    });
  });

  describe('context and dependency injection', () => {
    it('should work with different context objects', async () => {
      const contexts = [
        { db: {} },
        { db: {}, user: { id: 'user-1' } },
        { db: {}, session: { userId: 'user-1' } },
        {},
      ];

      for (const ctx of contexts) {
        const caller = reviewRouter.createCaller(ctx);
        const result = await caller.getTimeline({ limit: 3 });
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it('should handle dependency injection properly', async () => {
      // リポジトリのインスタンスが正しく注入されていることを確認
      const ctx = { db: {} };
      const caller = reviewRouter.createCaller(ctx);
      
      // 複数回呼び出しても一貫した動作をすることを確認
      const result1 = await caller.getTimeline({ limit: 5 });
      const result2 = await caller.getTimeline({ limit: 5 });
      
      expect(result1).toEqual(result2);
    });
  });
});
