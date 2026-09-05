-- CreateTable
CREATE TABLE "keluarga" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "no_kk" TEXT NOT NULL,
    "alamat" TEXT,
    "dusun" TEXT,
    "rw" TEXT,
    "rt" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "keluarga_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "penduduk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "no_kk" TEXT,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sex" INTEGER,
    "tempatlahir" TEXT,
    "tanggallahir" DATETIME,
    "agama_id" INTEGER,
    "pendidikan_kk_id" INTEGER,
    "pendidikan_sedang_id" INTEGER,
    "pekerjaan_id" INTEGER,
    "status_kawin" INTEGER,
    "kk_level" INTEGER,
    "warganegara_id" INTEGER,
    "golongan_darah_id" INTEGER,
    "cacat_id" INTEGER,
    "cara_kb_id" INTEGER,
    "hamil" INTEGER,
    "ktp_el" INTEGER,
    "status_rekam" INTEGER,
    "status_dasar" INTEGER,
    "id_asuransi" INTEGER,
    "ayah_nik" TEXT,
    "nama_ayah" TEXT,
    "ibu_nik" TEXT,
    "nama_ibu" TEXT,
    "akta_lahir" TEXT,
    "dokumen_pasport" TEXT,
    "tanggal_akhir_paspor" DATETIME,
    "dokumen_kitas" TEXT,
    "akta_perkawinan" TEXT,
    "tanggalperkawinan" DATETIME,
    "akta_perceraian" TEXT,
    "tanggalperceraian" DATETIME,
    "alamat_sekarang" TEXT,
    "suku" TEXT,
    "tag_id_card" TEXT,
    "no_asuransi" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "penduduk_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_no_kk_fkey" FOREIGN KEY ("no_kk") REFERENCES "keluarga" ("no_kk") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_ayah_nik_fkey" FOREIGN KEY ("ayah_nik") REFERENCES "penduduk" ("nik") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_ibu_nik_fkey" FOREIGN KEY ("ibu_nik") REFERENCES "penduduk" ("nik") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_agama_id_fkey" FOREIGN KEY ("agama_id") REFERENCES "ref_agama" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_pendidikan_kk_id_fkey" FOREIGN KEY ("pendidikan_kk_id") REFERENCES "ref_pendidikan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_pendidikan_sedang_id_fkey" FOREIGN KEY ("pendidikan_sedang_id") REFERENCES "ref_pendidikan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_pekerjaan_id_fkey" FOREIGN KEY ("pekerjaan_id") REFERENCES "ref_pekerjaan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_kk_level_fkey" FOREIGN KEY ("kk_level") REFERENCES "ref_hubungan_kk" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_warganegara_id_fkey" FOREIGN KEY ("warganegara_id") REFERENCES "ref_warganegara" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_golongan_darah_id_fkey" FOREIGN KEY ("golongan_darah_id") REFERENCES "ref_golongan_darah" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_cacat_id_fkey" FOREIGN KEY ("cacat_id") REFERENCES "ref_cacat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_cara_kb_id_fkey" FOREIGN KEY ("cara_kb_id") REFERENCES "ref_cara_kb" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_status_dasar_fkey" FOREIGN KEY ("status_dasar") REFERENCES "ref_status_dasar" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "penduduk_id_asuransi_fkey" FOREIGN KEY ("id_asuransi") REFERENCES "ref_asuransi" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ref_agama" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_pendidikan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_pekerjaan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_status_kawin" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_hubungan_kk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_warganegara" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_golongan_darah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_cacat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_cara_kb" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_status_dasar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ref_asuransi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "keluarga_no_kk_key" ON "keluarga"("no_kk");

-- CreateIndex
CREATE INDEX "keluarga_config_id_idx" ON "keluarga"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "penduduk_nik_key" ON "penduduk"("nik");

-- CreateIndex
CREATE INDEX "penduduk_config_id_no_kk_idx" ON "penduduk"("config_id", "no_kk");

-- CreateIndex
CREATE INDEX "penduduk_config_id_nama_idx" ON "penduduk"("config_id", "nama");

-- CreateIndex
CREATE INDEX "penduduk_sex_idx" ON "penduduk"("sex");
