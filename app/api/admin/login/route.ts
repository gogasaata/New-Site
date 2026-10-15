import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, cookieOptions, createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server." }, { status: 503 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(), cookieOptions);
  return res;
}
