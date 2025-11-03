import {
  executeQuery,
  executeInsert,
  executeUpdate,
  getOne,
} from "@/lib/helpers/db-helpers";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface FileUpload extends RowDataPacket {
  file_id: number;
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: number;
  uploaded_by: number;
  deskripsi_file: string | null;
  created_at: string;
}

export interface FileUploadInput {
  laporan_id: number;
  nama_file_asli: string;
  nama_file_sistem: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: number;
  uploaded_by: number;
  deskripsi_file: string | null;
}

// Create file upload record
export async function createFileUpload(data: FileUploadInput): Promise<number> {
  const query = `
    INSERT INTO file_upload (
      laporan_id,
      nama_file_asli,
      nama_file_sistem,
      path_file,
      tipe_file,
      ukuran_file,
      uploaded_by,
      deskripsi_file
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await executeInsert(query, [
    data.laporan_id,
    data.nama_file_asli,
    data.nama_file_sistem,
    data.path_file,
    data.tipe_file,
    data.ukuran_file,
    data.uploaded_by,
    data.deskripsi_file,
  ]);

  return result;
}

// Get file by ID
export async function getFileById(fileId: number): Promise<FileUpload | null> {
  const query = `
    SELECT * FROM file_upload
    WHERE file_id = ?
  `;

  return await getOne<FileUpload>(query, [fileId]);
}

// Get files by laporan ID
export async function getFilesByLaporanId(
  laporanId: number
): Promise<FileUpload[]> {
  const query = `
    SELECT 
      fu.*,
      p.nama_lengkap as uploader_nama
    FROM file_upload fu
    INNER JOIN pegawai_cache p ON fu.uploaded_by = p.pegawai_id
    WHERE fu.laporan_id = ?
    ORDER BY fu.created_at ASC
  `;

  return await executeQuery<FileUpload>(query, [laporanId]);
}

// Delete file upload record
export async function deleteFileUpload(fileId: number): Promise<number> {
  const query = `
    DELETE FROM file_upload
    WHERE file_id = ?
  `;

  const result = await executeUpdate(query, [fileId]);
  return result;
}

// Update file description
export async function updateFileDescription(
  fileId: number,
  deskripsi: string
): Promise<number> {
  const query = `
    UPDATE file_upload
    SET deskripsi_file = ?
    WHERE file_id = ?
  `;

  const result = await executeUpdate(query, [deskripsi, fileId]);
  return result;
}
