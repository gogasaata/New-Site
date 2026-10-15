/** Small helpers shared by the API routes: same-origin check and a best-effort in-memory rate limiter. */

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

const buckets = new Map<string, { n: number; reset: number }>();

/** Returns true while the caller is still under `max` hits per `windowMs`. (Per server instance; a first line of defence.) */
export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= max;
}

export function clear(key: string) {
  buckets.delete(key);
}

export const noStore = { "Cache-Control": "no-store" };
