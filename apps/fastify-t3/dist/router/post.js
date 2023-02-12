import { createTRPCRouter, publicProcedure } from '../trpc';
export const postRouter = createTRPCRouter({
    randomNumber: publicProcedure.query(({ ctx }) => Math.floor(Math.random() * 100)),
});
