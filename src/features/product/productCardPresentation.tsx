"use client";

import Image from "next/image";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import {
	type ProductEntity,
	ProductStatus,
	ProductCondition,
} from "~/server/domain/entities/product";

interface ProductCardPresentationProps {
	product: ProductEntity;
	purchasing: boolean;
	onPurchase: () => void;
}

export function ProductCardPresentation({
	product,
	purchasing,
	onPurchase,
}: ProductCardPresentationProps) {
	const productData = product.toPlainObject();

	const getConditionLabel = (condition: ProductCondition): string => {
		switch (condition) {
			case ProductCondition.NEW:
				return "新品";
			case ProductCondition.LIKE_NEW:
				return "未使用に近い";
			case ProductCondition.GOOD:
				return "目立った傷や汚れなし";
			case ProductCondition.FAIR:
				return "やや傷や汚れあり";
			case ProductCondition.POOR:
				return "傷や汚れあり";
			default:
				return "";
		}
	};

	const getStatusBadge = (status: ProductStatus) => {
		switch (status) {
			case ProductStatus.SOLD:
				return <Badge variant="destructive">売り切れ</Badge>;
			case ProductStatus.RESERVED:
				return <Badge variant="secondary">予約済み</Badge>;
			default:
				return null;
		}
	};

	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow">
			<CardHeader className="p-0">
				<div className="relative">
					<Image
						src={
							productData.images[0] || "/placeholder.svg?height=200&width=300"
						}
						alt={productData.title}
						width={300}
						height={200}
						className="w-full h-48 object-cover"
					/>
					{getStatusBadge(productData.status) && (
						<div className="absolute top-2 right-2">
							{getStatusBadge(productData.status)}
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className="p-4">
				<h3 className="font-semibold text-lg mb-2 line-clamp-2">
					{productData.title}
				</h3>
				<p className="text-gray-600 text-sm mb-2 line-clamp-2">
					{productData.description}
				</p>
				<div className="flex justify-between items-center mb-2">
					<span className="text-2xl font-bold text-red-600">
						¥{productData.price.amount.toLocaleString()}
					</span>
					<Badge variant="outline">
						{getConditionLabel(productData.condition)}
					</Badge>
				</div>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					className="w-full"
					disabled={!product.isAvailable() || purchasing}
					onClick={onPurchase}
				>
					{purchasing
						? "購入中..."
						: product.isAvailable()
							? "購入する"
							: "売り切れ"}
				</Button>
			</CardFooter>
		</Card>
	);
}
