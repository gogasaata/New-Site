import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { ALLOWED_KEYS, getContent, getSupabase, supabaseConfigured, validateValue } from "@/lib/content";
import { noStore, sameOrigin } from "@/lib/guard";

async function authed() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function GET() {
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ content: await getContent(), supabase: supabaseConfigured() }, { headers: noStore });
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await authed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = supabaseConfigured() ? getSupabase() : null;
  if (!sb) {
    return NextResponse.json(
      { error: "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Content cannot be saved yet." },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => null)) as { content?: Record<string, string> } | null;
  const rows = Object.entries(body?.content ?? {})
    .filter(([k, v]) => ALLOWED_KEYS.has(k) && typeof v === "string")
    .map(([key, value]) => ({ key, value: value.slice(0, 5000), updated_at: new Date().toISOString() }));
  for (const r of rows) {
    const msg = validateValue(r.key, r.value);
    if (msg) return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (!rows.length) return NextResponse.json({ error: "Nothing to save." }, { status: 400 });

  const { error } = await sb.from("site_content").upsert(rows, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
