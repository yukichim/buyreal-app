import type { ProductEntity } from "~/server/domain/entities/product";
import type { ProductRepository } from "~/server/domain/repositories/productRepository";

interface GetProductUseCaseInpputType {
	limit?: number;
	page?: number;
}

export class GetProductUseCaseInputData {
	constructor(private input: GetProductUseCaseInpputType) {}

	get Limit(): number {
		return this.input.limit ?? 0;
	}

	get Page(): number {
		return this.input.page ?? 0;
	}
}

export interface GetProductUseCase {
	execute(input: GetProductUseCaseInputData): Promise<ProductEntity[] | null>;
}

export class GetProductUseCaseInteractor implements GetProductUseCase {
	constructor(private repo: ProductRepository) {}

	async execute(
		input: GetProductUseCaseInputData,
	): Promise<ProductEntity[] | null> {
		return this.repo.getByPage();
	}
}
