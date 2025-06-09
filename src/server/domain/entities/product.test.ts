import { describe, it, expect, beforeEach } from 'vitest';
import {
  ProductEntity,
  ProductStatus,
  ProductCondition,
  type Product,
  type ProductId,
  type UserId,
  type Money,
} from './product';

describe('ProductEntity', () => {
  let productData: Product;
  let productEntity: ProductEntity;

  beforeEach(() => {
    productData = {
      id: { value: 'product-1' } as ProductId,
      title: 'Test Product',
      description: 'Test Description',
      price: { amount: 1000, currency: 'JPY' } as Money,
      condition: ProductCondition.GOOD,
      status: ProductStatus.AVAILABLE,
      sellerId: { value: 'seller-1' } as UserId,
      categoryId: 'category-1',
      images: ['image1.jpg', 'image2.jpg'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    productEntity = new ProductEntity(productData);
  });

  describe('getters', () => {
    it('should return correct id', () => {
      expect(productEntity.Id).toEqual({ value: 'product-1' });
    });

    it('should return correct title', () => {
      expect(productEntity.Title).toBe('Test Product');
    });

    it('should return correct price', () => {
      expect(productEntity.Price).toEqual({ amount: 1000, currency: 'JPY' });
    });

    it('should return correct status', () => {
      expect(productEntity.Status).toBe(ProductStatus.AVAILABLE);
    });

    it('should return correct seller id', () => {
      expect(productEntity.SellerId).toBe('seller-1');
    });

    it('should return correct category id', () => {
      expect(productEntity.CategoryId).toBe('category-1');
    });

    it('should return correct description', () => {
      expect(productEntity.Descripyion).toBe('Test Description');
    });

    it('should return correct condition', () => {
      expect(productEntity.Condition).toBe(ProductCondition.GOOD);
    });

    it('should return correct images', () => {
      expect(productEntity.Images).toEqual(['image1.jpg', 'image2.jpg']);
    });

    it('should return correct created date', () => {
      expect(productEntity.CreatedAt).toEqual(new Date('2024-01-01'));
    });

    it('should return correct updated date', () => {
      expect(productEntity.UpdatedAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('isAvailable', () => {
    it('should return true when status is AVAILABLE', () => {
      expect(productEntity.isAvailable()).toBe(true);
    });

    it('should return false when status is SOLD', () => {
      const soldProduct = new ProductEntity({
        ...productData,
        status: ProductStatus.SOLD,
      });
      expect(soldProduct.isAvailable()).toBe(false);
    });

    it('should return false when status is RESERVED', () => {
      const reservedProduct = new ProductEntity({
        ...productData,
        status: ProductStatus.RESERVED,
      });
      expect(reservedProduct.isAvailable()).toBe(false);
    });
  });

  describe('markAsSold', () => {
    it('should mark product as sold when available', () => {
      const beforeUpdate = productEntity.UpdatedAt;
      
      productEntity.markAsSold();
      
      expect(productEntity.Status).toBe(ProductStatus.SOLD);
      expect(productEntity.UpdatedAt).not.toEqual(beforeUpdate);
    });

    it('should throw error when product is already sold', () => {
      productEntity.markAsSold();
      
      expect(() => productEntity.markAsSold()).toThrow(
        '商品は既に売り切れまたは予約済みです'
      );
    });

    it('should throw error when product is reserved', () => {
      productEntity.reserve();
      
      expect(() => productEntity.markAsSold()).toThrow(
        '商品は既に売り切れまたは予約済みです'
      );
    });
  });

  describe('reserve', () => {
    it('should reserve product when available', () => {
      const beforeUpdate = productEntity.UpdatedAt;
      
      productEntity.reserve();
      
      expect(productEntity.Status).toBe(ProductStatus.RESERVED);
      expect(productEntity.UpdatedAt).not.toEqual(beforeUpdate);
    });

    it('should throw error when product is already sold', () => {
      productEntity.markAsSold();
      
      expect(() => productEntity.reserve()).toThrow(
        '商品は既に売り切れまたは予約済みです'
      );
    });

    it('should throw error when product is already reserved', () => {
      productEntity.reserve();
      
      expect(() => productEntity.reserve()).toThrow(
        '商品は既に売り切れまたは予約済みです'
      );
    });
  });

  describe('toPlainObject', () => {
    it('should return plain object representation', () => {
      const plainObject = productEntity.toPlainObject();
      
      expect(plainObject).toEqual(productData);
      expect(plainObject).not.toBe(productData); // should be a copy
    });
  });
});
