"use client";

import { useEffect } from "react";
import { trpc } from "~/lib/trpc";
import { ReviewEntity } from "~/server/domain/entities/review";
import { ReviewTimelinePresentation } from "./reviewTimelinePresentation";

export function ReviewTimelineContainer() {
	const {
		data: reviews = [],
		isLoading,
		refetch,
	} = trpc.review.getTimeline.useQuery({ limit: 10 });

	useEffect(() => {
		// 30秒ごとに更新（リアルタイム感を演出）
		const interval = setInterval(() => {
			refetch();
		}, 30000);
		return () => clearInterval(interval);
	}, [refetch]);

	// Convert plain objects back to entities for the presentation layer
	const reviewEntities = reviews.map((review) => new ReviewEntity(review));

	return (
		<ReviewTimelinePresentation reviews={reviewEntities} loading={isLoading} />
	);
}
