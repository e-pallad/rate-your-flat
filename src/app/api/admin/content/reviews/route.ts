import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        flat: { select: { address: true, city: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Admins intentionally receive full identity for all reviews, including anonymous ones (per privacy policy)
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Admin content reviews error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
