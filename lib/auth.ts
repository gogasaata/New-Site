export const SESSION_COOKIE = "vin_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

const enc = new TextEncoder();

/**
 * The cookie is signed with ADMIN_SESSION_SECRET, which must be a different, long random value from the
 * password: if the same string signed the cookie, a stolen cookie could be used to brute-force the password offline.
 */
function secret() {
  const s = process.env.ADMIN_SESSION_SECRET || "";
  if (s.length >= 24) return s;
  return process.env.NODE_ENV === "production" ? "" : "dev-only-session-secret-change-me-0123456789";
}

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function adminConfigured() {
  return !!process.env.ADMIN_PASSWORD && !!secret();
}

export async function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !secret()) return false;
  // Compare HMACs (fixed length) so neither length nor content leaks through timing.
  const [a, b] = await Promise.all([sign("pw:" + input), sign("pw:" + pw)]);
  return safeEqual(a, b);
}

export async function createSession() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  return `${exp}.${await sign(exp)}`;
}

export async function verifySession(token: string | undefined) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(exp));
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
