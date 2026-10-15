import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { noStore, sameOrigin } from "@/lib/guard";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: noStore });
  const res = NextResponse.json({ ok: true }, { headers: noStore });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
