import { describe, it, expect, beforeEach } from 'vitest';
import { ReviewEntity, type Review, type ReviewId } from './review';

describe('ReviewEntity', () => {
  let reviewData: Review;
  let reviewEntity: ReviewEntity;

  beforeEach(() => {
    reviewData = {
      id: { value: 'review-1' } as ReviewId,
      productId: 'product-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      rating: 4,
      comment: 'Great product!',
      productTitle: 'Test Product',
      buyerName: 'Test Buyer',
      createdAt: new Date('2024-01-01'),
    };
    reviewEntity = new ReviewEntity(reviewData);
  });

  describe('getters', () => {
    it('should return correct id', () => {
      expect(reviewEntity.getId()).toEqual({ value: 'review-1' });
    });

    it('should return correct rating', () => {
      expect(reviewEntity.getRating()).toBe(4);
    });

    it('should return correct comment', () => {
      expect(reviewEntity.getComment()).toBe('Great product!');
    });

    it('should return correct product title', () => {
      expect(reviewEntity.getProductTitle()).toBe('Test Product');
    });

    it('should return correct buyer name', () => {
      expect(reviewEntity.getBuyerName()).toBe('Test Buyer');
    });

    it('should return correct created date', () => {
      expect(reviewEntity.getCreatedAt()).toEqual(new Date('2024-01-01'));
    });
  });

  describe('isValidRating', () => {
    it('should return true for rating 1', () => {
      const review = new ReviewEntity({ ...reviewData, rating: 1 });
      expect(review.isValidRating()).toBe(true);
    });

    it('should return true for rating 3', () => {
      const review = new ReviewEntity({ ...reviewData, rating: 3 });
      expect(review.isValidRating()).toBe(true);
    });

    it('should return true for rating 5', () => {
      const review = new ReviewEntity({ ...reviewData, rating: 5 });
      expect(review.isValidRating()).toBe(true);
    });

    it('should return false for rating 0', () => {
      const review = new ReviewEntity({ ...reviewData, rating: 0 });
      expect(review.isValidRating()).toBe(false);
    });

    it('should return false for rating 6', () => {
      const review = new ReviewEntity({ ...reviewData, rating: 6 });
      expect(review.isValidRating()).toBe(false);
    });

    it('should return false for negative rating', () => {
      const review = new ReviewEntity({ ...reviewData, rating: -1 });
      expect(review.isValidRating()).toBe(false);
    });
  });

  describe('toPlainObject', () => {
    it('should return plain object representation', () => {
      const plainObject = reviewEntity.toPlainObject();
      
      expect(plainObject).toEqual(reviewData);
      expect(plainObject).not.toBe(reviewData); // should be a copy
    });
  });
});
