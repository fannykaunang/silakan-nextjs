export type JenisJabatan = "ASN" | "Honorer";

export interface Jabatan {
  jabatan_id: number;
  nama_jabatan: string | null;
  jenis_jabatan: JenisJabatan | null;
}
