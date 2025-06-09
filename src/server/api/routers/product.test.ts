import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import { productRouter } from './product';
import { ProductCondition } from '~/server/domain/entities/product';
import type { ProductRepository } from '~/server/domain/repositories/productRepository';
import type { StampCardRepository } from '~/server/domain/repositories/stampCardRepository';

// UseCaseクラスのモック
vi.mock('~/server/application/usecase/product/getProductUsecase', () => ({
  GetProductUseCaseInputData: vi.fn().mockImplementation((data) => data),
  GetProductUseCaseInteractor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

vi.mock('~/server/application/usecase/product/createProductUsecase', () => ({
  CreateProductInputData: vi.fn().mockImplementation((data) => data),
  CreateProductUseCaseInteractor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

vi.mock('~/server/application/usecase/product/searchProductsUsecase', () => ({
  SearchProductsUseCaseInteractor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

vi.mock('~/server/application/usecase/product/purchaseProductUsecase', () => ({
  PurchaseProductUseCaseInteractor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

vi.mock('~/server/application/usecase/stampCard/addStampUsecase', () => ({
  AddStampUseCaseInteractor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

// Repositoryのモック
vi.mock('../repository/trpcProductRepository', () => ({
  TrpcProductRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../repository/trpcStampCardRepository', () => ({
  TrpcStampCardRepository: vi.fn().mockImplementation(() => ({})),
}));

describe('productRouter', () => {
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

  describe('getByPage', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: { value: '1' },
          title: 'Test Product 1',
          description: 'Description 1',
          price: { amount: 1000, currency: 'JPY' },
        },
        {
          id: { value: '2' },
          title: 'Test Product 2',
          description: 'Description 2',
          price: { amount: 2000, currency: 'JPY' },
        },
      ];

      // Mock the use case execution
      const mockExecute = vi.fn().mockResolvedValue(
        mockProducts.map(product => ({
          toPlainObject: () => product,
        }))
      );

      const { GetProductUseCaseInteractor } = await import('~/server/application/usecase/product/getProductUsecase');
      vi.mocked(GetProductUseCaseInteractor).mockImplementation(() => ({
        execute: mockExecute,
      }));

      server.use(
        trpcMsw.getByPage.query(() => {
          return mockProducts;
        })
      );

      // Test the actual router procedure
      const ctx = { db: {} }; // Mock context
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.getByPage();
      
      expect(result).toEqual(mockProducts);
    });
  });

  describe('search', () => {
    it('should search products with criteria', async () => {
      const searchInput = {
        keyword: 'iPhone',
        categoryId: 'electronics',
        minPrice: 1000,
        maxPrice: 50000,
        condition: 'GOOD',
      };

      const mockSearchResults = [
        {
          id: { value: '1' },
          title: 'iPhone 14',
          price: { amount: 120000, currency: 'JPY' },
        },
      ];

      const mockExecute = vi.fn().mockResolvedValue(
        mockSearchResults.map(product => ({
          toPlainObject: () => product,
        }))
      );

      const { SearchProductsUseCaseInteractor } = await import('~/server/application/usecase/product/searchProductsUsecase');
      vi.mocked(SearchProductsUseCaseInteractor).mockImplementation(() => ({
        execute: mockExecute,
      }));

      server.use(
        trpcMsw.search.query(() => {
          return mockSearchResults;
        })
      );

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.search(searchInput);
      
      expect(result).toEqual(mockSearchResults);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createInput = {
        title: 'New Product',
        description: 'New Description',
        price: 5000,
        condition: ProductCondition.NEW,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      const mockCreatedProduct = {
        id: { value: 'new-product-id' },
        ...createInput,
        price: { amount: createInput.price, currency: 'JPY' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockExecute = vi.fn().mockResolvedValue({
        toPlainObject: () => mockCreatedProduct,
      });

      const { CreateProductUseCaseInteractor } = await import('~/server/application/usecase/product/createProductUsecase');
      vi.mocked(CreateProductUseCaseInteractor).mockImplementation(() => ({
        execute: mockExecute,
      }));

      server.use(
        trpcMsw.create.mutation(() => {
          return mockCreatedProduct;
        })
      );

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.create(createInput);
      
      expect(result).toEqual(mockCreatedProduct);
    });

    it('should handle validation errors', async () => {
      const invalidInput = {
        title: '', // Invalid empty title
        description: 'Description',
        price: -100, // Invalid negative price
        condition: ProductCondition.NEW,
        sellerId: 'seller-1',
        categoryId: 'category-1',
        images: ['image1.jpg'],
      };

      const { CreateProductInputData } = await import('~/server/application/usecase/product/createProductUsecase');
      vi.mocked(CreateProductInputData).mockImplementation(() => {
        throw new Error('param error: price is invalid!');
      });

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.create(invalidInput)).rejects.toThrow('param error: price is invalid!');
    });
  });

  describe('purchase', () => {
    it('should handle product purchase and add stamp', async () => {
      const purchaseInput = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockPurchaseExecute = vi.fn().mockResolvedValue(undefined);
      const mockAddStampExecute = vi.fn().mockResolvedValue(undefined);

      const { PurchaseProductUseCaseInteractor } = await import('~/server/application/usecase/product/purchaseProductUsecase');
      const { AddStampUseCaseInteractor } = await import('~/server/application/usecase/stampCard/addStampUsecase');
      
      vi.mocked(PurchaseProductUseCaseInteractor).mockImplementation(() => ({
        execute: mockPurchaseExecute,
      }));
      
      vi.mocked(AddStampUseCaseInteractor).mockImplementation(() => ({
        execute: mockAddStampExecute,
      }));

      server.use(
        trpcMsw.purchase.mutation(() => {
          return { success: true };
        })
      );

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      const result = await caller.purchase(purchaseInput);
      
      expect(result).toEqual({ success: true });
    });

    it('should handle purchase use case errors', async () => {
      const purchaseInput = {
        productId: 'product-1',
        buyerId: 'buyer-1',
      };

      const mockPurchaseExecute = vi.fn().mockRejectedValue(new Error('Product not available'));

      const { PurchaseProductUseCaseInteractor } = await import('~/server/application/usecase/product/purchaseProductUsecase');
      vi.mocked(PurchaseProductUseCaseInteractor).mockImplementation(() => ({
        execute: mockPurchaseExecute,
      }));

      const ctx = { db: {} };
      const caller = productRouter.createCaller(ctx);
      
      await expect(caller.purchase(purchaseInput)).rejects.toThrow('Product not available');
    });
  });
});
