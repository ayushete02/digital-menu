import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardView } from "./_components/dashboard-view";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

export default async function DashboardPage() {
  const headerList = await headers();
  const caller = appRouter.createCaller(
    await createTRPCContext({ headers: new Headers(headerList) })
  );

  const user = await caller.auth.current();
  if (!user) {
    redirect("/login");
  }

  const restaurants = await caller.restaurants.list();

  return <DashboardView user={user} initialRestaurants={restaurants} />;
}
