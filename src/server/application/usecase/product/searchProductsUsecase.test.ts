import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchProductsUseCaseInteractor } from './searchProductsUsecase';
import type { 
  ProductRepository, 
  ProductSearchCriteria 
} from '~/server/domain/repositories/productRepository';
import type { ProductEntity } from '~/server/domain/entities/product';
import { ProductCondition } from '~/server/domain/entities/product';

// ProductRepositoryのモック
const mockProductRepository: ProductRepository = {
  getByPage: vi.fn(),
  findById: vi.fn(),
  findByCriteria: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

// サンプルProductEntityのモック
const mockProducts: ProductEntity[] = [
  {
    Id: { value: 'product-1' },
    Title: 'iPhone 13',
    Description: 'Excellent condition iPhone',
    Price: { amount: 80000, currency: 'JPY' },
    isAvailable: () => true,
  } as ProductEntity,
  {
    Id: { value: 'product-2' },
    Title: 'MacBook Pro',
    Description: 'Like new MacBook',
    Price: { amount: 150000, currency: 'JPY' },
    isAvailable: () => true,
  } as ProductEntity,
];

describe('SearchProductsUseCaseInteractor', () => {
  let useCase: SearchProductsUseCaseInteractor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SearchProductsUseCaseInteractor(mockProductRepository);
  });

  describe('execute', () => {
    it('should return products matching search criteria', async () => {
      const criteria: ProductSearchCriteria = {
        keyword: 'iPhone',
        categoryId: 'electronics',
        minPrice: 50000,
        maxPrice: 100000,
        condition: ProductCondition.GOOD,
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(criteria);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should return empty array when no products match criteria', async () => {
      const criteria: ProductSearchCriteria = {
        keyword: 'nonexistent',
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce([]);

      const result = await useCase.execute(criteria);

      expect(result).toEqual([]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with keyword only', async () => {
      const criteria: ProductSearchCriteria = {
        keyword: 'MacBook',
      };

      const filteredProducts = [mockProducts[1]];
      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(filteredProducts);

      const result = await useCase.execute(criteria);

      expect(result).toEqual(filteredProducts);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with categoryId only', async () => {
      const criteria: ProductSearchCriteria = {
        categoryId: 'electronics',
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(criteria);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with price range only', async () => {
      const criteria: ProductSearchCriteria = {
        minPrice: 70000,
        maxPrice: 200000,
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(criteria);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with condition only', async () => {
      const criteria: ProductSearchCriteria = {
        condition: ProductCondition.EXCELLENT,
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce([mockProducts[0]]);

      const result = await useCase.execute(criteria);

      expect(result).toEqual([mockProducts[0]]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with multiple criteria', async () => {
      const criteria: ProductSearchCriteria = {
        keyword: 'iPhone',
        categoryId: 'electronics',
        minPrice: 50000,
        maxPrice: 100000,
        condition: ProductCondition.GOOD,
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce([mockProducts[0]]);

      const result = await useCase.execute(criteria);

      expect(result).toEqual([mockProducts[0]]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle empty criteria object', async () => {
      const criteria: ProductSearchCriteria = {};

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(criteria);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle repository errors', async () => {
      const criteria: ProductSearchCriteria = {
        keyword: 'iPhone',
      };
      const error = new Error('Database connection failed');

      vi.mocked(mockProductRepository.findByCriteria).mockRejectedValueOnce(error);

      await expect(useCase.execute(criteria)).rejects.toThrow('Database connection failed');
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(1);
    });

    it('should handle search with very specific price range', async () => {
      const criteria: ProductSearchCriteria = {
        minPrice: 80000,
        maxPrice: 80000, // exact price match
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce([mockProducts[0]]);

      const result = await useCase.execute(criteria);

      expect(result).toEqual([mockProducts[0]]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with zero price range', async () => {
      const criteria: ProductSearchCriteria = {
        minPrice: 0,
        maxPrice: 0,
      };

      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce([]);

      const result = await useCase.execute(criteria);

      expect(result).toEqual([]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
    });

    it('should handle search with different product conditions', async () => {
      const conditions = [
        ProductCondition.POOR,
        ProductCondition.FAIR,
        ProductCondition.GOOD,
        ProductCondition.EXCELLENT,
        ProductCondition.NEW,
      ];

      for (const condition of conditions) {
        const criteria: ProductSearchCriteria = {
          condition,
        };

        vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

        const result = await useCase.execute(criteria);

        expect(result).toEqual(mockProducts);
        expect(mockProductRepository.findByCriteria).toHaveBeenCalledWith(criteria);
      }

      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(conditions.length);
    });

    it('should handle multiple consecutive searches', async () => {
      const criteria1: ProductSearchCriteria = { keyword: 'iPhone' };
      const criteria2: ProductSearchCriteria = { keyword: 'MacBook' };

      vi.mocked(mockProductRepository.findByCriteria)
        .mockResolvedValueOnce([mockProducts[0]])
        .mockResolvedValueOnce([mockProducts[1]]);

      const result1 = await useCase.execute(criteria1);
      const result2 = await useCase.execute(criteria2);

      expect(result1).toEqual([mockProducts[0]]);
      expect(result2).toEqual([mockProducts[1]]);
      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(2);
    });
  });

  describe('repository integration', () => {
    it('should only call findByCriteria method on repository', async () => {
      const criteria: ProductSearchCriteria = { keyword: 'test' };
      vi.mocked(mockProductRepository.findByCriteria).mockResolvedValueOnce(mockProducts);

      await useCase.execute(criteria);

      expect(mockProductRepository.findByCriteria).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.getByPage).not.toHaveBeenCalled();
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });
});
