-- AlterTable
ALTER TABLE "config" ADD COLUMN "alamat_kantor" TEXT;
ALTER TABLE "config" ADD COLUMN "app_key" TEXT;
ALTER TABLE "config" ADD COLUMN "border" TEXT;
ALTER TABLE "config" ADD COLUMN "hp_kontak" TEXT;
ALTER TABLE "config" ADD COLUMN "jabatan_kontak" TEXT;
ALTER TABLE "config" ADD COLUMN "kantor_desa" TEXT;
ALTER TABLE "config" ADD COLUMN "kode_desa_bps" TEXT;
ALTER TABLE "config" ADD COLUMN "kode_kabupaten" TEXT;
ALTER TABLE "config" ADD COLUMN "kode_kecamatan" TEXT;
ALTER TABLE "config" ADD COLUMN "kode_propinsi" TEXT;
ALTER TABLE "config" ADD COLUMN "nama_kepala_camat" TEXT;
ALTER TABLE "config" ADD COLUMN "nama_kontak" TEXT;
ALTER TABLE "config" ADD COLUMN "nip_kepala_camat" TEXT;
ALTER TABLE "config" ADD COLUMN "nomor_operator" TEXT;
ALTER TABLE "config" ADD COLUMN "path" TEXT;
ALTER TABLE "config" ADD COLUMN "warna" TEXT;

-- CreateTable
CREATE TABLE "wilayah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "dusun" TEXT NOT NULL,
    "rw" TEXT NOT NULL DEFAULT '0',
    "rt" TEXT NOT NULL DEFAULT '0',
    "id_kepala" TEXT,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "urut_cetak" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "wilayah_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pamong" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "pamong_nama" TEXT NOT NULL,
    "pamong_nik" TEXT,
    "pamong_niap" TEXT,
    "pamong_ttd" INTEGER NOT NULL DEFAULT 0,
    "pamong_ub" INTEGER NOT NULL DEFAULT 0,
    "pamong_status" INTEGER NOT NULL DEFAULT 1,
    "status_pejabat" INTEGER NOT NULL DEFAULT 0,
    "id_pend" INTEGER,
    "jabatan_id" INTEGER,
    "gelar_depan" TEXT,
    "gelar_belakang" TEXT,
    "tempatlahir" TEXT,
    "tanggallahir" DATETIME,
    "sex" INTEGER,
    "agama_id" INTEGER,
    "pendidikan_id" INTEGER,
    "no_hp" TEXT,
    "foto" TEXT,
    "media_sosial" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "pamong_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pamong_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "ref_jabatan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ref_jabatan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "jenis" INTEGER NOT NULL DEFAULT 0,
    "tupoksi" TEXT,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "ref_jabatan_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profil_desa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'lainnya',
    "judul" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "profil_desa_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lembaga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT,
    "ketua" TEXT,
    "sekretaris" TEXT,
    "alamat" TEXT,
    "keterangan" TEXT,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "lembaga_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "layanan_pelanggan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "kategori" TEXT,
    "kontak" TEXT,
    "url_form" TEXT,
    "keterangan" TEXT,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "layanan_pelanggan_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kerjasama" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "judul" TEXT NOT NULL,
    "mitra" TEXT NOT NULL,
    "bidang" TEXT,
    "tanggal_mulai" DATETIME,
    "tanggal_selesai" DATETIME,
    "nomor" TEXT,
    "keterangan" TEXT,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kerjasama_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "wilayah_config_id_dusun_idx" ON "wilayah"("config_id", "dusun");

-- CreateIndex
CREATE INDEX "wilayah_config_id_rw_idx" ON "wilayah"("config_id", "rw");

-- CreateIndex
CREATE INDEX "wilayah_config_id_rt_idx" ON "wilayah"("config_id", "rt");

-- CreateIndex
CREATE INDEX "pamong_config_id_pamong_status_idx" ON "pamong"("config_id", "pamong_status");

-- CreateIndex
CREATE INDEX "ref_jabatan_config_id_idx" ON "ref_jabatan"("config_id");

-- CreateIndex
CREATE INDEX "profil_desa_config_id_kategori_idx" ON "profil_desa"("config_id", "kategori");

-- CreateIndex
CREATE UNIQUE INDEX "profil_desa_config_id_key_key" ON "profil_desa"("config_id", "key");

-- CreateIndex
CREATE INDEX "lembaga_config_id_idx" ON "lembaga"("config_id");

-- CreateIndex
CREATE INDEX "layanan_pelanggan_config_id_idx" ON "layanan_pelanggan"("config_id");

-- CreateIndex
CREATE INDEX "kerjasama_config_id_idx" ON "kerjasama"("config_id");
