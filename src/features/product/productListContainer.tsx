"use client";

import { ProductEntity } from "~/server/domain/entities/product";
import { ProductListPresentation } from "./productListPresentation";
import { trpc } from "~/lib/trpc";

export function ProductListContainer() {
	const {
		data: products = [],
		isLoading,
		error,
		refetch,
	} = trpc.product.getByPage.useQuery();

	const productEntities = products?.map(
		(product) => new ProductEntity(product),
	);
	const handleProductUpdate = () => {
		refetch();
	};

	return (
		<ProductListPresentation
			products={productEntities ?? []}
			loading={isLoading}
			error={error?.message || null}
			onProductUpdate={handleProductUpdate}
		/>
	);
}
