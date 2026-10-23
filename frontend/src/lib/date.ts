const pad = (value: number) => String(value).padStart(2, '0')

/** Tanggal hari ini (zona waktu browser) dalam format YYYY-MM-DD, sama dengan input type="date". */
export function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
