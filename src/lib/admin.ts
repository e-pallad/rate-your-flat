import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Asserts that the current session belongs to an ADMIN.
 * Redirects to "/" if not authenticated or not an admin.
 * Returns the session for use in the calling page/route.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

/**
 * Asserts that the current session belongs to an ADMIN or MODERATOR.
 * Redirects to "/" if not authenticated or not authorized.
 * Returns the session for use in the calling page/route.
 */
export async function requireModeratorOrAdmin() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MODERATOR") redirect("/");
  return session;
}
