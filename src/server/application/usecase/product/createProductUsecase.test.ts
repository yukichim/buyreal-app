import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CreateProductInputData,
  CreateProductUseCaseInteractor,
} from './createProductUsecase';
import { ProductCondition } from '~/server/domain/entities/product';
import type { ProductRepository } from '~/server/domain/repositories/productRepository';

// ProductRepositoryのモック
const mockProductRepository: ProductRepository = {
  getByPage: vi.fn(),
  findById: vi.fn(),
  findByCriteria: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

describe('CreateProductInputData', () => {
  describe('validation', () => {
    it('should create valid input data', () => {
      const validRequest = {
        title: 'Test Product',
        description: 'Test Description',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(validRequest)).not.toThrow();
    });

    it('should throw error when title is empty', () => {
      const invalidRequest = {
        title: '',
        description: 'Test Description',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(invalidRequest)).toThrow(
        'param error: price  is invalid!'
      );
    });

    it('should throw error when description is empty', () => {
      const invalidRequest = {
        title: 'Test Product',
        description: '',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(invalidRequest)).toThrow(
        'param error: description is invalid!'
      );
    });

    it('should throw error when price is negative', () => {
      const invalidRequest = {
        title: 'Test Product',
        description: 'Test Description',
        price: -100,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(invalidRequest)).toThrow(
        'param error: price  is invalid!'
      );
    });

    it('should throw error when sellerId is empty', () => {
      const invalidRequest = {
        title: 'Test Product',
        description: 'Test Description',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: '',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(invalidRequest)).toThrow(
        'param error: sellerId is invalid!'
      );
    });

    it('should throw error when categoryId is empty', () => {
      const invalidRequest = {
        title: 'Test Product',
        description: 'Test Description',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: '',
        images: ['image1.jpg'],
      };

      expect(() => new CreateProductInputData(invalidRequest)).toThrow(
        'param error: category id is invalid!'
      );
    });
  });

  describe('getters', () => {
    let inputData: CreateProductInputData;

    beforeEach(() => {
      inputData = new CreateProductInputData({
        title: 'Test Product',
        description: 'Test Description',
        price: 1000,
        condition: ProductCondition.GOOD,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg', 'image2.jpg'],
      });
    });

    it('should return correct title', () => {
      expect(inputData.Title).toBe('Test Product');
    });

    it('should return correct description', () => {
      expect(inputData.Description).toBe('Test Description');
    });

    it('should return correct price', () => {
      expect(inputData.Price).toBe(1000);
    });

    it('should return correct condition', () => {
      expect(inputData.Condition).toBe(ProductCondition.GOOD);
    });

    it('should return correct seller id', () => {
      expect(inputData.SellerId).toBe('seller-1');
    });

    it('should return correct category id', () => {
      expect(inputData.CategoryId).toBe('category-1');
    });

    it('should return correct images', () => {
      expect(inputData.Images).toEqual(['image1.jpg', 'image2.jpg']);
    });
  });
});

describe('CreateProductUseCaseInteractor', () => {
  let useCase: CreateProductUseCaseInteractor;
  let inputData: CreateProductInputData;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateProductUseCaseInteractor(mockProductRepository);
    inputData = new CreateProductInputData({
      title: 'Test Product',
      description: 'Test Description',
      price: 1000,
      condition: ProductCondition.GOOD,
      sellerId: 'seller-1',
      categoryId: 'category-1',
      images: ['image1.jpg'],
    });
  });

  it('should create product entity and save to repository', async () => {
    // Mock crypto.randomUUID
    const mockUUID = 'mock-uuid-123';
    vi.stubGlobal('crypto', { randomUUID: () => mockUUID });

    const result = await useCase.execute(inputData);

    // Verify product entity is created correctly
    expect(result.Id.value).toBe(mockUUID);
    expect(result.Title).toBe('Test Product');
    expect(result.Price).toEqual({ amount: 1000, currency: 'JPY' });
    expect(result.isAvailable()).toBe(true);

    // Verify repository save was called
    expect(mockProductRepository.save).toHaveBeenCalledWith(result);
    expect(mockProductRepository.save).toHaveBeenCalledTimes(1);

    // Cleanup
    vi.unstubAllGlobals();
  });

  it('should handle repository save error', async () => {
    vi.mocked(mockProductRepository.save).mockRejectedValueOnce(
      new Error('Database error')
    );

    await expect(useCase.execute(inputData)).rejects.toThrow('Database error');
  });
});
