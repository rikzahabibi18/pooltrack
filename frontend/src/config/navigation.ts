import {
  CarFrontIcon,
  ClipboardCheckIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  TagsIcon,
  type LucideIcon,
} from 'lucide-react'

/**
 * SATU sumber untuk menu sidebar, path route, judul halaman, dan breadcrumb.
 * Router (src/app/router.tsx) dan sidebar sama-sama membaca dari sini.
 */

export type NavItem = {
  title: string
  description: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS = {
  dashboard: {
    title: 'Dashboard',
    description: 'Ringkasan unit per status, okupansi pool, dan inspeksi terbaru.',
    path: '/',
    icon: LayoutDashboardIcon,
  },
  units: {
    title: 'Unit',
    description: 'Daftar unit kendaraan di seluruh pool beserta status dan riwayatnya.',
    path: '/units',
    icon: CarFrontIcon,
  },
  inspections: {
    title: 'Inspeksi',
    description: 'Hasil inspeksi kondisi unit.',
    path: '/inspections',
    icon: ClipboardCheckIcon,
  },
  partners: {
    title: 'Mitra',
    description: 'Perusahaan pembiayaan (leasing) pemilik unit.',
    path: '/master/partners',
    icon: HandshakeIcon,
  },
  pools: {
    title: 'Pool',
    description: 'Lokasi penyimpanan unit beserta kapasitasnya.',
    path: '/master/pools',
    icon: MapPinIcon,
  },
  vehicleTypes: {
    title: 'Jenis Kendaraan',
    description: 'Kategori kendaraan, mis. motor, mobil, truk.',
    path: '/master/vehicle-types',
    icon: TagsIcon,
  },
} as const satisfies Record<string, NavItem>

/** Halaman yang bisa dibuka tanpa login. */
export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
} as const

/** Halaman detail (tidak tampil di sidebar, menu "Unit" tetap aktif). */
export const UNIT_DETAIL_ROUTE = `${NAV_ITEMS.units.path}/:id`
export const unitDetailPath = (id: number) => `${NAV_ITEMS.units.path}/${id}`

export type NavGroup = { label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  { label: 'Ringkasan', items: [NAV_ITEMS.dashboard] },
  { label: 'Operasional', items: [NAV_ITEMS.units, NAV_ITEMS.inspections] },
  { label: 'Master Data', items: [NAV_ITEMS.partners, NAV_ITEMS.pools, NAV_ITEMS.vehicleTypes] },
]

/** Apakah `pathname` berada di bawah menu `path` (mis. /units/12 aktif untuk menu /units). */
export function isNavItemActive(path: string, pathname: string) {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
}

/** Mencari grup & menu yang sedang aktif, dipakai untuk breadcrumb di header. */
export function findActiveNav(pathname: string) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((navItem) => isNavItemActive(navItem.path, pathname))
    if (item) return { group, item }
  }
  return null
}
