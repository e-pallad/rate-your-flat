import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const flats = await prisma.flat.findMany({
      select: {
        id: true,
        slug: true,
        address: true,
        city: true,
        postalCode: true,
        verified: true,
        createdAt: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ flats });
  } catch (error) {
    console.error("Admin content flats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
