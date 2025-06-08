import type { ProductEntity, ProductId, UserId } from "../entities/product";

export interface ProductSearchCriteria {
	keyword?: string;
	categoryId?: string;
	minPrice?: number;
	maxPrice?: number;
	condition?: string;
	sellerId: UserId;
}

export interface ProductRepository {
	getByPage(): Promise<ProductEntity[] | null>;
	findById(id: ProductId): Promise<ProductEntity | null>;
	findByCriteria(criteria: ProductSearchCriteria): Promise<ProductEntity[]>;
	save(product: ProductEntity): Promise<void>;
	delete(id: ProductId): Promise<void>;
}
