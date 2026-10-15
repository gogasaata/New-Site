import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, cookieOptions, createSession, SESSION_COOKIE } from "@/lib/auth";
import { allow, clear, clientIp, noStore, sameOrigin } from "@/lib/guard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: noStore });
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured: set ADMIN_PASSWORD and ADMIN_SESSION_SECRET (24+ random characters)." },
      { status: 503, headers: noStore },
    );
  }
  const key = "login:" + clientIp(req);
  if (!allow(key, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429, headers: noStore });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof password !== "string" || password.length > 200 || !(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401, headers: noStore });
  }
  clear(key);
  const res = NextResponse.json({ ok: true }, { headers: noStore });
  res.cookies.set(SESSION_COOKIE, await createSession(), cookieOptions);
  return res;
}
