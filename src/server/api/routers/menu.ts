import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const categoryInclude = {
  dishLinks: {
    where: { dish: { isAvailable: true } },
    orderBy: { orderIndex: "asc" },
    include: {
      dish: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          spiceLevel: true,
        },
      },
    },
  },
  children: {
    orderBy: { displayOrder: "asc" },
    include: {
      dishLinks: {
        where: { dish: { isAvailable: true } },
        orderBy: { orderIndex: "asc" },
        include: {
          dish: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              imageUrl: true,
              spiceLevel: true,
            },
          },
        },
      },
    },
  },
} as const;

export const menuRouter = createTRPCRouter({
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          location: true,
          slug: true,
          publicId: true,
          categories: {
            where: { parentId: null },
            orderBy: { displayOrder: "asc" },
            include: categoryInclude,
          },
        },
      });

      if (!restaurant) return null;

      return restaurant;
    }),

  byPublicId: publicProcedure
    .input(z.object({ publicId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { publicId: input.publicId },
        select: {
          id: true,
          name: true,
          location: true,
          slug: true,
          publicId: true,
          categories: {
            where: { parentId: null },
            orderBy: { displayOrder: "asc" },
            include: categoryInclude,
          },
        },
      });

      if (!restaurant) return null;

      return restaurant;
    }),
});
