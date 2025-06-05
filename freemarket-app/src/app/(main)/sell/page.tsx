import { ProductListContainer } from "~/components/product/product-list-container";
import { SearchBarContainer } from "~/components/search/search-bar-container";
import { CategoryFilterContainer } from "~/components/category/category-filter-container";
import { CategoryRankingContainer } from "~/components/ranking/category-ranking-container";
import { ReviewTimelineContainer } from "~/components/review/review-timeline-container";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-gray-900">フリマ</h1>
						<nav className="flex space-x-4">
							<a href="/sell" className="text-gray-600 hover:text-gray-900">
								出品
							</a>
							<a href="/profile" className="text-gray-600 hover:text-gray-900">
								マイページ
							</a>
						</nav>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<SearchBarContainer />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
					<aside className="lg:col-span-1 space-y-6">
						<CategoryFilterContainer />
						<CategoryRankingContainer />
					</aside>

					<div className="lg:col-span-2">
						<ProductListContainer />
					</div>

					<aside className="lg:col-span-1">
						<ReviewTimelineContainer />
					</aside>
				</div>
			</main>
		</div>
	);
}
