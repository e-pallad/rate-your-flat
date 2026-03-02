import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Prisma uses Node.js APIs — cannot run in the Edge Runtime.
export const runtime = "nodejs";

export default auth(async (req) => {
  const session = req.auth;

  // No session — unauthenticated request; let pages handle it normally.
  if (!session?.user?.id) return NextResponse.next();

  // Verify the user still exists in the database.
  // A single indexed PK lookup; runs on every authenticated request.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) {
    // User has been deleted. Clear the session cookie and redirect to login.
    const response = NextResponse.redirect(new URL("/login", req.url));
    // NextAuth v5 uses both plain and __Secure- prefixed variants depending on
    // whether the app is served over HTTPS.
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on all routes except NextAuth's own endpoints, Next.js internals,
    // and static assets — those do not require an auth check.
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
