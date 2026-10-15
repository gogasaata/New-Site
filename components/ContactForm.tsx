"use client";

import { FormEvent, useState } from "react";

const field =
  "w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 text-[16px] outline-none transition-colors placeholder:text-ink/40 focus:border-wine";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    const body = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) { setState("sent"); form.reset(); return; }
    setErr((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setState("error");
  }

  if (state === "sent")
    return <p className="font-serif text-[28px] leading-snug text-ink">Thank you. <span className="text-wine">We will be in touch shortly.</span></p>;

  return (
    <form onSubmit={submit} className="relative space-y-6">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <input name="name" required maxLength={200} placeholder="Name" aria-label="Name" className={field} />
      <input name="email" type="email" required maxLength={200} placeholder="Email" aria-label="Email" className={field} />
      <textarea name="message" required maxLength={5000} rows={4} placeholder="How can we help?" aria-label="Message" className={`${field} resize-none`} />
      {state === "error" && <p className="text-[14px] text-wine">{err}</p>}
      <button
        disabled={state === "sending"}
        className="inline-flex h-[47px] items-center bg-wine px-[34px] text-[13px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine-dark disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
