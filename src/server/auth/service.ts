import { z } from "zod";

import { db } from "~/server/db";

import { VERIFICATION_CODE_TTL_MINUTES } from "./constants";
import {
  generateSessionToken,
  generateVerificationCode,
  hashSessionToken,
  hashVerificationCode,
} from "./tokens";
import { persistSession } from "./session";
import { sendLoginCodeEmail } from "../notifications/email";

const emailSchema = z.string().email();
const nameSchema = z.string().min(2).max(120);
const countrySchema = z.string().min(2).max(120);

export const requestLoginCode = async (emailRaw: string) => {
  const email = emailSchema.parse(emailRaw.toLowerCase().trim());

  await db.verificationCode.deleteMany({
    where: {
      email,
      OR: [
        { expiresAt: { lt: new Date() } },
        { consumedAt: { not: null } },
      ],
    },
  });

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code, email);
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000);

  const existingUser = await db.user.findUnique({ where: { email } });

  await db.verificationCode.create({
    data: {
      email,
      codeHash,
      expiresAt,
      userId: existingUser?.id,
    },
  });

  const delivery = await sendLoginCodeEmail(email, code);

  return delivery;
};

export const verifyLoginCode = async (input: {
  email: string;
  code: string;
  name?: string;
  country?: string;
}) => {
  const email = emailSchema.parse(input.email.toLowerCase().trim());
  const code = input.code.trim();
  if (!/^[0-9]{6}$/.test(code)) {
    throw new Error("Invalid verification code");
  }

  const codeHash = hashVerificationCode(code, email);

  const verification = await db.verificationCode.findFirst({
    where: {
      email,
      codeHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    throw new Error("Code is invalid or has expired");
  }

  const existingUser = await db.user.findUnique({ where: { email } });

  const requiresProfile = !existingUser;

  const name = requiresProfile
    ? nameSchema.parse(input.name?.trim())
    : input.name?.trim();
  const country = requiresProfile
    ? countrySchema.parse(input.country?.trim())
    : input.country?.trim();

  const user = existingUser
    ? await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: name ?? existingUser.name,
          country: country ?? existingUser.country,
        },
      })
    : await db.user.create({
        data: {
          email,
          name: nameSchema.parse(name),
          country: countrySchema.parse(country),
        },
      });

  await db.verificationCode.update({
    where: { id: verification.id },
    data: { consumedAt: new Date() },
  });

  const sessionToken = generateSessionToken();
  await persistSession(user.id, sessionToken);

  return {
    user,
    sessionToken,
  } as const;
};

export const revokeSession = async (token: string) => {
  const tokenHash = hashSessionToken(token);
  await db.session.deleteMany({ where: { tokenHash } });
};
