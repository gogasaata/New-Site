import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { getSupabase, supabaseConfigured } from "@/lib/content";
import { noStore, sameOrigin } from "@/lib/guard";

async function authed() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  const sb = supabaseConfigured() ? getSupabase() : null;
  if (!sb) return NextResponse.json({ messages: [], supabase: false }, { headers: noStore });
  const { data, error } = await sb
    .from("contact_messages")
    .select("id,name,email,message,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: noStore });
  return NextResponse.json({ messages: data, supabase: true }, { headers: noStore });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  const { id } = (await req.json().catch(() => ({}))) as { id?: unknown };
  const sb = supabaseConfigured() ? getSupabase() : null;
  if (!sb || typeof id !== "number" || !Number.isInteger(id)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { error } = await sb.from("contact_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: noStore });
}
