import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { flatSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/slug";
import { checkCsrf } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [flats, total] = await Promise.all([
      prisma.flat.findMany({
        where: { verified: true },
        include: {
          landlord: { select: { name: true } },
          reviews: { select: { ratings: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.flat.count({ where: { verified: true } }),
    ]);

    const flatsWithRating = flats.map((flat) => {
      const ratings = flat.reviews.map((r) => {
        try {
          return JSON.parse(r.ratings);
        } catch {
          return {};
        }
      });
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((acc, r) => acc + (r.overall || 0), 0) /
            ratings.length
          : 0;
      return {
        ...flat,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: flat.reviews.length,
      };
    });

    return NextResponse.json({
      flats: flatsWithRating,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching flats:", error);
    return NextResponse.json(
      { message: "Failed to fetch flats" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!checkCsrf(req)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = flatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 },
      );
    }

    const {
      address,
      city,
      postalCode,
      country,
      description,
      latitude: clientLat,
      longitude: clientLng,
    } = validation.data;
    const isLandlord = session.user.role === "LANDLORD";
    const slug = generateSlug(address.trim(), city.trim());

    const verificationCode = crypto.randomUUID();

    // Use client-provided coordinates if available; otherwise geocode via Nominatim
    let latitude: number | null = clientLat ?? null;
    let longitude: number | null = clientLng ?? null;
    if (latitude === null || longitude === null) {
      try {
        const query = encodeURIComponent(
          `${address.trim()}, ${postalCode.trim()} ${city.trim()}, ${country ?? "Germany"}`,
        );
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "RateYourFlat/1.0 (contact@rateyourflat.de)",
            },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          }
        }
      } catch {
        // geocoding failure is non-fatal
      }
    }

    const flat = await prisma.flat.create({
      data: {
        slug,
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country ?? "Germany",
        description: description?.trim() || null,
        landlordId: isLandlord ? session.user.id : null,
        submittedById: session.user.id,
        verified: false,
        verificationCode,
        latitude,
        longitude,
      },
    });

    return NextResponse.json(
      { slug: flat.slug, verificationCode: flat.verificationCode },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating flat:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
