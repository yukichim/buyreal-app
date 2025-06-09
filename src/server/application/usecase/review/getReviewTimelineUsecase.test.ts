import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetReviewTimelineUseCaseInputData,
  GetReviewTimelineUseCaseInteractor,
} from './getReviewTimelineUsecase';
import type { ReviewRepository } from '~/server/domain/repositories/reviewRepository';
import type { ReviewEntity } from '~/server/domain/entities/review';

// ReviewRepositoryのモック
const mockReviewRepository: ReviewRepository = {
  save: vi.fn(),
  findRecent: vi.fn(),
  findByProductId: vi.fn(),
  findBySellerId: vi.fn(),
};

// サンプルReviewEntityのモック
const mockReviews: ReviewEntity[] = [
  {
    Id: { value: 'review-1' },
    ProductId: 'product-1',
    BuyerId: 'buyer-1',
    SellerId: 'seller-1',
    Rating: 5,
    Comment: 'Great product!',
    ProductTitle: 'iPhone 13',
    BuyerName: 'John Doe',
    CreatedAt: new Date('2024-01-01'),
  } as ReviewEntity,
  {
    Id: { value: 'review-2' },
    ProductId: 'product-2',
    BuyerId: 'buyer-2',
    SellerId: 'seller-2',
    Rating: 4,
    Comment: 'Good quality',
    ProductTitle: 'MacBook Pro',
    BuyerName: 'Jane Smith',
    CreatedAt: new Date('2024-01-02'),
  } as ReviewEntity,
];

describe('GetReviewTimelineUseCaseInputData', () => {
  describe('constructor and validation', () => {
    it('should create input data with valid limit', () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      expect(inputData.Limit).toBe(10);
    });

    it('should create input data with limit 1', () => {
      const inputData = new GetReviewTimelineUseCaseInputData(1);
      expect(inputData.Limit).toBe(1);
    });

    it('should create input data with large limit', () => {
      const inputData = new GetReviewTimelineUseCaseInputData(1000);
      expect(inputData.Limit).toBe(1000);
    });

    it('should throw error when limit is negative', () => {
      expect(() => new GetReviewTimelineUseCaseInputData(-1)).toThrow(
        'limit must over 1.'
      );
    });

    it('should throw error when limit is zero', () => {
      expect(() => new GetReviewTimelineUseCaseInputData(0)).toThrow(
        'limit must over 1.'
      );
    });

    it('should throw error when limit is very negative', () => {
      expect(() => new GetReviewTimelineUseCaseInputData(-100)).toThrow(
        'limit must over 1.'
      );
    });

    it('should handle decimal limits', () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10.5);
      expect(inputData.Limit).toBe(10.5);
    });
  });

  describe('getters', () => {
    it('should return correct limit value', () => {
      const testCases = [1, 5, 10, 50, 100];

      for (const limit of testCases) {
        const inputData = new GetReviewTimelineUseCaseInputData(limit);
        expect(inputData.Limit).toBe(limit);
      }
    });
  });
});

describe('GetReviewTimelineUseCaseInteractor', () => {
  let useCase: GetReviewTimelineUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetReviewTimelineUseCaseInteractor(mockReviewRepository);
  });

  describe('execute', () => {
    it('should return reviews from repository with correct limit', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(mockReviews);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(10);
    });

    it('should return empty array when no reviews found', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(5);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce([]);

      const result = await useCase.execute(inputData);

      expect(result).toEqual([]);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(5);
    });

    it('should work with limit 1', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(1);
      const singleReview = [mockReviews[0]];
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(singleReview);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(singleReview);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(1);
    });

    it('should work with large limits', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(1000);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(mockReviews);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(1000);
    });

    it('should handle repository errors', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      const error = new Error('Database connection failed');
      
      vi.mocked(mockReviewRepository.findRecent).mockRejectedValueOnce(error);

      await expect(useCase.execute(inputData)).rejects.toThrow('Database connection failed');
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
    });

    it('should handle different limit values correctly', async () => {
      const testCases = [1, 5, 10, 25, 50, 100];

      for (const limit of testCases) {
        vi.clearAllMocks();
        
        const inputData = new GetReviewTimelineUseCaseInputData(limit);
        vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

        const result = await useCase.execute(inputData);

        expect(result).toEqual(mockReviews);
        expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(limit);
      }
    });

    it('should handle multiple consecutive calls', async () => {
      const inputData1 = new GetReviewTimelineUseCaseInputData(5);
      const inputData2 = new GetReviewTimelineUseCaseInputData(10);

      vi.mocked(mockReviewRepository.findRecent)
        .mockResolvedValueOnce([mockReviews[0]])
        .mockResolvedValueOnce(mockReviews);

      const result1 = await useCase.execute(inputData1);
      const result2 = await useCase.execute(inputData2);

      expect(result1).toEqual([mockReviews[0]]);
      expect(result2).toEqual(mockReviews);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(2);
      expect(mockReviewRepository.findRecent).toHaveBeenNthCalledWith(1, 5);
      expect(mockReviewRepository.findRecent).toHaveBeenNthCalledWith(2, 10);
    });

    it('should handle null/undefined repository responses gracefully', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      
      // リポジトリがnullを返す場合（実装によってはありえる）
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(null as any);

      const result = await useCase.execute(inputData);

      expect(result).toBeNull();
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
    });

    it('should work with decimal limits', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10.5);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(mockReviews);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledWith(10.5);
    });

    it('should preserve review order from repository', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      const orderedReviews = [...mockReviews].reverse(); // 順序を変更
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(orderedReviews);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(orderedReviews);
      expect(result).not.toEqual(mockReviews); // 元の順序と異なることを確認
    });
  });

  describe('input validation integration', () => {
    it('should fail when trying to create invalid input data', async () => {
      expect(() => {
        const invalidInputData = new GetReviewTimelineUseCaseInputData(-1);
        useCase.execute(invalidInputData);
      }).toThrow('limit must over 1.');

      expect(mockReviewRepository.findRecent).not.toHaveBeenCalled();
    });

    it('should work only with valid input data', async () => {
      const validInputData = new GetReviewTimelineUseCaseInputData(5);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

      const result = await useCase.execute(validInputData);

      expect(result).toEqual(mockReviews);
      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
    });
  });

  describe('repository integration', () => {
    it('should only call findRecent method on repository', async () => {
      const inputData = new GetReviewTimelineUseCaseInputData(10);
      
      vi.mocked(mockReviewRepository.findRecent).mockResolvedValueOnce(mockReviews);

      await useCase.execute(inputData);

      expect(mockReviewRepository.findRecent).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.save).not.toHaveBeenCalled();
      expect(mockReviewRepository.findByProductId).not.toHaveBeenCalled();
      expect(mockReviewRepository.findBySellerId).not.toHaveBeenCalled();
    });
  });
});
