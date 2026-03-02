import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const [totalUsers, totalFlats, totalReviews, totalModerators] = await Promise.all([
      prisma.user.count(),
      prisma.flat.count(),
      prisma.review.count(),
      prisma.user.count({ where: { role: "MODERATOR" } }),
    ]);

    return NextResponse.json({ totalUsers, totalFlats, totalReviews, totalModerators });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
