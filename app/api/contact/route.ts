import { NextResponse } from "next/server";
import { getSupabase, supabaseConfigured } from "@/lib/content";
import { allow, clientIp, sameOrigin } from "@/lib/guard";

/**
 * Contact form pipeline:
 *  1. validate + rate-limit (and a hidden honeypot field catches simple bots)
 *  2. store the lead in the Supabase table `contact_messages` (read it in /admin -> Messages)
 *  3. optionally e-mail it too, when RESEND_API_KEY + CONTACT_TO_EMAIL are configured
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!allow("contact:" + clientIp(req), 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof b.website === "string" && b.website) return NextResponse.json({ ok: true }); // honeypot: pretend success

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = str(b.name, 200);
  const email = str(b.email, 200);
  const message = str(b.message, 5000);
  if (!name || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email) || !message) {
    return NextResponse.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
  }

  let stored = false;
  const sb = supabaseConfigured() ? getSupabase() : null;
  if (sb) {
    const { error } = await sb.from("contact_messages").insert({ name, email, message });
    stored = !error;
  }

  let emailed = false;
  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "VIN Holding <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `New website enquiry from ${name.replace(/[\r\n]/g, " ")}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    }).catch(() => null);
    emailed = !!r?.ok;
  }

  if (!stored && !emailed) {
    return NextResponse.json({ error: "Messages cannot be received right now. Please email us directly." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
