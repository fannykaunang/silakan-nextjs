// File: app/api/file-upload/route.ts
// FINAL FIXED VERSION - dengan proper type checking untuk uploaded_by

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { createFileUpload } from "@/lib/models/file-upload.model";

export async function POST(request: NextRequest) {
  try {
    // requireAuth will throw error if unauthorized
    const user = await requireAuth();

    // Validate user has pegawai_id
    if (!user.pegawai_id) {
      return NextResponse.json(
        { success: false, message: "User pegawai_id tidak ditemukan" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const laporanId = formData.get("laporan_id") as string;
    const files = formData.getAll("files") as File[];

    if (!laporanId) {
      return NextResponse.json(
        { success: false, message: "Laporan ID diperlukan" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Create upload directory if not exists
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "laporan-kegiatan"
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size === 0) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const ext = path.extname(file.name);
      const filename = `${timestamp}-${randomString}${ext}`;
      const filepath = path.join(uploadDir, filename);

      // Write file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Save to database
      const fileData = {
        laporan_id: parseInt(laporanId),
        nama_file_asli: file.name,
        nama_file_sistem: filename,
        path_file: `/uploads/laporan-kegiatan/${filename}`,
        tipe_file: file.type,
        ukuran_file: file.size,
        uploaded_by: user.pegawai_id, // Now TypeScript knows this is number, not undefined
        deskripsi_file: null,
      };

      const fileId = await createFileUpload(fileData);
      uploadedFiles.push({ ...fileData, file_id: fileId });
    }

    return NextResponse.json({
      success: true,
      message: "File berhasil diupload",
      data: uploadedFiles,
    });
  } catch (error: any) {
    console.error("Error uploading files:", error);

    // Handle unauthorized error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat mengupload file" },
      { status: 500 }
    );
  }
}
