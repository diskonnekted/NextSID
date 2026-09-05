-- CreateTable
CREATE TABLE "config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama_desa" TEXT NOT NULL,
    "kode_desa" TEXT,
    "kode_pos" TEXT,
    "alamat" TEXT,
    "email" TEXT,
    "telepon" TEXT,
    "website" TEXT,
    "nama_kecamatan" TEXT,
    "nama_kabupaten" TEXT,
    "nama_propinsi" TEXT,
    "logo" TEXT,
    "lat" TEXT,
    "lng" TEXT,
    "zoom" INTEGER,
    "map_tipe" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "artikel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "slug" TEXT,
    "gambar" TEXT,
    "gambar1" TEXT,
    "gambar2" TEXT,
    "gambar3" TEXT,
    "dokumen" TEXT,
    "link_dokumen" TEXT,
    "tgl_upload" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tgl_publish" DATETIME,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "headline" INTEGER NOT NULL DEFAULT 0,
    "slider" INTEGER NOT NULL DEFAULT 0,
    "tipe" TEXT NOT NULL DEFAULT 'dinamis',
    "id_kategori" INTEGER,
    "id_user" INTEGER,
    "hit" INTEGER NOT NULL DEFAULT 0,
    "boleh_komentar" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "artikel_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "artikel_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "artikel_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "kategori" TEXT NOT NULL,
    "slug" TEXT,
    "tipe" INTEGER NOT NULL DEFAULT 1,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "parent_id" INTEGER,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kategori_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "kategori_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "kategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "komentar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "id_artikel" INTEGER NOT NULL,
    "owner" TEXT NOT NULL,
    "email" TEXT,
    "komentar" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "tgl_upload" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "komentar_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "komentar_id_artikel_fkey" FOREIGN KEY ("id_artikel") REFERENCES "artikel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "id_grup" INTEGER,
    "pamong_id" INTEGER,
    "email" TEXT,
    "active" INTEGER NOT NULL DEFAULT 1,
    "nama" TEXT NOT NULL,
    "phone" TEXT,
    "foto" TEXT,
    "last_login" DATETIME,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "user_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "widget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "widget_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "config" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "media_sosial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ikon" TEXT NOT NULL,
    "enabled" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "galery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "config_id" INTEGER,
    "nama" TEXT NOT NULL,
    "parent_id" INTEGER,
    "enabled" INTEGER NOT NULL DEFAULT 1,
    "slider" INTEGER NOT NULL DEFAULT 0,
    "urut" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "artikel_config_id_enabled_tgl_upload_idx" ON "artikel"("config_id", "enabled", "tgl_upload");

-- CreateIndex
CREATE INDEX "artikel_slug_idx" ON "artikel"("slug");

-- CreateIndex
CREATE INDEX "komentar_id_artikel_idx" ON "komentar"("id_artikel");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "setting_key_key" ON "setting"("key");
