const pad = (value) => String(value).padStart(2, '0');

/** Tanggal hari ini (zona waktu server) dalam format YYYY-MM-DD, sama dengan format kolom DATE. */
export function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Apakah string YYYY-MM-DD adalah tanggal yang benar-benar ada (mis. 2026-02-30 = tidak). */
export function isValidDateString(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
