import { ProductCardContainer } from "./productCardContainer";
import type { ProductEntity } from "~/domain/entities/product";

interface ProductListPresentationProps {
	products: ProductEntity[];
	loading: boolean;
	error: string | null;
	onProductUpdate: () => void;
}

export function ProductListPresentation({
	products,
	loading,
	error,
	onProductUpdate,
}: ProductListPresentationProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[...Array(6)].map((_, i) => (
					<div
						key={crypto.randomUUID()}
						className="bg-white rounded-lg shadow-md p-4 animate-pulse"
					>
						<div className="bg-gray-300 h-48 rounded-md mb-4" />
						<div className="bg-gray-300 h-4 rounded mb-2" />
						<div className="bg-gray-300 h-4 rounded w-2/3" />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600">{error}</p>
			</div>
		);
	}

	return (
		<div>
			<h2 className="text-xl font-semibold mb-6">商品一覧</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{products.map((product) => (
					<ProductCardContainer
						key={product.getId().value}
						product={product}
						onPurchaseSuccess={onProductUpdate}
					/>
				))}
			</div>
		</div>
	);
}
