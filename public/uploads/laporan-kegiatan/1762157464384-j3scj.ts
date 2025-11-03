// app/api/atasan-pegawai/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { AtasanPegawaiModel } from '@/lib/models/atasan-pegawai.model';
import { requireAdmin } from '@/lib/helpers/auth-helper';
import { UpdateAtasanPegawaiInput } from '@/lib/types/atasan-pegawai.types';

/**
 * PUT /api/atasan-pegawai/[id]
 * Update atasan pegawai by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and require admin
    await requireAdmin();

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Check if exists
    const existing = await AtasanPegawaiModel.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Atasan pegawai tidak ditemukan' },
        { status: 404 }
      );
    }

    const body: UpdateAtasanPegawaiInput = await request.json();

    // Check if pegawai and atasan are the same
    if (body.pegawai_id && body.atasan_id && body.pegawai_id === body.atasan_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pegawai dan atasan tidak boleh sama',
        },
        { status: 400 }
      );
    }

    // Check for duplicate if pegawai_id or atasan_id changed
    if (body.pegawai_id || body.atasan_id) {
      const pegawaiId = body.pegawai_id ?? existing.pegawai_id;
      const atasanId = body.atasan_id ?? existing.atasan_id;

      const isDuplicate = await AtasanPegawaiModel.checkDuplicate(
        pegawaiId,
        atasanId,
        id
      );

      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            message: 'Hubungan atasan-pegawai yang aktif sudah ada',
          },
          { status: 400 }
        );
      }
    }

    const updated = await AtasanPegawaiModel.update(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Gagal mengubah atasan pegawai' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atasan pegawai berhasil diperbarui',
    });
  } catch (error: any) {
    console.error('Error in PUT /api/atasan-pegawai/[id]:', error);
    
    // Handle authentication/authorization errors
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }
    
    if (error?.message?.includes('Forbidden') || error?.message?.includes('privilege')) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Hanya admin yang dapat mengubah data.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal mengubah atasan pegawai',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/atasan-pegawai/[id]
 * Delete atasan pegawai by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication and require admin
    await requireAdmin();

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'ID tidak valid' },
        { status: 400 }
      );
    }

    // Check if exists
    const existing = await AtasanPegawaiModel.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Atasan pegawai tidak ditemukan' },
        { status: 404 }
      );
    }

    const deleted = await AtasanPegawaiModel.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Gagal menghapus atasan pegawai' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Atasan pegawai berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/atasan-pegawai/[id]:', error);
    
    // Handle authentication/authorization errors
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }
    
    if (error?.message?.includes('Forbidden') || error?.message?.includes('privilege')) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Hanya admin yang dapat menghapus data.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Gagal menghapus atasan pegawai',
      },
      { status: 500 }
    );
  }
}
