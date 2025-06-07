import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Star, MessageCircle } from "lucide-react";
import type { ReviewEntity } from "~/domain/entities/review";

interface ReviewTimelinePresentationProps {
	reviews: ReviewEntity[];
	loading: boolean;
}

export function ReviewTimelinePresentation({
	reviews,
	loading,
}: ReviewTimelinePresentationProps) {
	const formatTimeAgo = (date: Date): string => {
		const now = new Date();
		const diffInMinutes = Math.floor(
			(now.getTime() - date.getTime()) / (1000 * 60),
		);

		if (diffInMinutes < 1) return "たった今";
		if (diffInMinutes < 60) return `${diffInMinutes}分前`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
		return `${Math.floor(diffInMinutes / 1440)}日前`;
	};

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={crypto.randomUUID()}
				className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
			/>
		));
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<MessageCircle className="w-5 h-5" />
						レビュータイムライン
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={crypto.randomUUID()} className="animate-pulse">
								<div className="flex gap-3">
									<div className="bg-gray-300 w-8 h-8 rounded-full" />
									<div className="flex-1">
										<div className="bg-gray-300 h-4 rounded mb-2" />
										<div className="bg-gray-300 h-3 rounded w-3/4" />
									</div>
								</div>
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
					<MessageCircle className="w-5 h-5" />
					レビュータイムライン
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4 max-h-96 overflow-y-auto">
					{reviews.map((review) => {
						const data = review.toPlainObject();
						return (
							<div
								key={data.id.value}
								className="border-b border-gray-100 pb-4 last:border-b-0"
							>
								<div className="flex gap-3">
									<Avatar className="w-8 h-8">
										<AvatarFallback className="text-xs">
											{data.buyerName.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="text-sm font-medium truncate">
												{data.buyerName}
											</span>
											<div className="flex">{renderStars(data.rating)}</div>
										</div>
										<p className="text-xs text-gray-600 mb-1 truncate">
											{data.productTitle}
										</p>
										<p className="text-sm text-gray-800 line-clamp-2">
											{data.comment}
										</p>
										<p className="text-xs text-gray-500 mt-1">
											{formatTimeAgo(data.createdAt)}
										</p>
									</div>
								</div>
							</div>
						);
					})}
					{reviews.length === 0 && (
						<p className="text-center text-gray-500 py-4">
							まだレビューがありません
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
