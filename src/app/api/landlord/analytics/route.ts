import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseRatings } from "@/lib/ratings";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const flatId = searchParams.get("flatId");

    if (!flatId) {
      return NextResponse.json({ message: "flatId required" }, { status: 400 });
    }

    // Verify the flat belongs to this landlord
    const flat = await prisma.flat.findFirst({
      where: { id: flatId, landlordId: session.user.id },
      select: { id: true },
    });

    if (!flat) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const reviews = await prisma.review.findMany({
      where: { flatId },
      select: { id: true, ratings: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      ratings: parseRatings(r.ratings),
    }));

    return NextResponse.json({ reviews: formatted });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
