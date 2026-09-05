<div align="center">

# NextSID

**Sistem Informasi Desa modern berbasis Next.js — refactor arsitektural OpenSID untuk desa Indonesia.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.18-000?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Portal publik + dasbor administrasi untuk desa: berita, statistik kependudukan,
direktori perangkat & lembaga, arsip dokumen, surat-menyurat, dan layanan mandiri.

[Demo](#demo) · [Fitur](#fitur) · [Stack](#teknologi) · [Mulai Cepat](#mulai-cepat) · [Dokumentasi](#dokumentasi) · [Kontribusi](#kontribusi)

</div>

---

## Daftar Isi

- [Tentang NextSID](#tentang-nextsid)
- [Mengapa NextSID](#mengapa-nextsid)
- [Fitur](#fitur)
- [Tangkapan Layar](#tangkapan-layar)
- [Teknologi](#teknologi)
- [Arsitektur](#arsitektur)
- [Struktur Proyek](#struktur-proyek)
- [Mulai Cepat](#mulai-cepat)
- [Konfigurasi](#konfigurasi)
- [Skrip npm](#skrip-npm)
- [Migrasi & Seed](#migrasi--seed)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)
- [Kredit](#kredit)

---

## Tentang NextSID

**NextSID** adalah Sistem Informasi Desa (SID) yang ditulis ulang dari OpenSID
(PHP/CodeIgniter) ke **Next.js 14 App Router** dengan TypeScript end-to-end.
Tujuannya bukan sekadar porting, melainkan membangun fondasi modern yang:

- **Type-safe** di seluruh lapisan — Prisma → server action → form client.
- **Multi-tenant** — pola `config_id` ala OpenSID, siap untuk banyak desa.
- **Editor-first** — fokus pada konten (artikel, statistik, dokumen), bukan dekorasi.
- **Ramah perangkat rendah** — bundle kecil, tanpa framework JS berat di sisi klien.
- **Terbuka** — skema Prisma, struktur direktori, dan helper modul didokumentasikan.

Target pengguna:

| Audiens | Kebutuhan |
|---|---|
| Warga desa (60%) | Baca berita, cek info, unduh surat, lihat statistik |
| Operator desa (30%) | Kelola konten, tulis artikel, balas permohonan surat |
| Pemerintah & peneliti (10%) | Transparansi (APBDes, IDM, SDGs) |

## Mengapa NextSID

OpenSID adalah tulang punggung digitalisasi desa Indonesia —功劳 besar untuk
komunitas. NextSID bukan pengganti, melainkan **lanjutan alami**:

- OpenSID monolitik PHP sulit di-*type-check*, di-*test*, dan di-*deploy* modern.
- Ekosistem React/Next.js lebih mudah dijangkau developer muda Indonesia.
- Server Component + Server Action menghapus boilerplate CRUD secara radikal.
- Prisma memberi **satu sumber kebenaran** untuk skema basis data.

## Fitur

### Portal Publik (`/`)

- **Beranda editorial** — slider headline + grid artikel + modul direktori.
- **Profil Desa** — visi-misi, sejarah, wilayah, perangkat, lembaga, status IDM.
- **Data Statistik** — komposisi penduduk, pekerjaan, pendidikan, agama, dsb.
- **Direktori** — perangkat desa, lembaga, kelompok, organisasi.
- **Galeri & Artikel** — berita, pengumuman, dokumentasi kegiatan.
- **Surat Mandiri** — warga dapat mengajukan permohonan surat secara daring.
- **Hero banner** yang dapat dikonfigurasi admin (logo, foto kantor, banner).

### Dasbor Admin (`/admin`)

- **Autentikasi** NextAuth (kredensial).
- **Identitas Desa** — nama, kode wilayah, alamat, kontak,luas, ketinggian.
- **Konfigurasi** — parameter aplikasi, upload logo, hero banner, foto kantor.
- **Kependudukan** — KK & penduduk, pencarian, edit, impor Excel, ekspor CSV.
- **Statistik otomatis** — rekapitulasi dari data penduduk (jenis kelamin,
  pekerjaan, pendidikan, agama, kelompok umur, dusun/RW/RT).
- **Calon Pemilih** — filter otomatis dari data penduduk (≥17 tahun).
- **Surat Menyurat** — format surat, arsip, dokumen, permohonan masuk.
- **Lembaga & Kelompok** — PKK, RT/RW, Karang Taruna, dll.
- **Info Desa terstruktur** — wilayah, status, pemerintah, lembaga, layanan,
  kerjasama.

### Teknis

- **Server Actions** untuk seluruh mutasi — tidak ada endpoint REST custom untuk CRUD.
- **Validasi FormData** dengan adapter terpusat (`str`, `num`, `numOrNull`,
  `strOrNull`, `parseTanggal`).
- **Upload aman** — whitelist tipe (`jpg/png/webp/svg/gif`), maks 2 MB,
  tulis ke `public/uploads/{desa,artikel}`.
- **Editor-first design system** — palet `ink/paper/clay`, tipografi Tailwind,
  tokens tema di `src/themes/esensi/`.
- **Import/ekspor Excel** untuk migrasi data dari OpenSID/Excel.

## Tangkapan Layar

> Slot untuk screenshot — letakkan di `docs/screenshots/` lalu referensikan di sini.

| Beranda | Dasbor Admin |
|---|---|
| _(coming soon)_ | _(coming soon)_ |

## Teknologi

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14.2.18 (App Router) |
| Bahasa | TypeScript 5.7 |
| UI | Tailwind CSS 3.4 + komponen editor-first |
| ORM | Prisma 5.22 |
| DB Dev | SQLite (`prisma/dev.db`) |
| DB Prod | PostgreSQL (siap, ganti provider di `schema.prisma`) |
| Auth | NextAuth 4.24 |
| Validasi | Zod 3.23 |
| Tanggal | date-fns 4.1 |
| Spreadsheet | xlsx 0.18 (impor) |
| Util | clsx 2.1 |

## Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│                  Browser (Warga / Admin)                 │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│              Next.js App Router (Edge/Node)             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ RSC (publik) │  │ RSC (admin)  │  │ Server Actions│  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│         Modules (info-desa, kependudukan, surat, ...)   │
│   index.ts (API modul)  •  handler.ts (server action)    │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                    Prisma Client (typed)                 │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│              SQLite (dev) / PostgreSQL (prod)            │
└──────────────────────────────────────────────────────────┘
```

**Pola multi-tenant `config_id`** — setiap entitas milik desa disimpan dengan
`config_id` foreign key. MVP single-desa menggunakan helper `findFirst({orderBy:{id:'asc'}})`.

## Struktur Proyek

```
surat-sid/
├── prisma/
│   ├── schema.prisma             # Skema DB (Config, Penduduk, KK, Surat, ...)
│   ├── migrations/               # Riwayat migrasi
│   └── seed.ts                   # Data awal (desa dummy + user admin)
├── public/
│   ├── logo.png                  # Logo bawaan
│   └── uploads/                  # Hasil upload (di-gitignore, isi .gitkeep)
├── scripts/
│   ├── importer.ts               # CLI impor Excel → DB
│   ├── check-seed.js             # Audit hasil seed
│   └── test-import-api.js        # Uji API impor
├── src/
│   ├── app/                      # App Router (route segments)
│   │   ├── admin/                # Dasbor admin (dilindungi middleware)
│   │   ├── api/                  # Endpoint autentikasi & impor
│   │   ├── artikel/              # Portal publik — artikel
│   │   ├── data-statistik/       # Portal publik — statistik
│   │   ├── direktori/            # Portal publik — direktori
│   │   ├── galeri/               # Portal publik — galeri
│   │   ├── pemerintahan/         # Portal publik — profil
│   │   ├── profil-desa/          # Portal publik — profil
│   │   ├── surat-mandiri/        # Portal publik — layanan mandiri
│   │   ├── layout.tsx            # Root layout + SiteHeader/SiteFooter
│   │   ├── page.tsx              # Beranda
│   │   └── globals.css           # Tailwind + tokens tema
│   ├── components/
│   │   └── frontend/             # SiteHeader, SiteFooter, HeroSlider, ...
│   ├── lib/                      # auth, prisma, queries, settings, theme,
│   │                            # upload (helper unggah file)
│   ├── modules/                  # Domain logic per fitur
│   │   ├── info-desa/            #   index.ts (API) + handler.ts (action)
│   │   ├── kependudukan/
│   │   ├── konfigurasi/
│   │   ├── surat/
│   │   ├── importer/             # Pipeline Excel → DB
│   │   └── direktori.ts
│   ├── themes/
│   │   └── esensi/               # Tema bawaan (layouts, partials, tokens)
│   ├── middleware.ts             # Proteksi /admin/*
│   └── types.ts                  # Tipe bersama
├── DESIGN.md                      # Catatan design system
├── pengembangan.md               # Catatan pengembangan
├── .env.example                  # Contoh variabel lingkungan
├── tailwind.config.ts
└── package.json
```

## Mulai Cepat

### Prasyarat

- **Node.js 20.x** (LTS direkomendasikan).
- **npm 10+** (atau pnpm/yarn — skrip di bawah memakai `npm`).
- **Git**.

### Instalasi

```bash
# 1. Kloning
git clone https://github.com/diskonnekted/NextSID.git
cd NextSID

# 2. Pasang dependensi
npm install

# 3. Salin & sesuaikan env
cp .env.example .env
# Edit .env — lihat bagian [Konfigurasi] di bawah

# 4. Siapkan basis data (SQLite untuk dev)
npx prisma migrate dev
npx prisma db seed

# 5. Jalankan
npm run dev
# → http://localhost:3000
```

### Login Admin Bawaan

Setelah `seed`, kredensial default:

| Field | Nilai |
|---|---|
| Email | `admin@desa.id` |
| Password | `admin123` |

> Segera ubah setelah login pertama.

## Konfigurasi

Semua variabel lingkungan didefinisikan di `.env.example`. Salin ke `.env` lalu isi:

```env
# Basis data
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Default admin (digunakan oleh seed)
DEFAULT_ADMIN_EMAIL="admin@desa.id"
DEFAULT_ADMIN_PASSWORD="admin123"
DEFAULT_ADMIN_NAME="Administrator Desa"
```

Buat secret baru dengan:

```bash
openssl rand -base64 32
```

## Skrip npm

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan server pengembangan di `http://localhost:3000` |
| `npm run build` | Bangun produksi (cek tipe + bundle) |
| `npm start` | Jalankan hasil `build` |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Buat & terapkan migrasi |
| `npm run prisma:studio` | GUI Prisma di `http://localhost:5555` |
| `npm run seed` | Isi data awal (admin + desa dummy) |
| `npm run import:excel` | Impor data penduduk dari Excel |
| `npm run import:template` | Cetak template Excel kosong |

## Migrasi & Seed

- Skema: [`prisma/schema.prisma`](./prisma/schema.prisma)
- Seed: [`prisma/seed.ts`](./prisma/seed.ts)
- Migrasi: `prisma/migrations/<timestamp>_<name>/migration.sql`

Untuk mengganti DB ke PostgreSQL (disarankan untuk produksi):

1. Ubah `provider` di `schema.prisma` menjadi `"postgresql"`.
2. Ubah `DATABASE_URL` ke connection string Postgres.
3. Hapus folder `prisma/migrations/` lalu jalankan `npx prisma migrate dev --name init`.
4. Jalankan `npm run seed`.

## Deployment

NextSID adalah aplikasi Next.js standar — dapat di-deploy ke mana saja yang
menjalankan Node.js. Rekomendasi:

- **Vercel** — zero config, cocok untuk MVP.
- **Docker + VPS** — kontrol penuh; contoh `Dockerfile` menyusul.
- **Self-hosted Node** — `npm run build && npm start`.

Sebelum deploy:

1. Ubah `NEXTAUTH_SECRET` ke nilai acak baru.
2. Ubah `NEXTAUTH_URL` ke domain produksi.
3. Ganti SQLite → PostgreSQL.
4. Ubah password admin bawaan.
5. Pastikan folder `public/uploads/` writable oleh runtime.

## Roadmap

- [ ] API publik REST/GraphQL untuk integrasi OpenSID.
- [ ] Modul APBDes & IDM (transparansi anggaran & indeks desa).
- [ ] Notifikasi WhatsApp untuk permohonan surat.
- [ ] Peta digital wilayah (Leaflet/MapLibre).
- [ ] Tema tambahan (selain `esensi`).
- [ ] Multi-bahasa (Indonesia + daerah).
- [ ] Generator PDF surat dengan kop desa otomatis.

## Kontribusi

Kontribusi sangat terbuka — baca dulu pedoman singkat di bawah.

1. **Fork** repo ini.
2. Buat branch fitur: `git checkout -b feat/nama-fitur`.
3. Commit dengan pesan jelas: `git commit -m "feat: tambah modul APBDes"`.
4. Push: `git push origin feat/nama-fitur`.
5. Buka **Pull Request** ke `main`.

Pedoman kode:

- TypeScript strict — jangan pakai `any` kecuali terpaksa.
- Server Actions untuk mutasi; **tidak** menambah endpoint REST kecuali untuk
  kebutuhan eksternal (mis. webhook).
- Reuse helper FormData di `src/lib/handler-adapter.ts` (atau yang setara).
- Hormati tokens tema di `src/themes/esensi/tokens.ts`.

## Lisensi

[MIT](LICENSE) © Kontributor NextSID.

## Kredit

- [OpenSID](https://github.com/OpenSID/OpenSID) — inspirator & sumber fitur desa.
- [Next.js](https://nextjs.org) · [Prisma](https://www.prisma.io) ·
  [Tailwind CSS](https://tailwindcss.com) · [NextAuth](https://next-auth.js.org).
- Komunitas desa digital Indonesia yang terus mengarahkan fitur.

---

<div align="center">

**[⬆ kembali ke atas](#nextsid)**

Dibuat dengan ❤ untuk desa Indonesia.

</div>