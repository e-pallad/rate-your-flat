import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

interface RatingsInput {
  overall: number;
  location: number;
  price: number;
  condition: number;
  noise: number;
  landlord: number;
}

function clampRating(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) return 1;
  return Math.min(5, Math.max(1, Math.round(num)));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "RENTER") {
      return NextResponse.json(
        { message: "Only renters can submit reviews" },
        { status: 403 },
      );
    }

    const { slug } = await params;
    const body = await req.json();
    const {
      overall,
      location,
      price,
      condition,
      noise,
      landlord,
      comment,
      isAnonymous,
    } = body;

    if (
      !comment ||
      typeof comment !== "string" ||
      comment.trim().length === 0
    ) {
      return NextResponse.json(
        { message: "Comment is required" },
        { status: 400 },
      );
    }

    if (comment.trim().length > 2000) {
      return NextResponse.json(
        { message: "Comment must be at most 2000 characters" },
        { status: 400 },
      );
    }

    const flat = await prisma.flat.findUnique({ where: { slug } });

    if (!flat) {
      return NextResponse.json({ message: "Flat not found" }, { status: 404 });
    }

    // Check for duplicate review
    const existing = await prisma.review.findUnique({
      where: { flatId_userId: { flatId: flat.id, userId: session.user.id } },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this flat" },
        { status: 400 },
      );
    }

    const ratings: RatingsInput = {
      overall: clampRating(overall),
      location: clampRating(location),
      price: clampRating(price),
      condition: clampRating(condition),
      noise: clampRating(noise),
      landlord: clampRating(landlord),
    };

    const review = await prisma.review.create({
      data: {
        flatId: flat.id,
        userId: session.user.id,
        ratings: JSON.stringify(ratings),
        comment: comment.trim(),
        isAnonymous: Boolean(isAnonymous),
      },
    });

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
