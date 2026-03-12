import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  checkRateLimit,
  checkCsrf,
  getClientIdentifier,
} from "@/lib/rate-limit";

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
    if (!checkCsrf(req)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const session = await auth();

    // Rate limit: authenticated users keyed on user ID, guests keyed on IP.
    const rateLimitKey = session
      ? `review:${session.user.id}`
      : `review-guest:${getClientIdentifier(req)}`;

    const rateResult = checkRateLimit(rateLimitKey, {
      windowMs: 60_000,
      maxRequests: 10,
    });
    if (!rateResult.allowed) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 },
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
      guestName,
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

    // Authenticated users: enforce one review per flat
    if (session) {
      const existing = await prisma.review.findFirst({
        where: { flatId: flat.id, userId: session.user.id },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { message: "You have already reviewed this flat" },
          { status: 400 },
        );
      }
    }

    const ratings: RatingsInput = {
      overall: clampRating(overall),
      location: clampRating(location),
      price: clampRating(price),
      condition: clampRating(condition),
      noise: clampRating(noise),
      landlord: clampRating(landlord),
    };

    // Build create data — userId is nullable in schema (guest reviews have no account)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createData: any = {
      flatId: flat.id,
      userId: session?.user.id ?? null,
      guestName:
        !session && guestName && typeof guestName === "string"
          ? guestName.trim().slice(0, 100)
          : null,
      ratings: JSON.stringify(ratings),
      comment: comment.trim(),
      isAnonymous: Boolean(isAnonymous),
    };

    const review = await prisma.review.create({ data: createData });

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (error) {
    console.error("Submit review error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
