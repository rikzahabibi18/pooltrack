/**
 * Data master FIKTIF. Nama perusahaan, kontak, dan alamat tidak merujuk ke pihak nyata.
 * Email memakai domain `.example` yang memang dicadangkan untuk contoh.
 */
const PARTNERS = [
  { code: 'DMS', name: 'PT Dana Mitra Sejahtera', contact_person: 'Hendra Wijaya', phone: '021-5550-1101', email: 'remedial@danamitra.example' },
  { code: 'KAN', name: 'PT Kredit Andalan Nusantara', contact_person: 'Lestari Putri', phone: '021-5550-2202', email: 'aset@kreditandalan.example' },
  { code: 'AFP', name: 'PT Arunika Finansial Prima', contact_person: 'Yoga Saputra', phone: '022-5550-3303', email: 'collection@arunika.example' },
  { code: 'SKB', name: 'PT Sinar Kredit Bersama', contact_person: 'Maya Kusuma', phone: '031-5550-4404', email: 'unit@sinarkredit.example' },
  // Mitra nonaktif tanpa unit: untuk menunjukkan master nonaktif tidak muncul di dropdown
  { code: 'LDP', name: 'PT Lintas Dana Persada', contact_person: 'Arif Nugroho', phone: '021-5550-5505', email: 'info@lintasdana.example', is_active: false },
];

// Pool Tangerang sengaja berkapasitas kecil (terisi 11/12 oleh seed unit)
// supaya skenario "kapasitas penuh" bisa didemokan.
const POOLS = [
  { code: 'TGR', name: 'Pool Tangerang', city: 'Tangerang', address: 'Jl. Gatot Subroto Km 5 No. 18, Jatiuwung', capacity: 12 },
  { code: 'BKS', name: 'Pool Bekasi', city: 'Bekasi', address: 'Jl. Raya Narogong Km 9 No. 21, Bantargebang', capacity: 30 },
  { code: 'BDG', name: 'Pool Bandung', city: 'Bandung', address: 'Jl. Soekarno-Hatta No. 455, Bandung', capacity: 25 },
  { code: 'SBY', name: 'Pool Surabaya', city: 'Surabaya', address: 'Jl. Rungkut Industri III No. 12, Surabaya', capacity: 20 },
];

const VEHICLE_TYPES = [
  { code: 'MOTOR', name: 'Motor' },
  { code: 'MOBIL', name: 'Mobil' },
  { code: 'TRUK', name: 'Truk' },
];

export async function seed(knex) {
  await knex('partners').insert(PARTNERS);
  await knex('pools').insert(POOLS);
  await knex('vehicle_types').insert(VEHICLE_TYPES);
}
