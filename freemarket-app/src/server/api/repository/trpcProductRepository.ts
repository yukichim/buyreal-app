import {
	ProductCondition,
	ProductEntity,
	ProductStatus,
	type Product,
	type ProductId,
} from "~/domain/entities/product";
import type {
	ProductRepository,
	ProductSearchCriteria,
} from "~/domain/repositories/productRepository";

export class TrpcProductRepository implements ProductRepository {
	private products: Map<string, ProductEntity> = new Map();

	constructor() {
		this.initializeSampleData();
	}

	private initializeSampleData(): void {
		const sampleProducts: Product[] = [
			{
				id: { value: "1" },
				title: "iPhone 14 Pro",
				description: "美品です。使用期間は1年程度。",
				price: { amount: 120000, currency: "JPY" },
				condition: ProductCondition.LIKE_NEW,
				status: ProductStatus.AVAILABLE,
				sellerId: { value: "user1" },
				categoryId: "electronics",
				images: ["/placeholder.svg?height=300&width=300"],
				createdAt: new Date("2024-01-15"),
				updatedAt: new Date("2024-01-15"),
			},
			{
				id: { value: "2" },
				title: "ナイキ エアマックス",
				description: "サイズ27cm。数回着用のみ。",
				price: { amount: 8500, currency: "JPY" },
				condition: ProductCondition.GOOD,
				status: ProductStatus.AVAILABLE,
				sellerId: { value: "user2" },
				categoryId: "fashion",
				images: ["/placeholder.svg?height=300&width=300"],
				createdAt: new Date("2024-01-10"),
				updatedAt: new Date("2024-01-10"),
			},
			{
				id: { value: "3" },
				title: "MacBook Air M2",
				description: "2023年モデル。ほぼ未使用。",
				price: { amount: 150000, currency: "JPY" },
				condition: ProductCondition.NEW,
				status: ProductStatus.SOLD,
				sellerId: { value: "user3" },
				categoryId: "electronics",
				images: ["/placeholder.svg?height=300&width=300"],
				createdAt: new Date("2024-01-05"),
				updatedAt: new Date("2024-01-20"),
			},
			{
				id: { value: "4" },
				title: "Nintendo Switch",
				description: "付属品完備。動作確認済み。",
				price: { amount: 25000, currency: "JPY" },
				condition: ProductCondition.GOOD,
				status: ProductStatus.AVAILABLE,
				sellerId: { value: "user1" },
				categoryId: "books",
				images: ["/placeholder.svg?height=300&width=300"],
				createdAt: new Date("2024-01-12"),
				updatedAt: new Date("2024-01-12"),
			},
		];

		for (const p of sampleProducts) {
			this.products.set(p.id.value, new ProductEntity(p));
		}
	}
	async findById(id: ProductId): Promise<ProductEntity | null> {
		return this.products.get(id.value) || null;
	}

	async findByCriteria(
		criteria: ProductSearchCriteria,
	): Promise<ProductEntity[]> {
		const products = Array.from(this.products.values());

		return products.filter((product) => {
			const productData = product.toPlainObject();

			if (criteria.keyword) {
				const keyword = criteria.keyword.toLowerCase();
				if (
					!productData.title.toLowerCase().includes(keyword) &&
					!productData.description.toLowerCase().includes(keyword)
				) {
					return false;
				}
			}

			if (
				criteria.categoryId &&
				productData.categoryId !== criteria.categoryId
			) {
				return false;
			}

			if (criteria.minPrice && productData.price.amount < criteria.minPrice) {
				return false;
			}

			if (criteria.maxPrice && productData.price.amount > criteria.maxPrice) {
				return false;
			}

			if (criteria.condition && productData.condition !== criteria.condition) {
				return false;
			}

			if (
				criteria.sellerId &&
				productData.sellerId.value !== criteria.sellerId.value
			) {
				return false;
			}

			return true;
		});
	}

	async save(product: ProductEntity): Promise<void> {
		this.products.set(product.getId().value, product);
	}

	async delete(id: ProductId): Promise<void> {
		this.products.delete(id.value);
	}
}
