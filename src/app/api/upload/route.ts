import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];
  const ext = path.extname(file.name).toLowerCase();

  if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PDF, PNG, JPG, DOC, DOCX" },
      { status: 400 }
    );
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "File too large. Maximum size: 10MB" },
      { status: 400 }
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const uniqueName = `${randomUUID()}${ext || ".pdf"}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const fileUrl = `/api/upload/${uniqueName}`;

  return NextResponse.json({
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });
}
