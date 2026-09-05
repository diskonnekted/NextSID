# DESIGN.md — Surat SID (Refactor OpenSID)

## Identitas Produk

**Surat SID** adalah Sistem Informasi Desa (SID) hasil refactor dari OpenSID ke Next.js. Produk ini adalah portal publik untuk desa di Indonesia: warga bisa membaca berita, mengecek statistik, mengunduh dokumen, mengurus layanan mandiri, sementara admin desa mengelola konten melalui dasbor.

**Karakter:** Serius tapi manusiawi. Bukan portal birokrasi yang kaku, bukan portal startup yang norak. Editorial, informatif, dan punya wibawa desa.

## Personalitas

- Kalem, tidak berisik
- Mengedepankan konten (artikel, statistik, dokumen) bukan dekorasi
- Inklusif — tua, muda, terdidik, awam teknologi semuanya harus nyaman
- Indonesia banget — nuansa lokal hadir lewat tipografi dan copy, bukan lewat dekorasi etnis

## Audiens

1. **Warga desa** (60%) — datang untuk baca berita desa, cek informasi, unduh surat, lihat statistik
2. **Admin/operator desa** (30%) — kelola konten, tulis artikel, balas komentar
3. **Pemerintah/peneliti/umum** (10%) — cek transparansi (APBDes, IDM, SDGs)

## Palet

**Inti (2 warna + 1 aksen):**
- **Ink** `#1a1a1a` — teks utama, garis batas tipis
- **Paper** `#fafaf7` — kanvas, sedikit off-white supaya tidak flat
- **Clay** `#b5482a` — aksen untuk tautan, garis pemisah, dan penekanan ringan (warna tanah liat, bukan merah mencolok)

**Netral (di luar palet aktif):**
- `gray-100`, `gray-200`, `gray-400`, `gray-600` untuk layer

**Larangan:**
- Gradien biru-ungu, glassmorphism, glow, warna pastel, orb, neon

## Tipografi

- **Headline:** *Fraunces* (serif modern dengan sedikit warmth, gratis dari Google Fonts) — alasan: serif editorial mengkomunikasikan otoritas dan serius, sekaligus tidak kaku seperti Times
- **Body:** *Inter* (sans modern) — alasan: sangat terbaca di layar kecil, netral, dan dipakai banyak portal berita terpercaya
- **Meta/label kecil:** *Inter* dengan tracking sedikit lebih lebar

Ukuran: pakai skala modular 1.25 (major third). H1 jauh lebih besar dari H2 (8rem vs 4rem di desktop) untuk menciptakan hierarki editorial yang kuat.

## Layout

- **Grid utama:** 12 kolom di desktop, single column di mobile
- **Margin halaman:** lebar, banyak whitespace. Konten utama max-width 1280px
- **Asimetri:** headline di frontpage memanjang ke tepi, bukan di tengah
- **Sidebar:** 1/3 lebar di desktop, stacked di mobile

## Komposisi (RHYTHM 3 — varied)

Frontpage tidak boleh "title + grid card" diulang-ulang. Variasi:
1. **Hero**: slider/headline besar dengan tipografi overlapping
2. **Strip berita utama**: 3 artikel pilihan dalam layout asimetris
3. **Daftar artikel**: layout grid dengan tipografi editorial (bukan card seragam)
4. **Statistik desa**: angka-angka besar dengan caption kecil di bawahnya
5. **APBDes transparansi**: progress bar minimalis
6. **Footer**: link, alamat, media sosial

Setiap section punya komposisi berbeda. Tidak ada "kartu fitur" identik yang diulang.

## Motion (MOTION 1 — minimal)

- Hanya hover state dan transisi halaman
- Tidak ada animasi scroll yang mencolok
- Loading state pakai skeleton tipis, bukan spinner berputar

## Dials

```
ENERGY  2  (editorial, konten-utama)
RHYTHM  3  (variasi layout per section)
MOTION  1  (hover saja)
```

## Identitas motif

- Garis tipis horizontal (`border-t border-ink/20`) sebagai pemisah section, bukan box-shadow
- Nomor urut artikel kecil di atas headline, gaya koran
- Caption gambar pakai tipografi kecil miring, ala majalah

## Pantangan

- Emoji sebagai dekorasi
- Badge "AI Powered", "Beta", "New" tanpa konteks
- Card dengan radius besar dan shadow besar di setiap section
- Icon library default (Lucide-style thin stroke) untuk semua hal — pakai icon hanya kalau perlu
- Stock photo wajah orang tertawa

## Prinsip Copywriting

- Bahasa Indonesia formal tapi tidak kaku
- Tidak ada buzzword "AI Powered", "Revolutionary", "Seamless"
- CTA spesifik: "Baca Selengkapnya", "Lihat Statistik", "Unduh Dokumen"
- Hindari em dash (`—`)
