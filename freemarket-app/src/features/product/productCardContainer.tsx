"use client";

import type { ProductEntity } from "~/domain/entities/product";
import { ProductCardPresentation } from "./productCardPresentation";
import { trpc } from "~/lib/trpc";

interface ProductCardContainerProps {
	product: ProductEntity;
	onPurchaseSuccess: () => void;
}

export function ProductCardContainer({
	product,
	onPurchaseSuccess,
}: ProductCardContainerProps) {
	const purchaseMutation = trpc.product.purchase.useMutation({
		onSuccess: () => {
			alert("購入が完了しました！スタンプを1個獲得しました！");
			onPurchaseSuccess();
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const handlePurchase = async () => {
		purchaseMutation.mutate({
			productId: product.getId().value,
			buyerId: "current-user",
		});
	};

	return (
		<ProductCardPresentation
			product={product}
			purchasing={purchaseMutation.isPending}
			onPurchase={handlePurchase}
		/>
	);
}
