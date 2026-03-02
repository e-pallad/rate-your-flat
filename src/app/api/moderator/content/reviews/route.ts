import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
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

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Moderator content reviews error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
