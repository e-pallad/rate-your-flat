import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "ADMIN" && role !== "MODERATOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { slug } = await params;

    const flat = await prisma.flat.findUnique({ where: { slug } });
    if (!flat) {
      return NextResponse.json({ message: "Flat not found" }, { status: 404 });
    }

    await prisma.flat.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Moderator delete flat error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
