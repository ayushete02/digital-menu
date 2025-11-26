import { createHmac, randomBytes } from "node:crypto";

import { env } from "~/env";

const HASH_ALGO = "sha256";

export const generateVerificationCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};

export const hashVerificationCode = (code: string, email: string) =>
  createHmac(HASH_ALGO, env.SESSION_SECRET)
    .update(`${email}:${code}`)
    .digest("hex");

export const generateSessionToken = () =>
  randomBytes(32).toString("hex");

export const hashSessionToken = (token: string) =>
  createHmac(HASH_ALGO, env.SESSION_SECRET).update(token).digest("hex");
