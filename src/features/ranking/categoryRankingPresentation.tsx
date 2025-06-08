import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { CategoryRankingEntity } from "~/domain/entities/categoryRanking";

interface CategoryRankingPresentationProps {
	rankings: CategoryRankingEntity[];
	loading: boolean;
}

export function CategoryRankingPresentation({
	rankings,
	loading,
}: CategoryRankingPresentationProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<TrendingUp className="w-5 h-5" />
						人気カテゴリー
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<div key={crypto.randomUUID()} className="animate-pulse">
								<div className="bg-gray-300 h-4 rounded mb-1" />
								<div className="bg-gray-300 h-3 rounded w-2/3" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<TrendingUp className="w-5 h-5" />
					人気カテゴリー
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{rankings.map((ranking) => {
						const data = ranking.toPlainObject();
						return (
							<div
								key={data.categoryId}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-2">
									<Badge
										variant={data.rank <= 3 ? "default" : "secondary"}
										className="w-6 h-6 p-0 flex items-center justify-center text-xs"
									>
										{data.rank}
									</Badge>
									<div>
										<p className="text-sm font-medium">{data.categoryName}</p>
										<p className="text-xs text-gray-500">
											{data.soldCount}件売れています
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-xs text-gray-500">売上</p>
									<p className="text-sm font-medium">
										¥{data.totalRevenue.toLocaleString()}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
