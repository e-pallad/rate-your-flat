import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { flatSchema } from "@/lib/validations";
import { randomBytes } from "crypto";

function generateSlug(address: string): string {
  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 50);
  const baseSlug = slugify(address);
  const uniqueSuffix = randomBytes(4).toString("hex");
  return `${baseSlug}-${uniqueSuffix}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [flats, total] = await Promise.all([
      prisma.flat.findMany({
        where: { verified: true },
        include: { landlord: { select: { name: true } }, reviews: { select: { ratings: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.flat.count({ where: { verified: true } }),
    ]);

    const flatsWithRating = flats.map((flat) => {
      const ratings = flat.reviews.map((r) => JSON.parse(r.ratings));
      const avgRating = ratings.length > 0 ? ratings.reduce((acc, r) => acc + (r.overall || 0), 0) / ratings.length : 0;
      return { ...flat, avgRating: parseFloat(avgRating.toFixed(1)), reviewCount: flat.reviews.length };
    });

    return NextResponse.json({
      flats: flatsWithRating,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching flats:", error);
    return NextResponse.json({ message: "Failed to fetch flats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = flatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { address, city, postalCode, country, description } = validation.data;
    const slug = generateSlug(address);

    const flat = await prisma.flat.create({
      data: {
        slug,
        address,
        city,
        postalCode,
        country,
        description,
        landlordId: session.user.id,
        verificationCode: randomBytes(16).toString("hex"),
      },
    });

    return NextResponse.json({ message: "Flat created successfully", flat }, { status: 201 });
  } catch (error) {
    console.error("Error creating flat:", error);
    return NextResponse.json({ message: "Failed to create flat" }, { status: 500 });
  }
}
