import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { ProductCondition } from "~/domain/entities/product";
import { TrpcProductRepository } from "../repository/trpcProductRepository";
import { TrpcStampCardRepository } from "../repository/trpcStampCardRepository";
import {
	CreateProductInputData,
	CreateProductUseCaseInteractor,
} from "~/application/usecase/product/createProductUsecase";
import { PurchaseProductUseCaseInteractor } from "~/application/usecase/product/purchaseProductUsecase";
import { SearchProductsUseCaseInteractor } from "~/application/usecase/product/searchProductsUsecase";
import { AddStampUseCaseInteractor } from "~/application/usecase/stampCard/addStampUsecase";
import type { ProductSearchCriteria } from "~/domain/repositories/productRepository";

const productRepository = new TrpcProductRepository();
const stampCardRepository = new TrpcStampCardRepository();

export const productRouter = router({
	search: publicProcedure
		.input(
			z.object({
				keyword: z.string().optional(),
				categoryId: z.string().optional(),
				minPrice: z.number().optional(),
				maxPrice: z.number().optional(),
				condition: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			const useCase = new SearchProductsUseCaseInteractor(productRepository);
			const inputData: ProductSearchCriteria = {
				sellerId: { value: "" },
			};
			const products = await useCase.execute(inputData);
			return products.map((product) => product.toPlainObject());
		}),

	create: publicProcedure
		.input(
			z.object({
				title: z.string(),
				description: z.string(),
				price: z.number(),
				condition: z.nativeEnum(ProductCondition),
				sellerId: z.string(),
				categoryId: z.string(),
				images: z.array(z.string()),
			}),
		)
		.mutation(async ({ input }) => {
			const useCase = new CreateProductUseCaseInteractor(productRepository);
			const inputData = new CreateProductInputData(input);
			const product = await useCase.execute(inputData);
			return product.toPlainObject();
		}),

	purchase: publicProcedure
		.input(
			z.object({
				productId: z.string(),
				buyerId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const purchaseUseCase = new PurchaseProductUseCaseInteractor(
				productRepository,
			);
			const addStampUseCase = new AddStampUseCaseInteractor(
				stampCardRepository,
			);

			await purchaseUseCase.execute(input);
			await addStampUseCase.execute(input.buyerId);

			return { success: true };
		}),
});
