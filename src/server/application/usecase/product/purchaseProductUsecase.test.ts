import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PurchaseProductUseCaseInteractor,
  type PurchaseProductRequest,
} from './purchaseProductUsecase';
import type { ProductRepository } from '~/server/domain/repositories/productRepository';
import type { ProductEntity, ProductId } from '~/server/domain/entities/product';

// ProductRepositoryのモック
const mockProductRepository: ProductRepository = {
  getByPage: vi.fn(),
  findById: vi.fn(),
  findByCriteria: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

// サンプルProductEntityのモック
const createMockProduct = (id: string, sellerId: string, isAvailable = true, isSold = false): ProductEntity => ({
  Id: { value: id },
  Title: 'Test Product',
  Description: 'Test Description',
  Price: { amount: 1000, currency: 'JPY' },
  isAvailable: vi.fn().mockReturnValue(isAvailable),
  markAsSold: vi.fn(),
  toPlainObject: vi.fn().mockReturnValue({
    id: { value: id },
    sellerId: { value: sellerId },
    title: 'Test Product',
    description: 'Test Description',
    price: { amount: 1000, currency: 'JPY' },
    condition: 'GOOD',
    categoryId: { value: 'category-1' },
    images: ['image1.jpg'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isSold,
  }),
}) as ProductEntity;

describe('PurchaseProductUseCaseInteractor', () => {
  let useCase: PurchaseProductUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new PurchaseProductUseCaseInteractor(mockProductRepository);
  });

  describe('execute', () => {
    it('should successfully purchase an available product', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', true, false);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);
      vi.mocked(mockProductRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(request);

      // 商品が正しいIDで検索されたことを確認
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findById).toHaveBeenCalledWith({ value: 'product-1' });
      
      // 商品の利用可能性がチェックされたことを確認
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      
      // 商品が売り切れ状態にマークされたことを確認
      expect(mockProduct.markAsSold).toHaveBeenCalledTimes(1);
      
      // 商品が保存されたことを確認
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw error when product is not found', async () => {
      const request: PurchaseProductRequest = {
        productId: 'nonexistent-product',
        buyerId: 'buyer-1',
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(null);

      await expect(useCase.execute(request)).rejects.toThrow('商品が見つかりません');
      
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when product is not available', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', false, true);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);

      await expect(useCase.execute(request)).rejects.toThrow('この商品は購入できません');
      
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockProduct.markAsSold).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when buyer tries to purchase their own product', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'seller-1', // 同じIDで売り手と買い手が同じ
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', true, false);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);

      await expect(useCase.execute(request)).rejects.toThrow('自分の商品は購入できません');
      
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockProduct.toPlainObject).toHaveBeenCalledTimes(1);
      expect(mockProduct.markAsSold).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository findById error', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const error = new Error('Database connection failed');
      vi.mocked(mockProductRepository.findById).mockRejectedValueOnce(error);

      await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');
      
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', true, false);
      const saveError = new Error('Save operation failed');
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);
      vi.mocked(mockProductRepository.save).mockRejectedValueOnce(saveError);

      await expect(useCase.execute(request)).rejects.toThrow('Save operation failed');
      
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockProduct.markAsSold).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle empty productId', async () => {
      const request: PurchaseProductRequest = {
        productId: '',
        buyerId: 'buyer-1',
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(null);

      await expect(useCase.execute(request)).rejects.toThrow('商品が見つかりません');
      
      expect(mockProductRepository.findById).toHaveBeenCalledWith({ value: '' });
    });

    it('should handle empty buyerId', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: '',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', true, false);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);
      vi.mocked(mockProductRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(request);

      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProduct.markAsSold).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should work with valid but different seller and buyer ids', async () => {
      const testCases = [
        { sellerId: 'seller-1', buyerId: 'buyer-1' },
        { sellerId: 'user-123', buyerId: 'user-456' },
        { sellerId: 'a', buyerId: 'b' },
      ];

      for (const { sellerId, buyerId } of testCases) {
        vi.clearAllMocks();

        const request: PurchaseProductRequest = {
          productId: 'product-1',
          buyerId,
        };

        const mockProduct = createMockProduct('product-1', sellerId, true, false);
        
        vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);
        vi.mocked(mockProductRepository.save).mockResolvedValueOnce(undefined);

        await useCase.execute(request);

        expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
        expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
        expect(mockProduct.markAsSold).toHaveBeenCalledTimes(1);
        expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
      }
    });

    it('should create correct ProductId object', async () => {
      const request: PurchaseProductRequest = {
        productId: 'test-product-123',
        buyerId: 'buyer-1',
      };

      const mockProduct = createMockProduct('test-product-123', 'seller-1', true, false);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);
      vi.mocked(mockProductRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(request);

      const expectedProductId: ProductId = { value: 'test-product-123' };
      expect(mockProductRepository.findById).toHaveBeenCalledWith(expectedProductId);
    });
  });

  describe('validation logic', () => {
    it('should check product existence first', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(null);

      await expect(useCase.execute(request)).rejects.toThrow('商品が見つかりません');
      
      // 商品が見つからない場合、他のチェックは行われない
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.save).not.toHaveBeenCalled();
    });

    it('should check availability after existence', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', false, true);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);

      await expect(useCase.execute(request)).rejects.toThrow('この商品は購入できません');
      
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockProduct.toPlainObject).not.toHaveBeenCalled();
    });

    it('should check ownership after availability', async () => {
      const request: PurchaseProductRequest = {
        productId: 'product-1',
        buyerId: 'seller-1',
      };

      const mockProduct = createMockProduct('product-1', 'seller-1', true, false);
      
      vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct);

      await expect(useCase.execute(request)).rejects.toThrow('自分の商品は購入できません');
      
      expect(mockProduct.isAvailable).toHaveBeenCalledTimes(1);
      expect(mockProduct.toPlainObject).toHaveBeenCalledTimes(1);
      expect(mockProduct.markAsSold).not.toHaveBeenCalled();
    });
  });
});
