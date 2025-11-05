// utils/formatTanggal.ts
const idShortFormatter = (timeZone?: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...(timeZone ? { timeZone } : {}),
  });

/** Hasil contoh: "12 Nov 2025, 10:12:45" */
export function formatTanggal(
  input: string | number | Date,
  opts?: { timeZone?: string }
) {
  const d = new Date(input);
  const parts = idShortFormatter(opts?.timeZone)
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
  // Susun ulang agar separator waktu pakai ":" dan ada koma sebelum jam
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second}`;
}
