import { NextResponse } from "next/server";
import { z } from "zod";

import { requestLoginCode } from "~/server/auth/service";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = schema.parse(json);
    await requestLoginCode(email);
    return new NextResponse(null, { status: 204 });
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
