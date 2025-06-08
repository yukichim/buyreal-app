import {
	GetProductUseCaseInputData,
	type GetProductUseCase,
} from "~/server/application/usecase/product/getProductUsecase";
import type {
	Money,
	ProductCondition,
	ProductEntity,
	ProductStatus,
} from "~/server/domain/entities/product";

export type ResponseGetByPage = {
	id: string;
	title: string;
	description: string;
	price: Money;
	condition: ProductCondition;
	status: ProductStatus;
	sellerId: string;
	categoryId: string;
	images: string[];
	createdAt: Date;
	updatedAt: Date;
};

export class GetProductAdapter {
	constructor(private usecase: GetProductUseCase) {}

	async getByPage(): Promise<ResponseGetByPage[] | null> {
		const usecaseInput = new GetProductUseCaseInputData({});
		const useCaseOutput = await this.usecase.execute(usecaseInput);
		const adapterResponse = this.convertToResponse(useCaseOutput);
		return adapterResponse;
	}

	private convertToResponse(
		output: ProductEntity[] | null,
	): ResponseGetByPage[] | null {
		if (!output) {
			console.log("get products return data is null.");
			return null;
		}
		return output?.map((e) => {
			return {
				id: e.Id.value,
				categoryId: e.CategoryId,
				condition: e.Condition,
				description: e.Descripyion,
				images: e.Images,
				price: e.Price,
				sellerId: e.SellerId,
				status: e.Status,
				title: e.Title,
				updatedAt: e.UpdatedAt,
				createdAt: e.CreatedAt,
			} as ResponseGetByPage;
		});
	}
}
