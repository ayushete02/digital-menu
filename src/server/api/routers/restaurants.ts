import { Prisma, type PrismaClient } from "../../../../generated/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { makeSlug } from "~/lib/slug";
import { imageUrlSchema } from "~/lib/validators";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

const restaurantSelect = {
  id: true,
  name: true,
  location: true,
  slug: true,
  publicId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RestaurantSelect;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  parentId: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  dishLinks: {
    orderBy: { orderIndex: "asc" },
    select: {
      orderIndex: true,
      categoryId: true,
      dish: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
          spiceLevel: true,
          isAvailable: true,
          sortOrder: true,
        },
      },
    },
  },
} satisfies Prisma.CategorySelect;

const dishSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  imageUrl: true,
  spiceLevel: true,
  isAvailable: true,
  sortOrder: true,
  categories: {
    select: {
      categoryId: true,
      orderIndex: true,
    },
    orderBy: { orderIndex: "asc" },
  },
} satisfies Prisma.DishSelect;

const restaurantIdSchema = z.string().cuid();
const cuidSchema = z.string().cuid();

const generateUniqueSlug = async (db: PrismaClient, name: string) => {
  const base = makeSlug(name);
  if (!base) {
    return Math.random().toString(36).slice(2, 10);
  }
  let attempt = 0;
  let slug = base;
  while (true) {
    const existing = await db.restaurant.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!existing) break;
    attempt += 1;
    slug = `${base}-${attempt + 1}`;
  }
  return slug;
};

const generateUniqueCategorySlug = async (
  db: PrismaClient,
  restaurantId: string,
  name: string,
) => {
  const base = makeSlug(name);
  const fallback = Math.random().toString(36).slice(2, 8);
  let attempt = 0;
  let slug = base || fallback;

  while (true) {
    const existing = await db.category.findFirst({
      where: { restaurantId, slug },
      select: { id: true },
    });
    if (!existing) break;
    attempt += 1;
    slug = `${base || fallback}-${attempt + 1}`;
  }
  return slug;
};

export const restaurantRouter = createTRPCRouter({
  // Public endpoint to list all restaurants
  listAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.restaurant.findMany({
      orderBy: { createdAt: "desc" },
      select: restaurantSelect,
    });
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.restaurant.findMany({
      where: { ownerId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      select: restaurantSelect,
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(120),
        location: z.string().min(2).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const slug = await generateUniqueSlug(ctx.db, input.name);

      return ctx.db.restaurant.create({
        data: {
          ownerId: ctx.user.id,
          name: input.name,
          location: input.location,
          slug,
        },
        select: restaurantSelect,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        restaurantId: restaurantIdSchema,
        name: z.string().min(2).max(120),
        location: z.string().min(2).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: input.restaurantId, ownerId: ctx.user.id },
      });

      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      return ctx.db.restaurant.update({
        where: { id: restaurant.id },
        data: {
          name: input.name,
          location: input.location,
        },
        select: restaurantSelect,
      });
    }),

  detail: protectedProcedure
    .input(z.object({ restaurantId: restaurantIdSchema }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findFirst({
        where: { id: input.restaurantId, ownerId: ctx.user.id },
        select: {
          ...restaurantSelect,
          categories: {
            where: { parentId: null },
            orderBy: { displayOrder: "asc" },
            select: {
              ...categorySelect,
              children: {
                orderBy: { displayOrder: "asc" },
                select: categorySelect,
              },
            },
          },
          dishes: {
            orderBy: { sortOrder: "asc" },
            select: dishSelect,
          },
        },
      });

      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      return restaurant;
    }),

  createCategory: protectedProcedure
    .input(
      z.object({
        restaurantId: restaurantIdSchema,
        name: z.string().min(2).max(80),
        parentId: cuidSchema.optional(),
        displayOrder: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findFirst({
        where: { id: input.restaurantId, ownerId: ctx.user.id },
        select: { id: true },
      });

      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      if (input.parentId) {
        const parent = await ctx.db.category.findFirst({
          where: { id: input.parentId, restaurantId: restaurant.id },
          select: { id: true },
        });
        if (!parent) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid parent category" });
        }
      }

      const slug = await generateUniqueCategorySlug(ctx.db, restaurant.id, input.name);

      return ctx.db.category.create({
        data: {
          name: input.name,
          slug,
          restaurantId: restaurant.id,
          parentId: input.parentId ?? null,
          displayOrder: input.displayOrder ?? 0,
        },
        select: categorySelect,
      });
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        categoryId: cuidSchema,
        restaurantId: restaurantIdSchema,
        name: z.string().min(2).max(80).optional(),
        displayOrder: z.number().int().min(0).optional(),
        parentId: cuidSchema.optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          restaurant: { ownerId: ctx.user.id, id: input.restaurantId },
        },
        select: { id: true, restaurantId: true },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      if (input.parentId) {
        const parent = await ctx.db.category.findFirst({
          where: { id: input.parentId, restaurantId: category.restaurantId },
          select: { id: true },
        });
        if (!parent) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid parent category" });
        }
      }

      return ctx.db.category.update({
        where: { id: category.id },
        data: {
          name: input.name,
          parentId: input.parentId ?? null,
          displayOrder: input.displayOrder ?? undefined,
        },
        select: categorySelect,
      });
    }),

  deleteCategory: protectedProcedure
    .input(
      z.object({
        categoryId: cuidSchema,
        restaurantId: restaurantIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.categoryId,
          restaurantId: input.restaurantId,
          restaurant: { ownerId: ctx.user.id },
        },
        select: { id: true },
      });

      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.category.delete({ where: { id: category.id } });

      return { success: true };
    }),

  createDish: protectedProcedure
    .input(
      z.object({
        restaurantId: restaurantIdSchema,
        name: z.string().min(2).max(120).transform((val) => val.trim()),
        description: z.string().max(600).transform((val) => val.trim()).optional(),
        price: z.number().min(0).max(1000000).optional(),
        imageUrl: imageUrlSchema.optional(),
        spiceLevel: z.string().max(50).transform((val) => val.trim()).optional(),
        isAvailable: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        categoryIds: z.array(cuidSchema).min(1, "At least one category is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findFirst({
        where: { id: input.restaurantId, ownerId: ctx.user.id },
        select: { id: true },
      });
      if (!restaurant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Restaurant not found" });
      }

      const categories = await ctx.db.category.findMany({
        where: { id: { in: input.categoryIds }, restaurantId: restaurant.id },
        select: { id: true },
      });

      if (categories.length !== input.categoryIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid categories" });
      }

      return ctx.db.dish.create({
        data: {
          restaurantId: restaurant.id,
          name: input.name,
          description: input.description,
          price: input.price !== undefined ? new Prisma.Decimal(input.price) : undefined,
          imageUrl: input.imageUrl,
          spiceLevel: input.spiceLevel,
          isAvailable: input.isAvailable ?? true,
          sortOrder: input.sortOrder ?? 0,
          categories: {
            create: input.categoryIds.map((categoryId, index) => ({
              category: { connect: { id: categoryId } },
              orderIndex: index,
            })),
          },
        },
        select: dishSelect,
      });
    }),

  updateDish: protectedProcedure
    .input(
      z.object({
        dishId: cuidSchema,
        restaurantId: restaurantIdSchema,
        name: z.string().min(2).max(120).transform((val) => val.trim()).optional(),
        description: z.string().max(600).transform((val) => val.trim()).optional().nullable(),
        price: z.number().min(0).max(1000000).optional().nullable(),
        imageUrl: imageUrlSchema.nullable().optional(),
        spiceLevel: z.string().max(50).transform((val) => val.trim()).optional().nullable(),
        isAvailable: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        categoryIds: z.array(cuidSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dish = await ctx.db.dish.findFirst({
        where: {
          id: input.dishId,
          restaurantId: input.restaurantId,
          restaurant: { ownerId: ctx.user.id },
        },
        select: { id: true },
      });

      if (!dish) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dish not found" });
      }

      return ctx.db.dish.update({
        where: { id: dish.id },
        data: {
          name: input.name ?? undefined,
          description: input.description ?? undefined,
          price:
            input.price !== undefined
              ? input.price === null
                ? null
                : new Prisma.Decimal(input.price)
              : undefined,
          imageUrl: input.imageUrl ?? undefined,
          spiceLevel: input.spiceLevel ?? undefined,
          isAvailable: input.isAvailable ?? undefined,
          sortOrder: input.sortOrder ?? undefined,
          categories: input.categoryIds
            ? {
                deleteMany: {},
                create: input.categoryIds.map((categoryId, index) => ({
                  category: { connect: { id: categoryId } },
                  orderIndex: index,
                })),
              }
            : undefined,
        },
        select: dishSelect,
      });
    }),

  deleteDish: protectedProcedure
    .input(
      z.object({ dishId: cuidSchema, restaurantId: restaurantIdSchema }),
    )
    .mutation(async ({ ctx, input }) => {
      const dish = await ctx.db.dish.findFirst({
        where: {
          id: input.dishId,
          restaurantId: input.restaurantId,
          restaurant: { ownerId: ctx.user.id },
        },
        select: { id: true },
      });

      if (!dish) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Dish not found" });
      }

      await ctx.db.dish.delete({ where: { id: dish.id } });

      return { success: true };
    }),
});
