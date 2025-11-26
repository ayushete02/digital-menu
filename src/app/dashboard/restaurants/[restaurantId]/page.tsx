import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import { RestaurantManager } from "./_components/restaurant-manager";

type RouteParams = {
  restaurantId: string;
};

export default async function RestaurantPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const headerList = await headers();
  const caller = appRouter.createCaller(
    await createTRPCContext({ headers: new Headers(headerList) })
  );

  const { restaurantId } = await params;
  const user = await caller.auth.current();
  if (!user) redirect("/login");

  const restaurant = await caller.restaurants.detail({
    restaurantId,
  });

  if (!restaurant) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <RestaurantManager restaurantId={restaurantId} initialData={restaurant} />
    </div>
  );
}
