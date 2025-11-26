import { NextResponse } from "next/server";
import { z } from "zod";

import { attachSessionCookie } from "~/server/auth/session";
import { verifyLoginCode } from "~/server/auth/service";

const schema = z.object({
  email: z.string().email(),
  code: z.string(),
  name: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(req: Request) {
  try {
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
