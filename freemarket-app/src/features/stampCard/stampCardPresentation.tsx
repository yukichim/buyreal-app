"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Gift, Star } from "lucide-react";
import type { StampCard } from "~/domain/entities/stampCardEntity";

interface StampCardPresentationProps {
	stampCard?: StampCard;
	loading: boolean;
	onUseReward: () => void;
	usingReward: boolean;
}

export function StampCardPresentation({
	stampCard,
	loading,
	onUseReward,
	usingReward,
}: StampCardPresentationProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Gift className="w-5 h-5" />
						スタンプカード
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse">
						<div className="bg-gray-300 h-20 rounded mb-4" />
						<div className="bg-gray-300 h-4 rounded mb-2" />
						<div className="bg-gray-300 h-4 rounded w-2/3" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!stampCard) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Gift className="w-5 h-5" />
						スタンプカード
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-gray-500">スタンプカードが見つかりません</p>
				</CardContent>
			</Card>
		);
	}

	const stampsUntilReward = Math.max(0, 10 - stampCard.stamps);
	const canGetReward = stampCard.stamps >= 10;
	const rewardCount = Math.floor(stampCard.stamps / 10);

	const renderStamps = () => {
		const stamps = [];
		for (let i = 0; i < 10; i++) {
			stamps.push(
				<div
					key={i}
					className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
						i < stampCard.stamps % 10
							? "bg-yellow-400 border-yellow-400"
							: "bg-gray-100 border-gray-300"
					}`}
				>
					{i < stampCard.stamps % 10 && <Star className="w-4 h-4 text-white" />}
				</div>,
			);
		}
		return stamps;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2">
					<Gift className="w-5 h-5" />
					スタンプカード
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-5 gap-2">{renderStamps()}</div>

				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">現在のスタンプ</span>
						<Badge variant="secondary">{stampCard.stamps}個</Badge>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-600">総購入回数</span>
						<span className="text-sm font-medium">
							{stampCard.totalPurchases}回
						</span>
					</div>

					{rewardCount > 0 && (
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">利用可能な特典</span>
							<Badge variant="default">{rewardCount}個</Badge>
						</div>
					)}

					{!canGetReward && (
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">特典まで</span>
							<span className="text-sm font-medium">
								あと{stampsUntilReward}個
							</span>
						</div>
					)}
				</div>

				{canGetReward && (
					<Button
						onClick={onUseReward}
						disabled={usingReward}
						className="w-full"
					>
						{usingReward ? "使用中..." : "特典を使用する（10%オフクーポン）"}
					</Button>
				)}

				{stampCard.lastPurchaseDate && (
					<p className="text-xs text-gray-500 text-center">
						最後の購入:{" "}
						{new Date(stampCard.lastPurchaseDate).toLocaleDateString("ja-JP")}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
