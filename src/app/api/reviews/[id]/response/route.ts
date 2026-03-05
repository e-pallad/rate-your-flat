import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { landlordResponseSchema } from "@/lib/validations";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "LANDLORD") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = landlordResponseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({ where: { id }, include: { flat: true } });

    if (!review) {
      return NextResponse.json({ message: "Review not found" }, { status: 404 });
    }

    if (review.flat.landlordId !== session.user.id) {
      return NextResponse.json({ message: "Not authorized to respond to this review" }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { landlordResponse: validation.data.response, landlordResponseAt: new Date() },
    });

    return NextResponse.json({ message: "Response submitted successfully", review: updatedReview });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json({ message: "Failed to submit response" }, { status: 500 });
  }
}
