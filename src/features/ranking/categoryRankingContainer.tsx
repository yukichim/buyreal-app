"use client";

import { CategoryRankingPresentation } from "./categoryRankingPresentation";
import { trpc } from "~/lib/trpc";
import { CategoryRankingEntity } from "~/server/domain/entities/categoryRanking";

export function CategoryRankingContainer() {
	const { data: rankings = [], isLoading } =
		trpc.ranking.getCategories.useQuery({ limit: 5 });

	// Convert plain objects back to entities for the presentation layer
	const rankingEntities = rankings.map(
		(ranking) => new CategoryRankingEntity(ranking),
	);

	return (
		<CategoryRankingPresentation
			rankings={rankingEntities}
			loading={isLoading}
		/>
	);
}
