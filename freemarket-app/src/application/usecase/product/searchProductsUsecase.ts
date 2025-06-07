import type {
	ProductRepository,
	ProductSearchCriteria,
} from "~/domain/repositories/productRepository";
import type { ProductEntity } from "~/domain/entities/product";

interface SearchProductsUseCase {
	execute(criteria: ProductSearchCriteria): Promise<ProductEntity[]>;
}

export class SearchProductsUseCaseInteractor implements SearchProductsUseCase {
	constructor(private productRepository: ProductRepository) {}

	async execute(criteria: ProductSearchCriteria): Promise<ProductEntity[]> {
		return await this.productRepository.findByCriteria(criteria);
	}
}
