# NextSID — Catatan Pengembangan

> Aplikasi ini adalah refactor Next.js 14 (App Router) dari OpenSID (PHP/Laravel).
> Tema: TownPress-style, single desa fokus awal, bertahap ke multi-desa via `config_id`.
>
> **Tahap awal fokus 3 modul:**
> 1. Identitas Desa
> 2. Kependudukan
> 3. Surat Menyurat Desa

---

## 1. VISI & SCOPE

- **Nama aplikasi:** NextSID
- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Prisma (SQLite dev, MySQL prod) + NextAuth + shadcn/ui
- **Desain:** TownPress-style layout (frontend publik), modular tema
- **Admin:** 8 modul (fokus tahap awal hanya 3)
- **Master referensi:** [opensid-original/](file:///i:/surat_sid/opensid-original/) — baca Model PHP & migration sebagai source of truth

### Prinsip Relasi (OpenSID Asli)

1. **Multi-tenant via `config_id`** — hampir semua tabel operasional punya `config_id` dengan FK `config.id` (`ON UPDATE CASCADE, ON DELETE CASCADE`).
2. **Composite unique `(config_id, ...)`** — pastikan keunikan per desa (NIK, no_kk, url_surat, dll).
3. **Penduduk adalah hub** — menghubungkan identitas desa (perangkat, kepala wilayah) dan surat (pemohon, penanda tangan, dokumen).
4. **Soft delete via flag** — bukan Laravel `SoftDeletes` di kebanyakan tabel. Penduduk pakai `status_dasar` (1=hidup). Dokumen pakai kolom `deleted`. LogSurat adalah pengecualian (pakai `SoftDeletes`).
5. **Snapshot fields** — `log_surat.nama_pamong`, `nama_jabatan` disimpan agar histori tidak berubah saat master diedit.
6. **M:N via JSON** — `tweb_surat_format.syarat_surat` (longText JSON) untuk relasi ke `ref_syarat_surat` (bukan tabel pivot).

---

## 2. ANALISIS RELASI 3 MODUL (dari OpenSID Asli)

### 2.1 IDENTITAS DESA (Root Tenant)

**Tabel inti:** `config` (root, tanpa `config_id` sendiri)

**Field penting:** `nama_desa`, `kode_desa`, `kode_pos`, `kecamatan`, `kabupaten`, `propinsi`, `logo`, `lat`, `lng`, `zoom`, `map_tipe`, `path`, `alamat_kantor`, `email`, `telepon`, `website`, `warna`, `border`.

**Tabel pendukung:**
- `profil_desa` (key-value per desa: `jenis_tanah`, `topografi`, `flora_fauna`, `status_desa`, dll; kolom `kategori`: ekologi | internet | adat | lainnya).

**Relasi keluar:** `profil_desa.config_id` → `config.id` (CASCADE).
**Relasi masuk:** hampir SELURUH tabel operasional reference balik ke `config.id` via `config_id` (CASCADE).

---

### 2.2 KEPENDUDUKAN

**Tabel inti:**
- `tweb_penduduk` (data perorangan)
- `tweb_keluarga` (KK)
- `tweb_wil_clusterdesa` (Dusun → RW → RT, self-referencing)
- `tweb_desa_pamong` (perangkat desa)
- `tweb_penduduk_mandiri` (akun layanan mandiri warga)
- `ref_jabatan` (referensi jabatan perangkat)
- `log_penduduk`, `log_keluarga`, `log_perubahan_penduduk` (audit)
- `ref_pindah` (jenis peristiwa pindah)

**FK formal di DB:**

| Tabel | FK | Reference | Cascade |
|---|---|---|---|
| `tweb_penduduk` | `config_id` | `config.id` | CASCADE |
| `tweb_keluarga` | `config_id` | `config.id` | CASCADE |
| `tweb_wil_clusterdesa` | `config_id` | `config.id` | CASCADE |
| `tweb_desa_pamong` | `config_id` | `config.id` | CASCADE |
| `tweb_penduduk_mandiri` | `config_id` + `id_pend` | `config.id` + `tweb_penduduk.id` | CASCADE |
| `log_penduduk` | `config_id` + `id_pend` + `ref_pindah` | `config.id` + `tweb_penduduk.id` + `ref_pindah.id` | CASCADE |
| `log_keluarga` | `config_id` + `id_log_penduduk` | `config.id` + `log_penduduk.id` | CASCADE |

**FK logis (Eloquent, tanpa constraint DB):**

| Tabel | Kolom | Target | Method |
|---|---|---|---|
| `tweb_penduduk` | `id_kk` | `tweb_keluarga.id` | `keluarga()` belongsTo |
| `tweb_penduduk` | `id_cluster` | `tweb_wil_clusterdesa.id` | `wilayah()` belongsTo |
| `tweb_penduduk` | `id_rtm` | `tweb_rtm.id` | `rtm()` belongsTo |
| `tweb_keluarga` | `id_cluster` | `tweb_wil_clusterdesa.id` | `wilayah()` belongsTo |
| `tweb_wil_clusterdesa` | `id_kepala` | `tweb_penduduk.id` | `kepala()` hasOne |
| `tweb_desa_pamong` | `id_pend` | `tweb_penduduk.id` | `penduduk()` hasOne |
| `tweb_desa_pamong` | `jabatan_id` | `ref_jabatan.id` | `jabatan()` hasOne |
| `tweb_desa_pamong` | `atasan` | `tweb_desa_pamong.pamong_id` | self-ref |

**Catatan penting:**
- **Self-reference Wilayah** — 1 tabel untuk 3 level (dusun → rw → rt). Konvensi `rt='-'` = record dusun, `rt NOT IN ('0','-')` = RT.
- **Soft delete** — bukan `SoftDeletes` Laravel, tapi field `status_dasar` (1=hidup, lainnya=mati/pindah). View `penduduk_hidup` mem-filter `status_dasar = 1`.
- **NIK unik per desa** — composite unique `(config_id, nik)`.
- **Tidak ada M:N** di modul Kependudukan.

---

### 2.3 SURAT MENYURAT

**Tabel inti:**
- `tweb_surat_format` (template surat — RTF/HTML)
- `log_surat` (arsip surat yang sudah/akan dicetak)
- `permohonan_surat` (permohonan dari Layanan Mandiri)
- `dokumen` (lampiran/syarat, milik penduduk atau global)
- `lampiran_surat` (template lampiran)
- `ref_syarat_surat` (referensi jenis syarat)
- `ref_dokumen` (kategori dokumen, GLOBAL tanpa `config_id`)
- `log_tolak` (alasan penolakan permohonan)
- `log_perubahan_surat` (audit perubahan)

**FK formal di DB:**

| Tabel | FK | Reference | Cascade |
|---|---|---|---|
| `tweb_surat_format` | `config_id` | `config.id` | CASCADE |
| `log_surat` | `config_id` | `config.id` | CASCADE |
| `lampiran_surat` | `config_id` | `config.id` | CASCADE |
| `permohonan_surat` | `config_id` | `config.id` | CASCADE |
| `dokumen` | `config_id` | `config.id` | CASCADE |
| `ref_syarat_surat` | `config_id` | `config.id` | CASCADE |
| `log_tolak` | `config_id` | `config.id` | CASCADE |

**FK logis (Eloquent):**

| Tabel | Kolom | Target | Method |
|---|---|---|---|
| `log_surat` | `id_format_surat` | `tweb_surat_format.id` | `formatSurat()` belongsTo |
| `log_surat` | `id_pend` | `tweb_penduduk.id` | `penduduk()` belongsTo |
| `log_surat` | `id_pamong` | `tweb_desa_pamong.pamong_id` | `pamong()` belongsTo |
| `permohonan_surat` | `id_pemohon` | `tweb_penduduk.id` | `penduduk()` belongsTo |
| `permohonan_surat` | `id_surat` | `tweb_surat_format.id` | `surat()` belongsTo |
| `dokumen` | `id_pend` | `tweb_penduduk.id` | `penduduk()` belongsTo |
| `dokumen` | `id_syarat` | `ref_syarat_surat.ref_syarat_id` | `jenisDokumen()` belongsTo |
| `dokumen` | `id_parent` | `dokumen.id` (self) | `children()` hasMany |

**Relasi M:N (1 saja):**
- `tweb_surat_format` ↔ `ref_syarat_surat` — disimpan sebagai JSON array `syarat_surat` di `tweb_surat_format` (longText). Bukan tabel pivot.

**Snapshot fields krusial:** `log_surat.nama_pamong`, `nama_jabatan` — preservasi data historis saat master Pamong/Jabatan diedit.

**Alur kerja log_surat:**
- `status`: 0 = KONSEP, 1 = CETAK, -1 = TOLAK
- `tte` (boolean): Tanda Tangan Elektronik
- `verifikasi_operator`, `verifikasi_kades`, `verifikasi_sekdes` — alur verifikasi berjenjang

**Status permohonan_surat:**
- 0 = BELUM_LENGKAP
- 1 = SEDANG_DIPERIKSA
- 2 = MENUNGGU_TANDA_TANGAN
- 3 = SIAP_DIAMBIL
- 4 = SUDAH_DIAMBIL
- 5 = DIBATALKAN

**Soft delete:**
- `log_surat` pakai `SoftDeletes` Laravel + kolom `deleted_at` (dateTime nullable) — satu-satunya soft delete Laravel-style.
- `dokumen` pakai kolom `deleted` (boolean, 0/1) — filter via scope `hidup()`.

**Global scope `RemoveRtfScope`:** menyembunyikan template RTF legacy di `FormatSurat`. Di-bypass oleh relasi `LogSurat::formatSurat()` dan `PermohonanSurat::surat()`.

---

### 2.4 BRIDGE ANTAR 3 MODUL

Penduduk adalah **hub sentral**:

| Modul Sumber | → | Modul Target | Lewat |
|---|---|---|---|
| Kependudukan | → | Surat | `log_surat.id_pend` → `tweb_penduduk.id` (surat untuk penduduk) |
| Kependudukan | → | Surat | `permohonan_surat.id_pemohon` → `tweb_penduduk.id` (permohonan mandiri) |
| Kependudukan | → | Surat | `dokumen.id_pend` → `tweb_penduduk.id` (lampiran/syarat) |
| Identitas Desa | → | Kependudukan | `tweb_desa_pamong.id_pend` → `tweb_penduduk.id` (perangkat = penduduk) |
| Identitas Desa | → | Kependudukan | `tweb_wil_clusterdesa.id_kepala` → `tweb_penduduk.id` (kepala dusun = penduduk) |
| Identitas Desa | → | Surat | `log_surat.id_pamong` → `tweb_desa_pamong.pamong_id` (penanda tangan) |
| Identitas Desa | → | Surat | `log_surat.nama_pamong`, `nama_jabatan` (snapshot) |

---

## 3. STATUS SCHEMA NextSID

| Modul | Schema NextSID | OpenSID Asli | Gap |
|---|---|---|---|
| Identitas Desa | ✅ Lengkap | Lengkap | — |
| Kependudukan | ✅ Penduduk + Keluarga + 11 Ref | + PendudukMandiri + Log + Wilayah self-ref | Tambah `penduduk_mandiri`, `log_penduduk`, `log_keluarga`, `log_perubahan_penduduk`, `ref_pindah`. Self-ref Wilayah. |
| Surat Menyurat | ❌ BELUM ADA | 7 tabel utama | **PRIORITAS** (lihat §4) |

---

## 4. SCHEMA SURAT MENYURAT — DITAMBAHKAN 2026-09-05

### 4.1 Tabel yang ditambahkan

1. **`SuratFormat`** — Template surat (HTML/RTF), dengan JSON `syarat_surat` untuk M:N ke `SyaratSurat`
2. **`LampiranSurat`** — Template lampiran surat
3. **`RefSyaratSurat`** — Referensi syarat surat (dipakai M:N via JSON, dan 1:N ke Dokumen)
4. **`LogSurat`** — Arsip surat (konsep / cetak / tolak) dengan SoftDeletes
5. **`PermohonanSurat`** — Permohonan dari Layanan Mandiri
6. **`Dokumen`** — Lampiran/syarat (milik penduduk atau global), soft delete via kolom `deleted`
7. **`LogTolak`** — Alasan penolakan permohonan
8. **`LogPerubahanSurat`** — Audit perubahan log_surat

### 4.2 Relasi yang dibangun

```
config ──┬──► SuratFormat (config_id, syarat_surat JSON)
         ├──► LampiranSurat
         ├──► LogSurat ─┬─► SuratFormat (id_format_surat)
         │              ├─► Penduduk (id_pend)
         │              └─► Pamong (id_pamong)
         ├──► PermohonanSurat ─┬─► Penduduk (id_pemohon)
         │                     └─► SuratFormat (id_surat)
         ├──► Dokumen ─┬─► Penduduk (id_pend)
         │             ├─► SyaratSurat (id_syarat)
         │             └─► Dokumen (id_parent, SELF)
         ├──► SyaratSurat (referensi untuk syarat)
         └──► LogTolak
```

### 4.3 Pattern yang diikuti

- `config_id Int?` di semua tabel baru (kecuali `Config` itu sendiri)
- FK ke `config.id` dengan `onDelete: Cascade`
- Composite unique `(config_id, ...)` untuk keunikan per desa
- Snapshot fields `nama_pamong`, `nama_jabatan` di `LogSurat`
- JSON string untuk M:N `syarat_surat` di `SuratFormat`
- Enum status workflow (KONSEP/CETAK/TOLAK, BELUM_LENGKAP/SIAP_DIAMBIL, dll)

---

## 5. ROADMAP IMPLEMENTASI SURAT MENYURAT

1. **Schema Prisma** — selesai (commit 2026-09-05)
2. **Migration** — `npx prisma migrate dev`
3. **Module server actions** — `src/modules/surat/`:
   - `format.ts` — CRUD template surat
   - `log.ts` — CRUD log surat
   - `permohonan.ts` — CRUD permohonan
   - `dokumen.ts` — CRUD dokumen
4. **API routes** — `/api/admin/surat/...`
5. **Halaman admin**:
   - `/admin/surat/format` — daftar template
   - `/admin/surat/buat` — buat surat (form dinamis dari template)
   - `/admin/surat/log` — arsip surat
   - `/admin/surat/permohonan` — permohonan masuk
   - `/admin/surat/dokumen` — dokumen/syarat
6. **Cetak surat** — render template + signature Pamong
7. **Layanan Mandiri** — frontend untuk warga ajukan permohonan

---

## 6. CATATAN HISTORIS

### 2026-09-05 — Fix Data Dobel + Schema Surat

- **Fix data dobel Tabel Jabatan**: 15 NULL rows di `ref_jabatan`, 12 di `pamong`, 39 di `wilayah` dihapus via sqlite3
- **Validasi server-side**: tambah duplikat check + slot Kades/Sekdes unik di [src/modules/info-desa/index.ts](file:///i:/surat_sid/surat-sid/src/modules/info-desa/index.ts)
- **Idempotency seed.ts**: tambah `pamong`, `refJabatan`, `wilayah`, `lembaga`, `layanan_pelanggan`, `kerjasama`, `profil_desa` ke list `deleteMany()` tanpa filter
- **Schema Surat Menyurat**: 8 model baru di [prisma/schema.prisma](file:///i:/surat_sid/surat-sid/prisma/schema.prisma)