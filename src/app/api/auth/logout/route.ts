import { parse } from "cookie";
import { NextResponse } from "next/server";

import { clearSessionCookie } from "~/server/auth/session";
import { revokeSession } from "~/server/auth/service";
import { SESSION_COOKIE_NAME } from "~/server/auth/constants";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const res = new NextResponse(null, { status: 204 });
  try {
    if (cookieHeader) {
      const cookies = parse(cookieHeader);
      const token = cookies[SESSION_COOKIE_NAME];
      if (token) await revokeSession(token);
    }
  } catch (error) {
    console.error("[auth.logout]", error);
  } finally {
    clearSessionCookie(res);
  }

  return res;
}
