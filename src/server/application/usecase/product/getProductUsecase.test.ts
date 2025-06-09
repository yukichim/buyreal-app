import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GetProductUseCaseInputData,
  GetProductUseCaseInteractor,
} from './getProductUsecase';
import type { ProductRepository } from '~/server/domain/repositories/productRepository';
import type { ProductEntity } from '~/server/domain/entities/product';

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
    Title: 'Test Product 1',
    Description: 'Test Description 1',
    Price: { amount: 1000, currency: 'JPY' },
    isAvailable: () => true,
  } as ProductEntity,
  {
    Id: { value: 'product-2' },
    Title: 'Test Product 2',
    Description: 'Test Description 2',
    Price: { amount: 2000, currency: 'JPY' },
    isAvailable: () => true,
  } as ProductEntity,
];

describe('GetProductUseCaseInputData', () => {
  describe('constructor and getters', () => {
    it('should create input data with provided values', () => {
      const input = {
        limit: 10,
        page: 1,
      };

      const inputData = new GetProductUseCaseInputData(input);

      expect(inputData.Limit).toBe(10);
      expect(inputData.Page).toBe(1);
    });

    it('should use default values when limit is not provided', () => {
      const input = {
        page: 1,
      };

      const inputData = new GetProductUseCaseInputData(input);

      expect(inputData.Limit).toBe(0);
      expect(inputData.Page).toBe(1);
    });

    it('should use default values when page is not provided', () => {
      const input = {
        limit: 10,
      };

      const inputData = new GetProductUseCaseInputData(input);

      expect(inputData.Limit).toBe(10);
      expect(inputData.Page).toBe(0);
    });

    it('should use default values when no parameters are provided', () => {
      const input = {};

      const inputData = new GetProductUseCaseInputData(input);

      expect(inputData.Limit).toBe(0);
      expect(inputData.Page).toBe(0);
    });

    it('should handle negative values', () => {
      const input = {
        limit: -5,
        page: -1,
      };

      const inputData = new GetProductUseCaseInputData(input);

      expect(inputData.Limit).toBe(-5);
      expect(inputData.Page).toBe(-1);
    });
  });
});

describe('GetProductUseCaseInteractor', () => {
  let useCase: GetProductUseCaseInteractor;
  let inputData: GetProductUseCaseInputData;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetProductUseCaseInteractor(mockProductRepository);
    inputData = new GetProductUseCaseInputData({
      limit: 10,
      page: 1,
    });
  });

  describe('execute', () => {
    it('should return products from repository', async () => {
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(inputData);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.getByPage).toHaveBeenCalledWith();
    });

    it('should return null when no products found', async () => {
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce(null);

      const result = await useCase.execute(inputData);

      expect(result).toBeNull();
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when products array is empty', async () => {
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce([]);

      const result = await useCase.execute(inputData);

      expect(result).toEqual([]);
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockProductRepository.getByPage).mockRejectedValueOnce(error);

      await expect(useCase.execute(inputData)).rejects.toThrow('Database connection failed');
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
    });

    it('should work with default input parameters', async () => {
      const defaultInputData = new GetProductUseCaseInputData({});
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(defaultInputData);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
    });

    it('should work regardless of input parameters (current implementation ignores them)', async () => {
      const inputWithHighValues = new GetProductUseCaseInputData({
        limit: 100,
        page: 10,
      });
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce(mockProducts);

      const result = await useCase.execute(inputWithHighValues);

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.getByPage).toHaveBeenCalledWith();
    });

    it('should handle multiple consecutive calls', async () => {
      vi.mocked(mockProductRepository.getByPage)
        .mockResolvedValueOnce(mockProducts)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(null);

      const result1 = await useCase.execute(inputData);
      const result2 = await useCase.execute(inputData);
      const result3 = await useCase.execute(inputData);

      expect(result1).toEqual(mockProducts);
      expect(result2).toEqual([]);
      expect(result3).toBeNull();
      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(3);
    });
  });

  describe('repository integration', () => {
    it('should only call getByPage method on repository', async () => {
      vi.mocked(mockProductRepository.getByPage).mockResolvedValueOnce(mockProducts);

      await useCase.execute(inputData);

      expect(mockProductRepository.getByPage).toHaveBeenCalledTimes(1);
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(mockProductRepository.findByCriteria).not.toHaveBeenCalled();
      expect(mockProductRepository.save).not.toHaveBeenCalled();
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });
});
