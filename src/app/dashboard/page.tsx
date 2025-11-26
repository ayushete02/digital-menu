import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardView } from "./_components/dashboard-view";
import { createCallerFactory } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const createCaller = createCallerFactory(createTRPCContext);

export default async function DashboardPage() {
  const headerList = headers();
  const caller = createCaller({
    headers: new Headers(headerList as HeadersInit),
  });

  const user = await caller.auth.current();
  if (!user) {
    redirect("/login");
  }

  const restaurants = await caller.restaurants.list();

  return <DashboardView user={user} initialRestaurants={restaurants} />;
}
