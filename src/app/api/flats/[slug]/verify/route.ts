import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LANDLORD") {
      return NextResponse.json(
        { message: "Only landlords can verify flats" },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { message: "Verification code is required" },
        { status: 400 }
      );
    }

    const flat = await prisma.flat.findUnique({
      where: { slug },
    });

    if (!flat) {
      return NextResponse.json({ message: "Flat not found" }, { status: 404 });
    }

    if (flat.landlordId && flat.landlordId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (flat.verified) {
      return NextResponse.json(
        { message: "Flat is already verified" },
        { status: 400 }
      );
    }

    if (!flat.verificationCode || flat.verificationCode !== code.trim()) {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    await prisma.flat.update({
      where: { slug },
      data: {
        verified: true,
        verifiedAt: new Date(),
        landlordId: session.user.id, // claim the flat if unclaimed
      },
    });

    return NextResponse.json({ message: "Flat verified successfully" });
  } catch (error) {
    console.error("Verify flat error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
