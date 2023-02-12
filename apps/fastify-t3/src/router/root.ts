import { createTRPCRouter } from '../trpc';
import { randomRouter } from './random';

export const appRouter = createTRPCRouter({
    random: randomRouter,
});

export type AppRouter = typeof appRouter;
