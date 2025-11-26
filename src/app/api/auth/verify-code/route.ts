import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie } from "~/server/auth/session";
import { verifyLoginCode } from "~/server/auth/service";
import { checkRateLimit, getClientIp } from "~/server/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  code: z.string(),
  name: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 10 verification attempts per 15 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(`verify:${clientIp}`, {
      maxRequests: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Too many verification attempts. Please try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 },
      );
    }

    const json = await req.json();
    const parsed = schema.parse(json);
    const { user, sessionToken } = await verifyLoginCode(parsed);
    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
      },
    });
    attachSessionCookie(res, sessionToken);
    return res;
  } catch (error) {
    console.error("[auth.verify-code]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please provide the required details" },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 400 }
    );
  }
}
