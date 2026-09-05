-- CreateTable
CREATE TABLE "ref_syarat_surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "ref_syarat_nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ref_syarat_surat_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tweb_surat_format" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "url_surat" TEXT,
    "kode_surat" TEXT,
    "lampiran" TEXT,
    "kunci" INTEGER NOT NULL DEFAULT 0,
    "favorit" INTEGER NOT NULL DEFAULT 0,
    "jenis" INTEGER NOT NULL DEFAULT 2,
    "mandiri" INTEGER NOT NULL DEFAULT 0,
    "masa_berlaku" INTEGER,
    "satuan_masa_berlaku" TEXT,
    "qr_code" INTEGER NOT NULL DEFAULT 0,
    "qr_code_tte" INTEGER NOT NULL DEFAULT 0,
    "logo_garuda" INTEGER NOT NULL DEFAULT 0,
    "kecamatan" INTEGER NOT NULL DEFAULT 1,
    "syarat_surat" TEXT,
    "template" TEXT,
    "template_desa" TEXT,
    "form_isian" TEXT,
    "kode_isian" TEXT,
    "orientasi" TEXT,
    "ukuran" TEXT,
    "margin" TEXT,
    "margin_global" INTEGER NOT NULL DEFAULT 1,
    "footer" INTEGER NOT NULL DEFAULT 1,
    "header" INTEGER NOT NULL DEFAULT 1,
    "format_nomor" TEXT,
    "format_nomor_global" INTEGER NOT NULL DEFAULT 1,
    "sumber_penduduk_berulang" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "tweb_surat_format_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lampiran_surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "slug" TEXT,
    "nama" TEXT NOT NULL,
    "jenis" INTEGER NOT NULL DEFAULT 2,
    "template" TEXT,
    "template_desa" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "lampiran_surat_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "id_format_surat" INTEGER,
    "id_pend" INTEGER,
    "id_pamong" INTEGER,
    "id_user" INTEGER,
    "nama_pamong" TEXT,
    "nama_jabatan" TEXT,
    "nama_surat" TEXT,
    "kode_surat" TEXT,
    "tanggal" DATETIME,
    "bulan" TEXT,
    "tahun" TEXT,
    "no_surat" TEXT,
    "lampiran" TEXT,
    "nik_non_warga" TEXT,
    "nama_non_warga" TEXT,
    "keterangan" TEXT,
    "lokasi_arsip" TEXT,
    "urls_id" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "log_verifikasi" TEXT,
    "tte" INTEGER NOT NULL DEFAULT 0,
    "verifikasi_operator" INTEGER NOT NULL DEFAULT 0,
    "verifikasi_kades" INTEGER NOT NULL DEFAULT 0,
    "verifikasi_sekdes" INTEGER NOT NULL DEFAULT 0,
    "isi_surat" TEXT,
    "kecamatan" TEXT,
    "deleted_at" DATETIME,
    "pemohon" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "log_surat_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "log_surat_id_format_surat_fkey" FOREIGN KEY ("id_format_surat") REFERENCES "tweb_surat_format" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "log_surat_id_pend_fkey" FOREIGN KEY ("id_pend") REFERENCES "penduduk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "log_surat_id_pamong_fkey" FOREIGN KEY ("id_pamong") REFERENCES "pamong" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_tolak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "id_surat" INTEGER NOT NULL,
    "nama" TEXT,
    "alasan" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    CONSTRAINT "log_tolak_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "log_tolak_id_surat_fkey" FOREIGN KEY ("id_surat") REFERENCES "log_surat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "log_perubahan_surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "log_surat_id" INTEGER,
    "field" TEXT,
    "nilai_lama" TEXT,
    "nilai_baru" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    CONSTRAINT "log_perubahan_surat_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permohonan_surat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "id_pemohon" INTEGER,
    "id_surat" INTEGER,
    "isian_form" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "alasan" TEXT,
    "keterangan" TEXT,
    "no_hp_aktif" TEXT,
    "syarat" TEXT,
    "no_antrian" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "permohonan_surat_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "permohonan_surat_id_pemohon_fkey" FOREIGN KEY ("id_pemohon") REFERENCES "penduduk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "permohonan_surat_id_surat_fkey" FOREIGN KEY ("id_surat") REFERENCES "tweb_surat_format" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dokumen" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "satuan" TEXT,
    "nama" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "tgl_upload" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "id_pend" INTEGER,
    "id_syarat" INTEGER,
    "kategori_info_publik" INTEGER NOT NULL DEFAULT 0,
    "deleted" INTEGER NOT NULL DEFAULT 0,
    "id_parent" INTEGER,
    "dok_warga" INTEGER NOT NULL DEFAULT 0,
    "lokasi_arsip" TEXT,
    "attr" TEXT,
    "tipe" TEXT,
    "url" TEXT,
    "tahun" TEXT,
    "kategori" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "dokumen_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dokumen_id_pend_fkey" FOREIGN KEY ("id_pend") REFERENCES "penduduk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dokumen_id_syarat_fkey" FOREIGN KEY ("id_syarat") REFERENCES "ref_syarat_surat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "dokumen_id_parent_fkey" FOREIGN KEY ("id_parent") REFERENCES "dokumen" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ref_syarat_surat_config_id_idx" ON "ref_syarat_surat"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "ref_syarat_surat_config_id_ref_syarat_nama_key" ON "ref_syarat_surat"("config_id", "ref_syarat_nama");

-- CreateIndex
CREATE INDEX "tweb_surat_format_config_id_jenis_idx" ON "tweb_surat_format"("config_id", "jenis");

-- CreateIndex
CREATE UNIQUE INDEX "tweb_surat_format_config_id_url_surat_key" ON "tweb_surat_format"("config_id", "url_surat");

-- CreateIndex
CREATE INDEX "lampiran_surat_config_id_idx" ON "lampiran_surat"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "lampiran_surat_config_id_slug_key" ON "lampiran_surat"("config_id", "slug");

-- CreateIndex
CREATE INDEX "log_surat_config_id_status_idx" ON "log_surat"("config_id", "status");

-- CreateIndex
CREATE INDEX "log_surat_config_id_id_format_surat_idx" ON "log_surat"("config_id", "id_format_surat");

-- CreateIndex
CREATE INDEX "log_surat_config_id_id_pend_idx" ON "log_surat"("config_id", "id_pend");

-- CreateIndex
CREATE INDEX "log_surat_config_id_tanggal_idx" ON "log_surat"("config_id", "tanggal");

-- CreateIndex
CREATE INDEX "log_surat_config_id_no_surat_idx" ON "log_surat"("config_id", "no_surat");

-- CreateIndex
CREATE INDEX "log_surat_deleted_at_idx" ON "log_surat"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "log_surat_urls_id_key" ON "log_surat"("urls_id");

-- CreateIndex
CREATE INDEX "log_tolak_config_id_id_surat_idx" ON "log_tolak"("config_id", "id_surat");

-- CreateIndex
CREATE INDEX "log_perubahan_surat_config_id_log_surat_id_idx" ON "log_perubahan_surat"("config_id", "log_surat_id");

-- CreateIndex
CREATE INDEX "permohonan_surat_config_id_status_idx" ON "permohonan_surat"("config_id", "status");

-- CreateIndex
CREATE INDEX "permohonan_surat_config_id_id_pemohon_idx" ON "permohonan_surat"("config_id", "id_pemohon");

-- CreateIndex
CREATE INDEX "permohonan_surat_config_id_id_surat_idx" ON "permohonan_surat"("config_id", "id_surat");

-- CreateIndex
CREATE INDEX "dokumen_config_id_deleted_idx" ON "dokumen"("config_id", "deleted");

-- CreateIndex
CREATE INDEX "dokumen_config_id_id_pend_idx" ON "dokumen"("config_id", "id_pend");

-- CreateIndex
CREATE INDEX "dokumen_config_id_id_syarat_idx" ON "dokumen"("config_id", "id_syarat");

-- CreateIndex
CREATE INDEX "dokumen_config_id_kategori_idx" ON "dokumen"("config_id", "kategori");

-- CreateIndex
CREATE INDEX "dokumen_id_parent_idx" ON "dokumen"("id_parent");
