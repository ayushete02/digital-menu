import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import { MenuView } from "./_components/menu-view";

type RouteParams = {
  slug: string;
};

export default async function MenuPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const headerList = await headers();
  const caller = appRouter.createCaller(
    await createTRPCContext({ headers: new Headers(headerList) })
  );

  const { slug } = await params;
  const restaurant = await caller.menu.bySlug({ slug });

  if (!restaurant) notFound();

  return <MenuView restaurant={restaurant} />;
}
