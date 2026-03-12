import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const flatId = searchParams.get("flatId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    if (!flatId) {
      return NextResponse.json(
        { message: "flatId is required" },
        { status: 400 },
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { flatId },
        include: { user: { select: { name: true } }, images: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { flatId } }),
    ]);

    // Mask reviewer name for anonymous reviews
    const sanitized = reviews.map((r) => ({
      ...r,
      user: r.isAnonymous ? null : r.user,
    }));

    return NextResponse.json({
      reviews: sanitized,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "RENTER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { flatId, ratings, comment, isAnonymous } = validation.data;

    const existingReview = await prisma.review.findFirst({
      where: { flatId, userId: session.user.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this flat" },
        { status: 400 },
      );
    }

    const flat = await prisma.flat.findUnique({ where: { id: flatId } });
    if (!flat) {
      return NextResponse.json({ message: "Flat not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        flatId,
        userId: session.user.id,
        ratings: JSON.stringify(ratings),
        comment,
        isAnonymous,
      },
    });

    return NextResponse.json(
      { message: "Review submitted successfully", id: review.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Failed to create review" },
      { status: 500 },
    );
  }
}
