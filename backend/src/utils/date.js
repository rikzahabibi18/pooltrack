import { env } from '../config/env.js';

/** Offset DB_TIMEZONE (mis. +07:00) dalam menit, mis. +07:00 → 420. */
function timezoneOffsetMinutes() {
  const [, sign, hours, minutes] = env.db.timezone.match(/^([+-])(\d{2}):(\d{2})$/);
  return (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes));
}

/**
 * Tanggal hari ini menurut DB_TIMEZONE (bukan zona waktu server) dalam format YYYY-MM-DD,
 * sama dengan format kolom DATE. Server cloud memakai UTC, jadi tanpa ini tanggal bisa
 * mundur satu hari antara pukul 00.00–07.00 WIB.
 */
export function todayDate() {
  const shifted = new Date(Date.now() + timezoneOffsetMinutes() * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

/** Apakah string YYYY-MM-DD adalah tanggal yang benar-benar ada (mis. 2026-02-30 = tidak). */
export function isValidDateString(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
