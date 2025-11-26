import { parse } from "cookie";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "~/server/db";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./constants";
import { hashSessionToken } from "./tokens";

export const attachSessionCookie = (res: NextResponse, token: string) => {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

export const clearSessionCookie = (res: NextResponse) => {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
};

export const persistSession = async (userId: string, token: string) => {
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { tokenHash, expiresAt };
};

export const revokeSessionByToken = async (token: string) => {
  const tokenHash = hashSessionToken(token);
  await db.session.deleteMany({
    where: { tokenHash },
  });
};

export const getSessionFromHeaders = async (headers: Headers) => {
  const raw = headers.get("cookie");
  if (!raw) return null;
  const cookieJar = parse(raw);
  const token = cookieJar[SESSION_COOKIE_NAME];
  if (!token) return null;
  const tokenHash = hashSessionToken(token);

  const session = await db.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  return {
    token,
    session,
    user: session.user,
  } as const;
};

export const getCurrentSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = hashSessionToken(token);

  const session = await db.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;
  return {
    token,
    session,
    user: session.user,
  } as const;
};
