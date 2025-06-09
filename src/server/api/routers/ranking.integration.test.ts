import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { rankingRouter } from './ranking';
import { InMemoryCategoryRankingRepository } from '~/server/infrastcutrure/repositories/inMemoryCategoryRankingRepository';

// Integration test for Ranking Router
describe('Ranking Router Integration Tests', () => {
  const trpcMsw = createTRPCMsw(rankingRouter);
  const server = setupServer();

  beforeEach(() => {
    vi.clearAllMocks();
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('getCategories integration', () => {
    it('should return category rankings through complete flow', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const result = await caller.getCategories({ limit: 5 });
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      if (result.length > 0) {
        const firstRanking = result[0];
        expect(firstRanking).toHaveProperty('categoryId');
        expect(firstRanking).toHaveProperty('categoryName');
        expect(firstRanking).toHaveProperty('rank');
        expect(firstRanking).toHaveProperty('count');
        expect(typeof firstRanking.rank).toBe('number');
        expect(typeof firstRanking.count).toBe('number');
      }
    });

    it('should respect limit parameter', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const testLimits = [1, 3, 5, 10, 20];
      
      for (const limit of testLimits) {
        const result = await caller.getCategories({ limit });
        expect(result.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should use default limit when not provided', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // limitを指定しない場合、デフォルト値（5）が使用される
      const result = await caller.getCategories({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should handle edge case limits', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // 極端なlimit値のテスト
      const edgeCases = [0, 1, 100, 1000];
      
      for (const limit of edgeCases) {
        const result = await caller.getCategories({ limit });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(limit);
      }
    });

    it('should validate input parameters', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);

      // 負のlimit
      await expect(caller.getCategories({ limit: -1 })).rejects.toThrow();

      // 文字列のlimit
      await expect(caller.getCategories({ limit: 'invalid' as any })).rejects.toThrow();

      // nullのlimit
      await expect(caller.getCategories({ limit: null as any })).rejects.toThrow();
    });

    it('should return rankings in correct order', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const result = await caller.getCategories({ limit: 10 });
      
      if (result.length > 1) {
        // ランキングが正しい順序（昇順）で返されることを確認
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].rank).toBeLessThanOrEqual(result[i + 1].rank);
        }
      }
    });

    it('should handle repository errors gracefully', async () => {
      // InMemoryCategoryRankingRepositoryのgetTopCategoriesメソッドがエラーを投げる場合をテスト
      const repo = new InMemoryCategoryRankingRepository();
      vi.spyOn(repo, 'getTopCategories').mockRejectedValueOnce(new Error('Repository error'));

      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      await expect(caller.getCategories({ limit: 5 })).rejects.toThrow();
    });

    it('should return consistent data structure', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const result1 = await caller.getCategories({ limit: 5 });
      const result2 = await caller.getCategories({ limit: 5 });
      
      // 同じパラメータで同じ構造のデータが返ることを確認
      expect(result1).toEqual(result2);
    });
  });

  describe('performance and reliability', () => {
    it('should complete operations within reasonable time', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const startTime = Date.now();
      await caller.getCategories({ limit: 10 });
      const endTime = Date.now();
      
      // 500ms以内に完了することを確認
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle concurrent requests', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // 同時に複数のリクエストを送信
      const promises = [
        caller.getCategories({ limit: 3 }),
        caller.getCategories({ limit: 5 }),
        caller.getCategories({ limit: 10 }),
        caller.getCategories({ limit: 1 }),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(4);
      expect(results[0].length).toBeLessThanOrEqual(3);
      expect(results[1].length).toBeLessThanOrEqual(5);
      expect(results[2].length).toBeLessThanOrEqual(10);
      expect(results[3].length).toBeLessThanOrEqual(1);
    });

    it('should be deterministic for same inputs', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const input = { limit: 5 };
      
      const result1 = await caller.getCategories(input);
      const result2 = await caller.getCategories(input);
      const result3 = await caller.getCategories(input);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should handle memory cleanup properly', async () => {
      const ctx = { db: {} };
      
      // 多数のリクエストを処理してメモリリークがないことを確認
      for (let i = 0; i < 50; i++) {
        const caller = rankingRouter.createCaller(ctx);
        await caller.getCategories({ limit: 5 });
      }
      
      // メモリ使用量の増加をチェック（簡易的）
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB未満
    });
  });

  describe('repository integration', () => {
    it('should use InMemoryCategoryRankingRepository correctly', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const result = await caller.getCategories({ limit: 5 });
      
      // InMemoryRepositoryの特性をテスト
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        // すべてのアイテムが正しい構造を持つことを確認
        result.forEach(ranking => {
          expect(ranking).toHaveProperty('categoryId');
          expect(ranking).toHaveProperty('categoryName');
          expect(ranking).toHaveProperty('rank');
          expect(ranking).toHaveProperty('count');
          expect(typeof ranking.categoryId).toBe('string');
          expect(typeof ranking.categoryName).toBe('string');
          expect(typeof ranking.rank).toBe('number');
          expect(typeof ranking.count).toBe('number');
          expect(ranking.rank).toBeGreaterThan(0);
          expect(ranking.count).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should handle empty repository data', async () => {
      // 空のリポジトリデータをシミュレート
      const repo = new InMemoryCategoryRankingRepository();
      vi.spyOn(repo, 'getTopCategories').mockResolvedValueOnce([]);

      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      const result = await caller.getCategories({ limit: 5 });
      
      expect(result).toEqual([]);
    });

    it('should handle repository returning more data than limit', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // リミットより多くのデータがある場合でも、正しく制限されることを確認
      const result = await caller.getCategories({ limit: 2 });
      
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle invalid data from repository', async () => {
      // リポジトリが無効なデータを返す場合をテスト
      const repo = new InMemoryCategoryRankingRepository();
      vi.spyOn(repo, 'getTopCategories').mockResolvedValueOnce([
        null as any,
        undefined as any,
        { invalidStructure: true } as any,
      ]);

      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      await expect(caller.getCategories({ limit: 5 })).rejects.toThrow();
    });

    it('should handle extremely large limits', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // 非常に大きなlimitでもクラッシュしないことを確認
      const result = await caller.getCategories({ limit: Number.MAX_SAFE_INTEGER });
      
      expect(Array.isArray(result)).toBe(true);
      // 実際のデータ量に依存するが、クラッシュしないことが重要
    });

    it('should handle floating point limits', async () => {
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // 小数点のlimitは整数に丸められるか、エラーになることを確認
      await expect(caller.getCategories({ limit: 5.5 })).rejects.toThrow();
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
        const caller = rankingRouter.createCaller(ctx);
        const result = await caller.getCategories({ limit: 3 });
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it('should handle dependency injection properly', async () => {
      // リポジトリのインスタンスが正しく注入されていることを確認
      const ctx = { db: {} };
      const caller = rankingRouter.createCaller(ctx);
      
      // 複数回呼び出しても一貫した動作をすることを確認
      const result1 = await caller.getCategories({ limit: 5 });
      const result2 = await caller.getCategories({ limit: 5 });
      
      expect(result1).toEqual(result2);
    });
  });
});
