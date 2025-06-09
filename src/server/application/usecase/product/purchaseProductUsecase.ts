import type { ProductRepository } from "~/server/domain/repositories/productRepository";
import type { ProductId } from "~/server/domain/entities/product";

export interface PurchaseProductRequest {
	productId: string;
	buyerId: string;
}

interface PurchaseProductUseCase {
	execute(request: PurchaseProductRequest): Promise<void>;
}

export class PurchaseProductUseCaseInteractor
	implements PurchaseProductUseCase
{
	constructor(private productRepository: ProductRepository) {}

	async execute(request: PurchaseProductRequest): Promise<void> {
		const productId: ProductId = { value: request.productId };
		const product = await this.productRepository.findById(productId);

		if (!product) {
			throw new Error("商品が見つかりません");
		}

		if (!product.isAvailable()) {
			throw new Error("この商品は購入できません");
		}

		// 自分の商品は購入できない
		if (product.toPlainObject().sellerId.value === request.buyerId) {
			throw new Error("自分の商品は購入できません");
		}

		product.markAsSold();
		await this.productRepository.save(product);
	}
}
