"use client";

import { ProductListPresentation } from "./productListPresentation";
import { trpc } from "~/lib/trpc";
import { ProductEntity } from "~/domain/entities/product";

export function ProductListContainer() {
	const {
		data: products = [],
		isLoading,
		error,
		refetch,
	} = trpc.product.search.useQuery({});

	const handleProductUpdate = () => {
		refetch();
	};

	// Convert plain objects back to entities for the presentation layer
	const productEntities = products.map((product) => new ProductEntity(product));

	return (
		<ProductListPresentation
			products={productEntities}
			loading={isLoading}
			error={error?.message || null}
			onProductUpdate={handleProductUpdate}
		/>
	);
}
