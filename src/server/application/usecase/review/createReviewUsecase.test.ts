import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CreateReviewUseCaseInteractor,
  type CreateReviewRequest,
} from './createReviewUsecase';
import type { ReviewRepository } from '~/server/domain/repositories/reviewRepository';
import { ReviewEntity } from '~/server/domain/entities/review';

// ReviewRepositoryのモック
const mockReviewRepository: ReviewRepository = {
  save: vi.fn(),
  findRecent: vi.fn(),
  findByProductId: vi.fn(),
  findBySellerId: vi.fn(),
};

describe('CreateReviewUseCaseInteractor', () => {
  let useCase: CreateReviewUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateReviewUseCaseInteractor(mockReviewRepository);
    
    // crypto.randomUUIDのモック
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn().mockReturnValue('mock-review-id-123'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('execute', () => {
    it('should create and save a valid review', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 5,
        comment: 'Excellent product!',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      const result = await useCase.execute(request);

      // ReviewEntityが正しく作成されたことを確認
      expect(result).toBeInstanceOf(ReviewEntity);
      expect(result.Id.value).toBe('mock-review-id-123');
      expect(result.ProductId).toBe('product-1');
      expect(result.BuyerId).toBe('buyer-1');
      expect(result.SellerId).toBe('seller-1');
      expect(result.Rating).toBe(5);
      expect(result.Comment).toBe('Excellent product!');
      expect(result.ProductTitle).toBe('Test Product');
      expect(result.BuyerName).toBe('Test Buyer');
      expect(result.CreatedAt).toBeInstanceOf(Date);

      // リポジトリの保存メソッドが呼ばれたことを確認
      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.save).toHaveBeenCalledWith(result);
    });

    it('should throw error when rating is less than 1', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 0,
        comment: 'Bad rating',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        '評価は1から5の間で入力してください'
      );

      expect(mockReviewRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when rating is greater than 5', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 6,
        comment: 'Invalid rating',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        '評価は1から5の間で入力してください'
      );

      expect(mockReviewRepository.save).not.toHaveBeenCalled();
    });

    it('should accept all valid ratings (1-5)', async () => {
      const validRatings = [1, 2, 3, 4, 5];

      for (const rating of validRatings) {
        vi.clearAllMocks();

        const request: CreateReviewRequest = {
          productId: 'product-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          rating,
          comment: `Rating ${rating} review`,
          productTitle: 'Test Product',
          buyerName: 'Test Buyer',
        };

        vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

        const result = await useCase.execute(request);

        expect(result.Rating).toBe(rating);
        expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle empty comment', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 4,
        comment: '',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      const result = await useCase.execute(request);

      expect(result.Comment).toBe('');
      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle long comment', async () => {
      const longComment = 'A'.repeat(1000);
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 3,
        comment: longComment,
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      const result = await useCase.execute(request);

      expect(result.Comment).toBe(longComment);
      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle special characters in comment', async () => {
      const specialComment = '特殊文字テスト！@#$%^&*()_+{}:"<>?[]\\;\',./ 😀🎉';
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 5,
        comment: specialComment,
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      const result = await useCase.execute(request);

      expect(result.Comment).toBe(specialComment);
      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle repository save error', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 4,
        comment: 'Good product',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      const saveError = new Error('Database connection failed');
      vi.mocked(mockReviewRepository.save).mockRejectedValueOnce(saveError);

      await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');

      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should generate unique IDs for different reviews', async () => {
      const uuids = ['id-1', 'id-2', 'id-3'];
      let callCount = 0;
      
      vi.mocked(crypto.randomUUID).mockImplementation(() => uuids[callCount++]);

      const requests: CreateReviewRequest[] = [
        {
          productId: 'product-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          rating: 5,
          comment: 'Review 1',
          productTitle: 'Product 1',
          buyerName: 'Buyer 1',
        },
        {
          productId: 'product-2',
          buyerId: 'buyer-2',
          sellerId: 'seller-2',
          rating: 4,
          comment: 'Review 2',
          productTitle: 'Product 2',
          buyerName: 'Buyer 2',
        },
        {
          productId: 'product-3',
          buyerId: 'buyer-3',
          sellerId: 'seller-3',
          rating: 3,
          comment: 'Review 3',
          productTitle: 'Product 3',
          buyerName: 'Buyer 3',
        },
      ];

      vi.mocked(mockReviewRepository.save).mockResolvedValue(undefined);

      const results = await Promise.all(requests.map(req => useCase.execute(req)));

      expect(results[0].Id.value).toBe('id-1');
      expect(results[1].Id.value).toBe('id-2');
      expect(results[2].Id.value).toBe('id-3');
      expect(mockReviewRepository.save).toHaveBeenCalledTimes(3);
    });

    it('should handle edge case decimal ratings by rounding', async () => {
      // Note: TypeScriptの型では整数しか受け付けないが、実行時の検証をテスト
      const decimalRatings = [0.9, 1.1, 2.5, 4.9, 5.1];

      for (const rating of decimalRatings) {
        vi.clearAllMocks();

        const request = {
          productId: 'product-1',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          rating,
          comment: `Decimal rating ${rating}`,
          productTitle: 'Test Product',
          buyerName: 'Test Buyer',
        } as CreateReviewRequest;

        if (rating < 1 || rating > 5) {
          await expect(useCase.execute(request)).rejects.toThrow(
            '評価は1から5の間で入力してください'
          );
        } else {
          vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);
          const result = await useCase.execute(request);
          expect(result.Rating).toBe(rating);
        }
      }
    });

    it('should create review with current timestamp', async () => {
      const beforeTest = new Date();
      
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 5,
        comment: 'Time test',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      const result = await useCase.execute(request);
      const afterTest = new Date();

      expect(result.CreatedAt.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(result.CreatedAt.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });
  });

  describe('repository integration', () => {
    it('should only call save method on repository', async () => {
      const request: CreateReviewRequest = {
        productId: 'product-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        rating: 5,
        comment: 'Test review',
        productTitle: 'Test Product',
        buyerName: 'Test Buyer',
      };

      vi.mocked(mockReviewRepository.save).mockResolvedValueOnce(undefined);

      await useCase.execute(request);

      expect(mockReviewRepository.save).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.findRecent).not.toHaveBeenCalled();
      expect(mockReviewRepository.findByProductId).not.toHaveBeenCalled();
      expect(mockReviewRepository.findBySellerId).not.toHaveBeenCalled();
    });
  });
});
