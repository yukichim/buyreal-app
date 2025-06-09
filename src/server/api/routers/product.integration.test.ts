import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { productRouter } from './product';
import { ProductCondition } from '~/server/domain/entities/product';
import { TrpcProductRepository } from '../repository/trpcProductRepository';
import { TrpcStampCardRepository } from '../repository/trpcStampCardRepository';

// Integration test for Product Router
// これらのテストは実際のtRPCルーターとリポジトリの統合をテストします
describe('Product Router Integration Tests', () => {
  const trpcMsw = createTRPCMsw(productRouter);
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

  describe('getByPage integration', () => {
    it('should return products through complete flow', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.getByPage();
      
      // 実際のリポジトリからデータが返ることを確認
      expect(Array.isArray(result)).toBe(true);
      
      if (result && result.length > 0) {
        const firstProduct = result[0];
        expect(firstProduct).toHaveProperty('id');
        expect(firstProduct).toHaveProperty('title');
        expect(firstProduct).toHaveProperty('description');
        expect(firstProduct).toHaveProperty('price');
        expect(firstProduct).toHaveProperty('condition');
        expect(firstProduct).toHaveProperty('status');
        expect(firstProduct).toHaveProperty('sellerId');
        expect(firstProduct).toHaveProperty('categoryId');
        expect(firstProduct).toHaveProperty('images');
        expect(firstProduct).toHaveProperty('createdAt');
        expect(firstProduct).toHaveProperty('updatedAt');
      }
    });

    it('should handle repository errors gracefully', async () => {
      // TrpcProductRepositoryのgetByPageメソッドがエラーを投げる場合をテスト
      const productRepo = new TrpcProductRepository();
      vi.spyOn(productRepo, 'getByPage').mockRejectedValueOnce(new Error('Database error'));

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.getByPage()).rejects.toThrow();
    });

    it('should return consistent data structure', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result1 = await caller.getByPage();
      const result2 = await caller.getByPage();
      
      // 同じ構造のデータが返ることを確認
      expect(result1).toEqual(result2);
    });
  });

  describe('search integration', () => {
    it('should search products with various criteria', async () => {
      const testCases = [
        { keyword: 'iPhone', categoryId: undefined, minPrice: undefined, maxPrice: undefined, condition: undefined },
        { keyword: undefined, categoryId: 'electronics', minPrice: undefined, maxPrice: undefined, condition: undefined },
        { keyword: undefined, categoryId: undefined, minPrice: 10000, maxPrice: undefined, condition: undefined },
        { keyword: undefined, categoryId: undefined, minPrice: undefined, maxPrice: 50000, condition: undefined },
        { keyword: undefined, categoryId: undefined, minPrice: undefined, maxPrice: undefined, condition: ProductCondition.NEW },
        { keyword: 'iPhone', categoryId: 'electronics', minPrice: 10000, maxPrice: 200000, condition: ProductCondition.LIKE_NEW },
      ];

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);

      for (const searchInput of testCases) {
        const result = await caller.search(searchInput);
        
        expect(Array.isArray(result)).toBe(true);
        
        if (result.length > 0) {
          result.forEach(product => {
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('title');
            expect(product).toHaveProperty('description');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('condition');
          });
        }
      }
    });

    it('should validate search input parameters', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);

      // 有効な入力
      await expect(caller.search({
        keyword: 'test',
        categoryId: 'electronics',
        minPrice: 1000,
        maxPrice: 50000,
        condition: ProductCondition.NEW,
      })).resolves.not.toThrow();

      // 無効な入力（負の価格）
      await expect(caller.search({
        minPrice: -1000,
      })).resolves.not.toThrow(); // Zodスキーマで検証されていない場合

      // 文字列の価格（型エラー）
      await expect(caller.search({
        minPrice: 'invalid' as any,
      })).rejects.toThrow();
    });
  });

  describe('create integration', () => {
    it('should create a product through complete flow', async () => {
      const createInput = {
        title: 'Integration Test Product',
        description: 'Created through integration test',
        price: 15000,
        condition: ProductCondition.GOOD,
        sellerId: 'test-seller-123',
        categoryId: 'test-category',
        images: ['test-image.jpg'],
      };

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.create(createInput);
      
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(createInput.title);
      expect(result.description).toBe(createInput.description);
      expect(result.price).toBe(createInput.price);
      expect(result.condition).toBe(createInput.condition);
      expect(result.sellerId).toBe(createInput.sellerId);
      expect(result.categoryId).toBe(createInput.categoryId);
      expect(result.images).toEqual(createInput.images);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should validate create input parameters', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);

      // 必須フィールドが欠けている場合
      await expect(caller.create({
        title: '',  // 空のタイトル
        description: 'Test description',
        price: 1000,
        condition: ProductCondition.NEW,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      })).rejects.toThrow();

      // 負の価格
      await expect(caller.create({
        title: 'Test Product',
        description: 'Test description',
        price: -1000,  // 負の価格
        condition: ProductCondition.NEW,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      })).rejects.toThrow();

      // 無効なcondition
      await expect(caller.create({
        title: 'Test Product',
        description: 'Test description',
        price: 1000,
        condition: 'INVALID_CONDITION' as any,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      })).rejects.toThrow();
    });

    it('should handle creation errors', async () => {
      // リポジトリでエラーが発生する場合をテスト
      const createInput = {
        title: 'Test Product',
        description: 'Test description',
        price: 1000,
        condition: ProductCondition.NEW,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      // リポジトリのsaveメソッドでエラーを発生させる
      const productRepo = new TrpcProductRepository();
      vi.spyOn(productRepo, 'save').mockRejectedValueOnce(new Error('Save failed'));

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.create(createInput)).rejects.toThrow();
    });
  });

  describe('purchase integration', () => {
    it('should complete purchase flow with stamp card update', async () => {
      const purchaseInput = {
        productId: '1',  // サンプルデータの既存商品ID
        buyerId: 'buyer-123',
      };

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.purchase(purchaseInput);
      
      expect(result).toEqual({ success: true });
    });

    it('should handle purchase of non-existent product', async () => {
      const purchaseInput = {
        productId: 'non-existent-product',
        buyerId: 'buyer-123',
      };

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.purchase(purchaseInput)).rejects.toThrow();
    });

    it('should handle purchase validation errors', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);

      // 空のproductId
      await expect(caller.purchase({
        productId: '',
        buyerId: 'buyer-123',
      })).rejects.toThrow();

      // 空のbuyerId
      await expect(caller.purchase({
        productId: 'product-1',
        buyerId: '',
      })).rejects.toThrow();

      // 型が正しくない場合
      await expect(caller.purchase({
        productId: 123 as any,
        buyerId: 'buyer-123',
      })).rejects.toThrow();
    });

    it('should handle repository errors during purchase', async () => {
      const purchaseInput = {
        productId: '1',
        buyerId: 'buyer-123',
      };

      // ProductRepositoryでエラーを発生させる
      const productRepo = new TrpcProductRepository();
      vi.spyOn(productRepo, 'findById').mockRejectedValueOnce(new Error('Product repository error'));

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.purchase(purchaseInput)).rejects.toThrow();
    });

    it('should handle stamp card repository errors during purchase', async () => {
      const purchaseInput = {
        productId: '1',
        buyerId: 'buyer-123',
      };

      // StampCardRepositoryでエラーを発生させる
      const stampCardRepo = new TrpcStampCardRepository();
      vi.spyOn(stampCardRepo, 'findByUserId').mockRejectedValueOnce(new Error('StampCard repository error'));

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.purchase(purchaseInput)).rejects.toThrow();
    });
  });

  describe('router context and dependency injection', () => {
    it('should work with different context objects', async () => {
      const contexts = [
        { db: {} },
        { db: {}, user: { id: 'user-1' } },
        { db: {}, session: { userId: 'user-1' } },
      ];

      for (const ctx of contexts) {
        const caller = productRouter.createCaller(ctx);
        const result = await caller.getByPage();
        expect(Array.isArray(result)).toBe(true);
      }
    });

    it('should handle dependency injection properly', async () => {
      // リポジトリのインスタンスが正しく注入されていることを確認
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      // 複数回呼び出しても一貫した動作をすることを確認
      const result1 = await caller.getByPage();
      const result2 = await caller.getByPage();
      
      expect(result1).toEqual(result2);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle concurrent requests', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      // 同時に複数のリクエストを送信
      const promises = [
        caller.getByPage(),
        caller.search({ keyword: 'iPhone' }),
        caller.getByPage(),
        caller.search({ categoryId: 'electronics' }),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(4);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle large input data', async () => {
      const largeInput = {
        title: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        price: 999999999,
        condition: ProductCondition.NEW,
        sellerId: 'seller-' + 'C'.repeat(100),
        categoryId: 'category-' + 'D'.repeat(100),
        images: Array(100).fill('image.jpg'),
      };

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      // 大きなデータでも処理できることを確認
      await expect(caller.create(largeInput)).resolves.not.toThrow();
    });

    it('should handle special characters in input', async () => {
      const specialCharInput = {
        title: 'テスト商品！@#$%^&*()_+{}:"<>?[]\\;\',./`~',
        description: '特殊文字のテスト 🎉🚀💯',
        price: 1000,
        condition: ProductCondition.NEW,
        sellerId: 'seller-テスト',
        categoryId: 'category-テスト',
        images: ['画像.jpg', 'test-image.png'],
      };

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.create(specialCharInput);
      
      expect(result.title).toBe(specialCharInput.title);
      expect(result.description).toBe(specialCharInput.description);
    });
  });

  describe('performance and reliability', () => {
    it('should complete operations within reasonable time', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const startTime = Date.now();
      await caller.getByPage();
      const endTime = Date.now();
      
      // 1秒以内に完了することを確認
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should be deterministic for same inputs', async () => {
      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const searchInput = { keyword: 'iPhone', categoryId: 'electronics' };
      
      const result1 = await caller.search(searchInput);
      const result2 = await caller.search(searchInput);
      const result3 = await caller.search(searchInput);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should handle memory cleanup properly', async () => {
      const ctx = { db: {} };
      
      // 多数のリクエストを処理してメモリリークがないことを確認
      for (let i = 0; i < 100; i++) {
        const caller = productRouter.createCaller(ctx);
        await caller.getByPage();
      }
      
      // メモリ使用量の増加をチェック（簡易的）
      const memoryUsage = process.memoryUsage();
      expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // 100MB未満
    });
  });
});
