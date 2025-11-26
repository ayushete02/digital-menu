import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { createCallerFactory } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import { MenuView } from "./_components/menu-view";

const createCaller = createCallerFactory(createTRPCContext);

export default async function MenuPage({
  params,
}: {
  params: { slug: string };
}) {
  const headerList = headers();
  const caller = createCaller({
    headers: new Headers(headerList as HeadersInit),
  });

  const restaurant = await caller.menu.bySlug({ slug: params.slug });

  if (!restaurant) notFound();

  return <MenuView restaurant={restaurant} />;
}
