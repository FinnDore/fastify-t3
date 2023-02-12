import { createTRPCRouter, publicProcedure } from '../trpc';

export const randomRouter = createTRPCRouter({
    number: publicProcedure.query(({ ctx }) => Math.floor(Math.random() * 100)),
});
