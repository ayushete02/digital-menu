import { redirect } from "next/navigation";

import { getCurrentSession } from "~/server/auth/session";

export default async function HomePage() {
  const session = await getCurrentSession();

  redirect(session ? "/dashboard" : "/login");
}
