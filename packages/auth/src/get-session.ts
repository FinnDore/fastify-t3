import type { GetServerSidePropsContext } from "next";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { getServerSession as $getServerSession } from "next-auth";

import { authOptions } from "./auth-options";

type GetServerSessionContext =
  | {
      req: GetServerSidePropsContext["req"];
      res: GetServerSidePropsContext["res"];
    }
  | {
      req: CreateFastifyContextOptions["req"];
      res: CreateFastifyContextOptions["res"];
    };
export const getServerSession = (ctx: GetServerSessionContext) => {
  return $getServerSession(ctx.req as any, ctx.res as any, authOptions);
};
