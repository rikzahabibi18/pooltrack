import { AUTH_TOKEN_STORAGE_KEY } from '@/config/constants'

/**
 * Penyimpanan token login di localStorage.
 *
 * Trade-off (penting untuk dijelaskan): localStorage paling sederhana dan cocok untuk frontend & backend
 * yang beda domain (Vercel ↔ Render). Kekurangannya, token bisa dibaca JavaScript lain jika ada celah XSS.
 * Alternatif yang lebih aman adalah cookie httpOnly, tetapi pengaturannya lebih rumit.
 *
 * localStorage bisa tidak tersedia (mis. mode privat ketat). Karena itu token juga disimpan di memori:
 * pengguna tetap bisa memakai aplikasi, hanya perlu login ulang setelah halaman di-refresh.
 */
let memoryToken: string | null = null

export function getToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? memoryToken
  } catch {
    return memoryToken
  }
}

export function setToken(token: string) {
  memoryToken = token
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage tidak tersedia → cukup memakai token di memori
  }
}

export function clearToken() {
  memoryToken = null
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    // Abaikan
  }
}
