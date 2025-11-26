import { NextResponse } from "next/server";
import { z } from "zod";

import { requestLoginCode } from "~/server/auth/service";
import { checkRateLimit, getClientIp } from "~/server/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per 15 minutes per IP
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp, {
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`,
        },
        { status: 429 },
      );
    }

    const json = await req.json();
    const { email } = schema.parse(json);

    // Additional rate limit per email: 3 requests per 15 minutes
    const emailRateLimit = checkRateLimit(`email:${email}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000,
    });

    if (!emailRateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many code requests for this email. Please try again in ${emailRateLimit.retryAfter} seconds.`,
        },
        { status: 429 },
      );
    }

    const result = await requestLoginCode(email);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[auth.request-code]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Unable to send verification code" },
      { status: 500 }
    );
  }
}
