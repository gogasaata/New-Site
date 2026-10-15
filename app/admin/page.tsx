import { cookies } from "next/headers";
import type { Metadata } from "next";
import { adminConfigured, SESSION_COOKIE, verifySession } from "@/lib/auth";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — VIN Holding", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const loggedIn = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return <AdminClient loggedIn={loggedIn} configured={adminConfigured()} />;
}
