"use client";

import { useState } from "react";
import { StampCardPresentation } from "./stampCardPresentation";
import { trpc } from "~/lib/trpc";

export function StampCardContainer() {
	const [userId] = useState("current-user"); // 実際のアプリでは認証されたユーザーIDを使用

	const {
		data: stampCard,
		isLoading,
		refetch,
	} = trpc.stampCard.get.useQuery({ userId });
	const useRewardMutation = trpc.stampCard.useReward.useMutation({
		onSuccess: () => {
			refetch();
			alert("特典を使用しました！");
		},
		onError: (error) => {
			alert(error.message);
		},
	});

	const handleUseReward = () => {
		useRewardMutation.mutate({ userId });
	};

	return (
		<StampCardPresentation
			stampCard={stampCard}
			loading={isLoading}
			onUseReward={handleUseReward}
			usingReward={useRewardMutation.isLoading}
		/>
	);
}
