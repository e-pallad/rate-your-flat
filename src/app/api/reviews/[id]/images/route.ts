import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkCsrf } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGES_PER_REVIEW = 5;

// Derive extension from validated MIME type — never from user-controlled file.name
// to prevent storing malicious .html/.js files in public/uploads/.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!checkCsrf(req)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;

    // Verify the review belongs to the current user
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 },
      );
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File too large. Maximum 5 MB" },
        { status: 400 },
      );
    }

    // Use MIME type to derive extension — never trust file.name (XSS prevention)
    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const filename = `${reviewId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const relativePath = `/uploads/${filename}`;

    // Atomically check the per-review image quota and reserve the DB slot
    // BEFORE writing to disk. This prevents orphaned files when the quota is
    // already at the limit or when a concurrent upload races ahead of us.
    let image: { id: string };
    try {
      image = await prisma.$transaction(async (tx) => {
        const count = await tx.flatImage.count({ where: { reviewId } });
        if (count >= MAX_IMAGES_PER_REVIEW) {
          throw new Error("TOO_MANY");
        }
        return tx.flatImage.create({
          data: { reviewId, filename, path: relativePath },
          select: { id: true },
        });
      });
    } catch (txError) {
      if (txError instanceof Error && txError.message === "TOO_MANY") {
        return NextResponse.json(
          { message: `Maximum ${MAX_IMAGES_PER_REVIEW} images per review` },
          { status: 400 },
        );
      }
      throw txError;
    }

    // DB slot reserved — now persist the file. If writeFile throws, the DB
    // record is left without a backing file, but that is recoverable; the
    // inverse (file without DB record) is not (orphaned public asset).
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return NextResponse.json(
      { id: image.id, path: relativePath },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
