import type { ProductRepository } from "~/domain/repositories/productRepository";
import {
	ProductEntity,
	type Product,
	ProductStatus,
	type ProductCondition,
} from "~/domain/entities/product";

interface CreateProductRequest {
	title: string;
	description: string;
	price: number;
	condition: ProductCondition;
	sellerId: string;
	categoryId: string;
	images: string[];
}

/**
 * UseCase インプットデータ
 * @description インスタンス生成時にバリデーションをかける目的でクラス化
 */
export class CreateProductInputData {
	constructor(private request: CreateProductRequest) {
		if (!request.title) {
			throw new Error("param error: price  is invalid!");
		}
		if (!request.description) {
			throw new Error("param error: description is invalid!");
		}
		if (request.price < 0) {
			throw new Error("param error: price  is invalid!");
		}
		if (!request.condition) {
			throw new Error("param error: condition is invalid!");
		}
		if (!request.sellerId) {
			throw new Error("param error: sellerId is invalid!");
		}
		if (!request.categoryId) {
			throw new Error("param error: category id is invalid!");
		}
		if (!request.images) {
			throw new Error("param error: images is invalid!");
		}
	}

	get Title(): string {
		return this.request.title;
	}

	get Description(): string {
		return this.request.description;
	}

	get Price(): number {
		return this.request.price;
	}

	get Condition(): ProductCondition {
		return this.request.condition;
	}

	get SellerId(): string {
		return this.request.sellerId;
	}

	get CategoryId(): string {
		return this.request.categoryId;
	}

	get Images(): string[] {
		return this.request.images;
	}
}

/**
 * 商品登録のユースケース
 */
interface CreateProductUseCase {
	execute(request: CreateProductInputData): Promise<ProductEntity>;
}

/**
 * ユースケースの実装クラス
 */
export class CreateProductUseCaseInteractor implements CreateProductUseCase {
	constructor(private productRepository: ProductRepository) {}

	async execute(request: CreateProductInputData): Promise<ProductEntity> {
		const product: Product = {
			id: { value: crypto.randomUUID() },
			title: request.Title,
			description: request.Description,
			price: { amount: request.Price, currency: "JPY" },
			condition: request.Condition,
			status: ProductStatus.AVAILABLE,
			sellerId: { value: request.SellerId },
			categoryId: request.CategoryId,
			images: request.Images,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const productEntity = new ProductEntity(product);
		await this.productRepository.save(productEntity);

		return productEntity;
	}
}
