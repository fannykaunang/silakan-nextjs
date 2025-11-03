// app/api/test/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/test
export async function GET() {
  try {
    // Test query sederhana
    const [rows] = await pool.query("SELECT 1 + 1 AS result");

    return NextResponse.json({
      success: true,
      message: "Database connection works!",
      data: rows,
    });
  } catch (error: any) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
