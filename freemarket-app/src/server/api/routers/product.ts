import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { SearchProductsUseCase } from "@/application/use-cases/product/search-products-use-case";
import { CreateProductUseCase } from "@/application/use-cases/product/create-product-use-case";
import { PurchaseProductUseCase } from "@/application/use-cases/product/purchase-product-use-case";
import { AddStampUseCase } from "@/application/use-cases/stamp-card/add-stamp-use-case";
import { TrpcProductRepository } from "../repositories/trpc-product-repository";
import { TrpcStampCardRepository } from "../repositories/trpc-stamp-card-repository";
import { ProductCondition } from "@/domain/entities/product";

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
			const useCase = new SearchProductsUseCase(productRepository);
			const products = await useCase.execute(input);
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
			const useCase = new CreateProductUseCase(productRepository);
			const product = await useCase.execute(input);
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
			const purchaseUseCase = new PurchaseProductUseCase(productRepository);
			const addStampUseCase = new AddStampUseCase(stampCardRepository);

			await purchaseUseCase.execute(input);
			await addStampUseCase.execute(input.buyerId);

			return { success: true };
		}),
});
