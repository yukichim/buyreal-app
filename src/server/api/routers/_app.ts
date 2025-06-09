import { createTRPCRouter } from "../trpc";
import { productRouter } from "./product";
import { reviewRouter } from "./review";
import { rankingRouter } from "./ranking";
import { stampCardRouter } from "./stampCard";

export const appRouter = createTRPCRouter({
	product: productRouter,
	review: reviewRouter,
	ranking: rankingRouter,
	stampCard: stampCardRouter,
});

export type AppRouter = typeof appRouter;
