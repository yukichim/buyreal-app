import { PiggyBankIcon, UserRoundCogIcon } from "lucide-react";
import { CategoryFilterContainer } from "~/features/category/categoryFilterContainer";
import { ProductListContainer } from "~/features/product/productListContainer";
import { CategoryRankingContainer } from "~/features/ranking/categoryRankingContainer";
import { ReviewTimelineContainer } from "~/features/review/reviewTimelineContainer";
import { SearchBarContainer } from "~/features/search/searchBarContainer";
import { StampCardContainer } from "~/features/stampCard/stampCardContainer";

export default function HomePageClient() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-glay-300 shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-gray-900">BUYREAL+</h1>
						<nav className="flex space-x-10">
							<a
								href="/sell"
								className="flex gap-2 justify-center text-gray-600 hover:text-gray-900"
							>
								<PiggyBankIcon />
								かせぐ
							</a>
							<a
								href="/profile"
								className="flex gap-2 text-gray-600 hover:text-gray-900"
							>
								<UserRoundCogIcon />
								MyPage
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
						<StampCardContainer />
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
