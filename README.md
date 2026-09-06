# Surat SID

Portal informasi & layanan surat desa berbasis Next.js 14, terinspirasi dari [OpenSID](https://github.com/opensid/opensid).

> Versi Alpha — fitur inti sudah berjalan, namun masih dalam pengembangan aktif.

## Teknologi

| Lapisan | Pilihan |
|---------|---------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Bahasa | [TypeScript](https://www.typescriptlang.org/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Database | [SQLite](https://www.sqlite.org/) (dev), siap migrasi ke PostgreSQL |
| Autentikasi | [NextAuth v4](https://next-auth.js.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + tema kustom |
| Validasi | [Zod](https://zod.dev/) |
| Spreadsheet | [xlsx](https://www.npmjs.com/package/xlsx) (import/export) |

## Fitur Utama

### Publik
- **Berita & Artikel** — posting, kategori, pencarian
- **Profil Desa** — identitas, pemerintahan, wilayah
- **Statistik** — data kependudukan interaktif
- **Direktori** — perangkat desa, lembaga, kerjasama
- **Galeri** — dokumentasi kegiatan desa

### Admin / Dashboard
- **Login** — autentikasi dengan NextAuth (JWT)
- **Kependudukan** — CRUD penduduk, KK, data per dusun/RW/RT
- **Kelompok** — agregasi warga per pekerjaan, pendidikan, agama, dll
- **Calon Pemilih** — daftar warga usia 17+ (WNI, status hidup)
- **Surat** — format surat, template OpenSID, cetak/PDF otomatis
- **Info Desa** — identitas, pemerintah, wilayah, layanan, lembaga, kerjasama, status
- **Konfigurasi** — logo, alamat, kontak, koordinat peta desa
- **Import Excel** — impor data penduduk & KK via template

### Cetak Surat
- Template OpenSID dengan substitusi placeholder otomatis (`[Nama]`, `[NIK]`, dll)
- Kop surat otomatis: logo desa, alamat kantor, kontak, email, website
- QR code, nomor surat, tanggal otomatis
- Print-to-PDF via browser `window.print()`

## Struktur Proyek

```
surat-sid/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/           # Dashboard admin (terproteksi)
│   │   │   ├── surat/       # Modul surat (format, cetak, arsip)
│   │   │   ├── kependudukan/# Data penduduk & KK
│   │   │   ├── info-desa/   # Informasi desa
│   │   │   ├── konfigurasi/ # Pengaturan desa
│   │   │   └── ...
│   │   ├── api/             # API routes (import, ekspor)
│   │   └── ...              # Halaman publik
│   ├── components/          # UI components
│   │   ├── admin/           # Komponen admin
│   │   └── frontend/        # Komponen publik
│   ├── lib/                 # Utility, auth, prisma, theme
│   ├── modules/             # Business logic per modul
│   │   ├── kependudukan/
│   │   ├── surat/
│   │   ├── info-desa/
│   │   └── importer/
│   └── themes/              # Tema UI (esensi, nusantara)
├── prisma/                  # Schema, migrations, seed
├── public/                  # File statis (gambar, favicon)
└── scripts/                 # Helper scripts (importer, seed)
```

## Instalasi

### Prasyarat
- Node.js 18+ (disarankan 20+)
- npm atau pnpm

### Langkah

```bash
# 1. Clone & install dependencies
git clone https://github.com/username/surat-sid.git
cd surat-sid
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env: isi NEXTAUTH_SECRET, DATABASE_URL, dll

# 3. Generate Prisma client & jalankan migrasi
npx prisma generate
npx prisma migrate dev

# 4. Seed database (opsional: data awal)
npx prisma db seed

# 5. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Development Scripts

| Script | Keterangan |
|--------|------------|
| `npm run dev` | Jalankan dev server (Next.js) |
| `npm run build` | Build production |
| `npm start` | Jalankan production build |
| `npm run lint` | ESLint check |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Jalankan migrasi baru |
| `npx prisma studio` | Buka database GUI |
| `npm run seed` | Seed database |
| `npm run import:excel` | Import data dari Excel |

## Konfigurasi

### Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="rahasia-kamu-di-sini"
NEXTAUTH_URL="http://localhost:3000"
```

| Variable | Keterangan |
|----------|------------|
| `DATABASE_URL` | Path ke database SQLite (dev) |
| `NEXTAUTH_SECRET` | Kunci enkripsi session JWT |
| `NEXTAUTH_URL` | Base URL aplikasi |

### Database

Secara default menggunakan **SQLite** (`prisma/dev.db`). Untuk production:

1. Ubah `DATABASE_URL` di `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@localhost:5432/suratsid"
   ```
2. Ubah provider di `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Jalankan ulang migrasi:
   ```bash
   npx prisma migrate dev
   ```

## Struktur Data

### Tabel Utama

| Model | Keterangan |
|-------|------------|
| `Config` | Pengaturan desa (nama, alamat, logo, kontak) |
| `Penduduk` | Data warga (NIK, nama, TTL, agama, pekerjaan) |
| `Keluarga` | Kartu Keluarga (no KK, alamat, dusun, RW, RT) |
| `Pamong` | Perangkat desa (nama, jabatan, NIP, gelar) |
| `SuratFormat` | Template surat (nama, kode, template HTML) |
| `PermohonanSurat` | Permintaan surat dari warga |
| `Artikel` | Berita & informasi desa |
| `Ref*` | Tabel referensi (agama, pekerjaan, pendidikan, dll) |

## Tema

Aplikasi mendukung multiple tema UI yang dapat dipilih di konfigurasi desa:

| Tema | Deskripsi |
|------|-----------|
| `esensi` | Tema default, clean & minimalis |
| `nusantara` | Tema bernuansa Indonesia |

Setiap tema memiliki:
- Layout: full-content, left-sidebar, right-sidebar
- Partial: header, footer, article, headline, slider
- Token: warna, tipografi, spacing

## Cetak Surat

### Cara Kerja

1. Warga mengajukan surat → masuk ke `PermohonanSurat`
2. Admin membuka halaman cetak → template di-substitusi dengan data
3. Placeholder seperti `[Nama]`, `[NIK]`, `[Alamat]` diganti nilai aktual
4. Kop surat otomatis (logo + alamat kantor + kontak)
5. Print via browser → simpan sebagai PDF

### Placeholder yang Didukung

```
Nama          → [Nama]
NIK           → [NIK]
No. KK        → [No. KK]
Alamat        → [Alamat]
TTL           → [Tempat/Tanggal Lahir]
Jenis Kelamin → [Jenis Kelamin]
Agama         → [Agama]
Pekerjaan     → [Pekerjaan]
Pendidikan    → [Pendidikan]
Status Kawin  → [Status Kawin]
```

Lihat `src/app/admin/surat/cetak/[id]/page.tsx` untuk daftar lengkap field.

## Arsitektur

```
┌─────────────────────────────────────────────────┐
│                  Next.js 14                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Public   │  │ Admin    │  │ API Routes   │  │
│  │ Pages    │  │ Pages    │  │ (import,     │  │
│  │          │  │ (auth)   │  │  ekspor)     │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │              │               │          │
│  ┌────▼──────────────▼───────────────▼───────┐  │
│  │           Modules (Business Logic)       │  │
│  │  kependudukan │ surat │ info-desa │ ...  │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
│  ┌────────────────▼─────────────────────────┐  │
│  │           Prisma ORM                     │  │
│  └────────────────┬─────────────────────────┘  │
│                   │                             │
│  ┌────────────────▼─────────────────────────┐  │
│  │      SQLite / PostgreSQL (DB)            │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Contributing

Pull request diterima untuk:
- Bug fixes
- Fitur baru
- Perbaikan performa
- Dokumentasi

## License

Private — Surat SID © 2026

## Status

Alpha — Fitur inti sudah berjalan. Pengembangan aktif berlangsung.

---

Dibuat dengan ❤️ untuk desa Indonesia.
