"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Logo from "../../components/Logo";
import { CONTENT_FIELDS, DEFAULT_CONTENT } from "@/lib/content";

const input = "w-full border border-ink/20 bg-white px-3 py-2 text-[15px] outline-none focus:border-wine";

export default function AdminClient({ loggedIn: initial, configured }: { loggedIn: boolean; configured: boolean }) {
  const [loggedIn, setLoggedIn] = useState(initial);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_CONTENT);
  const [supabase, setSupabase] = useState(true);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const groups = useMemo(() => {
    const m = new Map<string, typeof CONTENT_FIELDS>();
    CONTENT_FIELDS.forEach((f) => m.set(f.group, [...(m.get(f.group) ?? []), f]));
    return [...m.entries()];
  }, []);
  const [tab, setTab] = useState(groups[0][0]);
  const [messages, setMessages] = useState<{ id: number; name: string; email: string; message: string; created_at: string }[]>([]);

  async function loadMessages() {
    const r = await fetch("/api/admin/messages");
    if (r.status === 401) return setLoggedIn(false);
    const d = await r.json();
    setMessages(d.messages ?? []);
  }
  async function removeMessage(id: number) {
    if (!confirm("Delete this message?")) return;
    await fetch("/api/admin/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadMessages();
  }

  useEffect(() => {
    if (!loggedIn) return;
    fetch("/api/admin/content").then(async (r) => {
      if (r.status === 401) return setLoggedIn(false);
      const d = await r.json();
      setContent({ ...DEFAULT_CONTENT, ...d.content });
      setSupabase(d.supabase);
    });
  }, [loggedIn]);

  async function login(e: FormEvent) {
    e.preventDefault();
    setLoginErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (r.ok) { setPassword(""); setLoggedIn(true); } else setLoginErr((await r.json()).error ?? "Login failed");
  }

  async function save() {
    setSaving(true); setStatus(null);
    const r = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    setSaving(false);
    if (r.ok) setStatus({ type: "ok", msg: "Saved. The live site is updated." });
    else if (r.status === 401) setLoggedIn(false);
    else setStatus({ type: "err", msg: (await r.json()).error ?? "Save failed" });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <form onSubmit={login} className="w-full max-w-[380px] border border-ink/10 bg-white p-10">
          <Logo className="h-[64px]" />
          <p className="mb-8 mt-2 text-[10px] uppercase tracking-[0.45em]">Admin</p>
          {!configured && <p className="mb-4 text-[14px] text-wine">ADMIN_PASSWORD is not set. Add it in your environment variables.</p>}
          <label className="mb-2 block text-[11px] uppercase tracking-eyebrow text-slate2" htmlFor="pw">Password</label>
          <input id="pw" type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          {loginErr && <p className="mt-3 text-[14px] text-wine">{loginErr}</p>}
          <button className="mt-6 h-[44px] w-full bg-wine text-[13px] uppercase tracking-[0.18em] text-white hover:bg-wine-dark">Sign in</button>
        </form>
      </main>
    );
  }

  const fields = groups.find(([g]) => g === tab)?.[1] ?? [];

  return (
    <main className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-cream/95 px-6 py-4 backdrop-blur">
        <div className="flex items-baseline gap-4">
          <Logo className="h-[40px]" />
          <span className="text-[12px] uppercase tracking-nav text-slate2">Content manager</span>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <a href="/" target="_blank" className="uppercase tracking-nav hover:text-wine">View site ↗</a>
          <button onClick={logout} className="uppercase tracking-nav hover:text-wine">Log out</button>
          <button onClick={save} disabled={saving || tab === "Messages"} className="h-[40px] bg-wine px-6 uppercase tracking-[0.18em] text-white hover:bg-wine-dark disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-6 py-10">
        {!supabase && (
          <p className="mb-6 border border-wine/40 bg-wine/5 p-4 text-[14px]">
            Supabase is not connected, so the site shows the built-in default text and changes cannot be saved yet. Set
            <code className="mx-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="mx-1">SUPABASE_SERVICE_ROLE_KEY</code>, then redeploy.
          </p>
        )}
        {status && (
          <p className={`mb-6 border p-4 text-[14px] ${status.type === "ok" ? "border-green-700/40 bg-green-50" : "border-wine/40 bg-wine/5"}`}>{status.msg}</p>
        )}
        <div className="mb-8 flex flex-wrap gap-2">
          {[...groups.map(([g]) => g), "Messages"].map((g) => (
            <button key={g} onClick={() => { setTab(g); if (g === "Messages") loadMessages(); }}
              className={`px-4 py-2 text-[12px] uppercase tracking-nav ${tab === g ? "bg-ink text-white" : "border border-ink/20 hover:border-wine"}`}>
              {g}
            </button>
          ))}
        </div>
        {tab === "Messages" ? (
          <div className="space-y-4">
            {messages.length === 0 && <p className="text-[14px] text-slate2">No messages yet{supabase ? "." : " (Supabase is not connected)."}</p>}
            {messages.map((m) => (
              <article key={m.id} className="border border-ink/15 bg-white p-4 text-[15px]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p><strong>{m.name}</strong> · <a className="text-wine hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
                  <p className="text-[12px] text-slate2">{new Date(m.created_at).toLocaleString("en-GB")}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
                <button onClick={() => removeMessage(m.id)} className="mt-3 text-[12px] uppercase tracking-nav text-slate2 hover:text-wine">Delete</button>
              </article>
            ))}
          </div>
        ) : (
        <div className="space-y-6">
          {fields.map((f) => (
            <div key={f.key}>
              <label htmlFor={f.key} className="mb-2 block text-[11px] uppercase tracking-eyebrow text-slate2">{f.label}</label>
              {f.multiline ? (
                <textarea id={f.key} rows={f.key.endsWith("about_text") ? 12 : 5} value={content[f.key] ?? ""} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} className={input} />
              ) : (
                <input id={f.key} value={content[f.key] ?? ""} onChange={(e) => setContent({ ...content, [f.key]: e.target.value })} className={input} />
              )}
              {f.hint && <p className="mt-1 text-[12px] text-slate2">{f.hint}</p>}
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}
