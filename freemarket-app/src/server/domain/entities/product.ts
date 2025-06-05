/**
 * 商品IDの値オブジェクトIF
 */
export interface ProductId {
	value: string;
}

export interface UserId {
	value: string;
}

export interface Money {
	amount: number;
	currency: string;
}

export interface Money {
	amount: number;
	currency: string;
}

export enum ProductStatus {
	AVAILABLE = "AVAILABLE",
	SOLD = "SOLD",
	RESERVED = "RESERVED",
}

export enum ProductCondition {
	NEW = "NEW",
	LIKE_NEW = "LIKE_NEW",
	GOOD = "GOOD",
	FAIR = "FAIR",
	POOR = "POOR",
}

export interface Product {
	id: ProductId;
	title: string;
	description: string;
	price: Money;
	condition: ProductCondition;
	status: ProductStatus;
	sellerId: UserId;
	categoryId: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
}

export class ProductEntity {
	constructor(private product: Product) {}

	getId(): ProductId {
		return this.product.id;
	}
	getTitle(): string {
		return this.product.title;
	}

	getPrice(): Money {
		return this.product.price;
	}

	getStatus(): ProductStatus {
		return this.product.status;
	}

	isAvailable(): boolean {
		return this.product.status === ProductStatus.AVAILABLE;
	}

	/**
	 * 完売フラグ
	 */
	markAsSold(): void {
		if (!this.isAvailable()) {
			throw new Error("商品は既に売り切れまたは予約済みです");
		}
		this.product.status = ProductStatus.SOLD;
		this.product.updatedAt = new Date();
	}

	/**
	 * 予約済みフラグ
	 */
	reserve(): void {
		if (!this.isAvailable()) {
			throw new Error("商品は既に売り切れまたは予約済みです");
		}
		this.product.status = ProductStatus.RESERVED;
		this.product.updatedAt = new Date();
	}

	toPlainObject(): Product {
		return { ...this.product };
	}
}
