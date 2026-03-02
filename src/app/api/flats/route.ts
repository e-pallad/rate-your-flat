import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

function generateSlug(address: string, city: string): string {
  const base = `${address}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  // Append a short random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { address, city, postalCode, country, description } =
      await req.json();

    if (!address || !city || !postalCode) {
      return NextResponse.json(
        { message: "Missing required fields: address, city, postalCode" },
        { status: 400 },
      );
    }

    if (
      typeof address !== "string" ||
      typeof city !== "string" ||
      typeof postalCode !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid field types" },
        { status: 400 },
      );
    }

    const isLandlord = session.user.role === "LANDLORD";

    const flat = await prisma.flat.create({
      data: {
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: (typeof country === "string" && country.trim()) || "Germany",
        description:
          typeof description === "string" ? description.trim() || null : null,
        slug: generateSlug(address.trim(), city.trim()),
        // Landlords become the linked landlord; renters leave it unclaimed
        landlordId: isLandlord ? session.user.id : null,
        submittedById: session.user.id,
        verified: false,
      },
    });

    return NextResponse.json({ slug: flat.slug }, { status: 201 });
  } catch (error) {
    console.error("Create flat error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
