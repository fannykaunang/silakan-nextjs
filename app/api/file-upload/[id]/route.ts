// File: app/api/file-upload/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/helpers/auth-helper";
import { unlink } from "fs/promises";
import path from "path";
import { getFileById, deleteFileUpload } from "@/lib/models/file-upload.model";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // requireAuth will throw error if unauthorized
    const user = await requireAuth();

    const params = await context.params;
    const fileId = parseInt(params.id);

    if (isNaN(fileId)) {
      return NextResponse.json(
        { success: false, message: "ID file tidak valid" },
        { status: 400 }
      );
    }

    // Get file info
    const file = await getFileById(fileId);

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete physical file
    try {
      const filepath = path.join(process.cwd(), "public", file.path_file);
      await unlink(filepath);
    } catch (error) {
      console.error("Error deleting physical file:", error);
      // Continue even if physical file deletion fails
    }

    // Delete from database
    await deleteFileUpload(fileId);

    return NextResponse.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting file:", error);

    // Handle unauthorized error
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus file" },
      { status: 500 }
    );
  }
}
