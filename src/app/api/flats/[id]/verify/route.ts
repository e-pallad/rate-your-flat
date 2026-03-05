import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyFlatSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = verifyFlatSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const flat = await prisma.flat.findFirst({ where: { id, landlordId: session.user.id } });

    if (!flat) {
      return NextResponse.json({ message: "Flat not found or unauthorized" }, { status: 404 });
    }

    if (flat.verified) {
      return NextResponse.json({ message: "Flat is already verified" }, { status: 400 });
    }

    if (flat.verificationCode !== validation.data.verificationCode) {
      return NextResponse.json({ message: "Invalid verification code" }, { status: 400 });
    }

    const updatedFlat = await prisma.flat.update({
      where: { id },
      data: { verified: true, verifiedAt: new Date(), verificationCode: null },
    });

    return NextResponse.json({ message: "Flat verified successfully", flat: updatedFlat });
  } catch (error) {
    console.error("Error verifying flat:", error);
    return NextResponse.json({ message: "Failed to verify flat" }, { status: 500 });
  }
}
