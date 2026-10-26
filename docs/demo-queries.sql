-- ============================================================
-- PoolTrack: query siap pakai untuk demo database ke tech lead
-- Jalankan per blok di HeidiSQL (pilih teks → Ctrl+F9) atau terminal.
-- Bisa dipakai di DB lokal (pooltrack) maupun Aiven (defaultdb).
-- ============================================================

-- 1. Status, urutan, dan warna badge datang dari database (bukan hardcode FE)
SELECT id, code, name, sequence, counts_toward_capacity, color
FROM unit_statuses
ORDER BY sequence;

-- 2. Jumlah unit per status (bandingkan dengan kartu ringkasan di Dashboard)
SELECT s.name AS status, COUNT(u.id) AS jumlah
FROM unit_statuses s
LEFT JOIN units u ON u.status_id = s.id
GROUP BY s.id, s.name
ORDER BY s.sequence;

-- 3. Okupansi tiap pool: hanya unit berstatus aktif yang dihitung
--    (bandingkan dengan progress bar di Dashboard)
SELECT p.name AS pool, p.capacity,
       COUNT(u.id) AS terisi,
       p.capacity - COUNT(u.id) AS sisa
FROM pools p
LEFT JOIN units u ON u.pool_id = p.id
  AND u.status_id IN (SELECT id FROM unit_statuses WHERE counts_toward_capacity = 1)
GROUP BY p.id, p.name, p.capacity
ORDER BY p.name;

-- 4. Daftar unit lengkap dengan relasinya (JOIN ke master)
SELECT u.id, u.plate_number, u.brand, u.model, s.name AS status,
       p.name AS pool, pt.name AS mitra, vt.name AS jenis
FROM units u
JOIN unit_statuses s  ON s.id = u.status_id
JOIN pools p          ON p.id = u.pool_id
JOIN partners pt      ON pt.id = u.partner_id
JOIN vehicle_types vt ON vt.id = u.vehicle_type_id
ORDER BY u.id
LIMIT 20;

-- 5. Riwayat status satu unit (bandingkan dengan timeline di halaman detail)
--    Ganti angka 1 dengan id unit yang sedang didemokan.
SELECT h.changed_at, f.name AS dari, t.name AS ke, h.note
FROM unit_status_histories h
LEFT JOIN unit_statuses f ON f.id = h.from_status_id
JOIN unit_statuses t      ON t.id = h.to_status_id
WHERE h.unit_id = 1
ORDER BY h.changed_at, h.id;

-- 6. 5 inspeksi terbaru (bandingkan dengan widget di Dashboard)
SELECT i.inspection_date, u.plate_number, g.code AS grade, i.inspector_name
FROM inspections i
JOIN units u ON u.id = i.unit_id
JOIN inspection_grades g ON g.id = i.grade_id
ORDER BY i.inspection_date DESC, i.id DESC
LIMIT 5;

-- 7. Akun yang terdaftar: password tersimpan sebagai hash bcrypt, bukan teks asli
SELECT id, name, email, LEFT(password_hash, 7) AS awal_hash FROM users;
