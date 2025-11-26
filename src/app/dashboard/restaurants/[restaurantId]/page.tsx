import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { createCallerFactory } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

import { RestaurantManager } from "./_components/restaurant-manager";

const createCaller = createCallerFactory(createTRPCContext);

type Params = {
  params: {
    restaurantId: string;
  };
};

export default async function RestaurantPage({ params }: Params) {
  const headerList = headers();
  const caller = createCaller({
    headers: new Headers(headerList as HeadersInit),
  });

  const user = await caller.auth.current();
  if (!user) redirect("/login");

  const restaurant = await caller.restaurants.detail({
    restaurantId: params.restaurantId,
  });

  if (!restaurant) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <RestaurantManager
        restaurantId={params.restaurantId}
        initialData={restaurant}
      />
    </div>
  );
}
