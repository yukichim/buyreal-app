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

	get Id(): ProductId {
		return this.product.id;
	}
	get Title(): string {
		return this.product.title;
	}

	get Price(): Money {
		return {
			amount: this.product.price.amount,
			currency: this.product.price.currency,
		};
	}

	get Status(): ProductStatus {
		return this.product.status;
	}

	get SellerId(): string {
		return this.product.sellerId.value;
	}

	get CategoryId(): string {
		return this.product.categoryId;
	}
	get Descripyion(): string {
		return this.product.description;
	}
	get Condition(): string {
		return this.product.condition;
	}

	get Images(): string[] {
		return this.product.images;
	}

	get CreatedAt(): Date {
		return this.product.createdAt;
	}

	get UpdatedAt(): Date {
		return this.product.updatedAt;
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
