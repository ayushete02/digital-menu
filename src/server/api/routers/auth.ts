import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  current: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    const { id, email, name, country } = ctx.user;
    return { id, email, name, country };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(120),
        country: z.string().min(2).max(120),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        country: updated.country,
      };
    }),
});
