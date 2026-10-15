import { NextResponse } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/content";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { name?: string; email?: string; message?: string };
  const name = (b.name ?? "").trim().slice(0, 200);
  const email = (b.email ?? "").trim().slice(0, 200);
  const message = (b.message ?? "").trim().slice(0, 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return NextResponse.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
  }
  const sb = supabaseConfigured() ? getSupabase() : null;
  if (sb) {
    const { error } = await sb.from("contact_messages").insert({ name, email, message });
    if (error) return NextResponse.json({ error: "Could not send message. Please try again later." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
