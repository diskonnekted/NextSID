// Definisi template Excel untuk import data.
// Setiap entri menentukan sheet mana, kolom apa, dan tipe data.
//
// Konvensi: template mengikuti struktur tabel OpenSID agar export dari
// phpMyAdmin/HeidiSQL bisa di-convert dengan mudah.
//
// Cara menambah sheet baru:
//   1. Tambah entri di `templateSheets`
//   2. Implementasikan handler di `handlers/`
//   3. Daftarkan di `handlers/index.ts`

export type TipeKolom =
  | "string"
  | "number"
  | "integer"
  | "date"
  | "datetime"
  | "boolean"
  | "enum"
  | "text-long";

export type KolomTemplate = {
  // Kunci yang akan dipakai oleh handler. Gunakan snake_case.
  key: string;
  // Header yang tampil di baris pertama spreadsheet.
  judul: string;
  // Tipe data; akan divalidasi saat import.
  tipe: TipeKolom;
  // Wajib diisi. Akan error bila kosong saat import.
  wajib?: boolean;
  // Untuk tipe "enum", daftar nilai yang diperbolehkan.
  nilaiEnum?: string[];
  // Keterangan yang membantu admin mengisi.
  keterangan?: string;
  // Contoh nilai (tampil sebagai comment di Excel, tidak disimpan).
  contoh?: string;
};

export type SheetTemplate = {
  key: string;
  judul: string;
  deskripsi: string;
  kolom: KolomTemplate[];
  // Urutan baris header di spreadsheet (biasanya 1).
  barisHeader?: number;
};

// =============================================================
// Sheet: CONFIG (identitas desa)
// =============================================================
const sheetConfig: SheetTemplate = {
  key: "config",
  judul: "Identitas Desa",
  deskripsi:
    "Isi identitas desa. Hanya baris pertama yang dipakai. Bisa diedit kapan saja dari dasbor.",
  barisHeader: 1,
  kolom: [
    { key: "nama_desa", judul: "Nama Desa", tipe: "string", wajib: true, contoh: "Desa Cintamulya" },
    { key: "kode_desa", judul: "Kode Desa", tipe: "string", contoh: "32.01.01.2008" },
    { key: "kode_pos", judul: "Kode Pos", tipe: "string", contoh: "40394" },
    { key: "alamat", judul: "Alamat", tipe: "string", contoh: "Jl. Raya No. 1" },
    { key: "email", judul: "Email", tipe: "string", contoh: "kantor@desa.id" },
    { key: "telepon", judul: "Telepon", tipe: "string", contoh: "(022) 721-1234" },
    { key: "website", judul: "Website", tipe: "string", contoh: "https://desa.id" },
    { key: "nama_kecamatan", judul: "Kecamatan", tipe: "string", contoh: "Cimenyan" },
    { key: "nama_kabupaten", judul: "Kabupaten", tipe: "string", contoh: "Bandung" },
    { key: "nama_propinsi", judul: "Provinsi", tipe: "string", contoh: "Jawa Barat" },
    { key: "lat", judul: "Latitude", tipe: "string", contoh: "-6.8734" },
    { key: "lng", judul: "Longitude", tipe: "string", contoh: "107.6543" },
  ],
};

// =============================================================
// Sheet: KATEGORI
// =============================================================
const sheetKategori: SheetTemplate = {
  key: "kategori",
  judul: "Kategori Artikel",
  deskripsi:
    "Daftar kategori. Kolom slug akan di-generate otomatis bila kosong. parent_slug dipakai bila kategori adalah anak dari kategori lain.",
  barisHeader: 1,
  kolom: [
    { key: "kategori", judul: "Nama Kategori", tipe: "string", wajib: true, contoh: "Berita" },
    { key: "slug", judul: "Slug", tipe: "string", keterangan: "Otomatis bila kosong", contoh: "berita" },
    { key: "parent_slug", judul: "Slug Induk", tipe: "string", contoh: "" },
    { key: "tipe", judul: "Tipe", tipe: "integer", contoh: "1" },
    { key: "urut", judul: "Urutan", tipe: "integer", contoh: "1" },
    { key: "enabled", judul: "Aktif", tipe: "boolean", contoh: "1" },
  ],
};

// =============================================================
// Sheet: ARTIKEL
// =============================================================
const sheetArtikel: SheetTemplate = {
  key: "artikel",
  judul: "Artikel",
  deskripsi:
    "Daftar artikel. Kolom kategori_slug mengacu ke Sheet 'kategori'. Kolom gambar berisi path/URL gambar utama. Isi boleh HTML.",
  barisHeader: 1,
  kolom: [
    { key: "judul", judul: "Judul", tipe: "string", wajib: true, contoh: "Musyawarah Desa APBDes 2026" },
    { key: "slug", judul: "Slug", tipe: "string", keterangan: "Otomatis bila kosong", contoh: "musyawarah-apbdes-2026" },
    { key: "kategori_slug", judul: "Slug Kategori", tipe: "string", contoh: "berita" },
    { key: "isi", judul: "Isi (HTML)", tipe: "text-long", contoh: "<p>...</p>" },
    { key: "ringkasan", judul: "Ringkasan", tipe: "string", keterangan: "Auto-trim dari isi bila kosong" },
    { key: "gambar", judul: "Gambar Utama (path/URL)", tipe: "string", contoh: "/uploads/artikel/foto.jpg" },
    { key: "tgl_upload", judul: "Tanggal Upload", tipe: "datetime", contoh: "2026-01-22 09:00:00" },
    { key: "enabled", judul: "Aktif", tipe: "boolean", contoh: "1" },
    { key: "headline", judul: "Headline", tipe: "boolean", contoh: "0" },
    { key: "slider", judul: "Slider", tipe: "boolean", contoh: "0" },
    { key: "tipe", judul: "Tipe", tipe: "enum", nilaiEnum: ["dinamis", "statis"], contoh: "dinamis" },
    { key: "boleh_komentar", judul: "Boleh Komentar", tipe: "boolean", contoh: "1" },
    { key: "author_username", judul: "Username Penulis", tipe: "string", contoh: "admin" },
  ],
};

// =============================================================
// Sheet: USER
// =============================================================
const sheetUser: SheetTemplate = {
  key: "user",
  judul: "Pengguna",
  deskripsi:
    "Daftar pengguna dasbor. Kolom password berisi hash bcrypt/argon2 dari OpenSID atau password baru (akan di-hash saat import).",
  barisHeader: 1,
  kolom: [
    { key: "username", judul: "Username", tipe: "string", wajib: true, contoh: "admin" },
    { key: "password", judul: "Password (plaintext atau hash)", tipe: "string", contoh: "password123" },
    { key: "nama", judul: "Nama Lengkap", tipe: "string", wajib: true, contoh: "Sekretariat Desa" },
    { key: "email", judul: "Email", tipe: "string", contoh: "admin@desa.id" },
    { key: "phone", judul: "Telepon", tipe: "string", contoh: "0812-1234-5678" },
    { key: "id_grup", judul: "Grup", tipe: "integer", contoh: "1" },
    { key: "active", judul: "Aktif", tipe: "boolean", contoh: "1" },
  ],
};

// =============================================================
// Sheet: MEDIA SOSIAL
// =============================================================
const sheetMediaSosial: SheetTemplate = {
  key: "media_sosial",
  judul: "Media Sosial",
  deskripsi: "Daftar tautan media sosial yang ditampilkan di footer dan header.",
  barisHeader: 1,
  kolom: [
    { key: "nama", judul: "Nama", tipe: "string", wajib: true, contoh: "Facebook" },
    { key: "url", judul: "URL", tipe: "string", wajib: true, contoh: "https://facebook.com/desa" },
    { key: "ikon", judul: "Ikon", tipe: "string", contoh: "facebook" },
    { key: "enabled", judul: "Aktif", tipe: "boolean", contoh: "1" },
  ],
};

// =============================================================
// Sheet: KELUARGA (Kartu Keluarga)
// Header sesuai sheet "Data Penduduk" di format-impor-excel.xlsm.
// Baris pertama data penduduk membawa no_kk+alamat+dusun+rw+rt —
// handler Keluarga akan upsert by no_kk.
// =============================================================
const sheetKeluarga: SheetTemplate = {
  key: "keluarga",
  judul: "Kartu Keluarga",
  deskripsi:
    "Daftar kartu keluarga. no_kk wajib dan unik. Satu KK punya banyak anggota (lihat sheet 'Penduduk').",
  barisHeader: 1,
  kolom: [
    { key: "no_kk", judul: "Nomor KK", tipe: "string", wajib: true, contoh: "3201234567890001" },
    { key: "alamat", judul: "Alamat", tipe: "string", contoh: "Jl. Raya No. 1" },
    { key: "dusun", judul: "Dusun", tipe: "string", contoh: "Sukamaju" },
    { key: "rw", judul: "RW", tipe: "string", contoh: "002" },
    { key: "rt", judul: "RT", tipe: "string", contoh: "003" },
  ],
};

// =============================================================
// Sheet: PENDUDUK (43 kolom sesuai format-impor-excel.xlsm)
// Field *_id merujuk ke sheet 'Kode Data' (Ref*).
// =============================================================
// Kontrak kolom: nama header di baris pertama HARUS sama persis dengan
// snake_case key (lowercase, underscore-separated). Ini sesuai dengan
// format-impor-excel.xlsm yang dipakai sebagai acuan database utama.
const sheetPenduduk: SheetTemplate = {
  key: "penduduk",
  judul: "Data Penduduk",
  deskripsi:
    "Daftar penduduk per KK. 43 kolom sesuai format OpenSID. Kolom *_id merujuk ke sheet 'Kode Data'.",
  barisHeader: 1,
  kolom: [
    // Identitas KK
    { key: "alamat", judul: "alamat", tipe: "string", contoh: "Jl. Raya No. 1" },
    { key: "dusun", judul: "dusun", tipe: "string", contoh: "Sukamaju" },
    { key: "rw", judul: "rw", tipe: "string", contoh: "002" },
    { key: "rt", judul: "rt", tipe: "string", contoh: "003" },
    { key: "no_kk", judul: "no_kk", tipe: "string", contoh: "3201234567890001" },
    // Identitas diri
    { key: "nama", judul: "nama", tipe: "string", wajib: true, contoh: "AHMAD SUBANDI" },
    { key: "nik", judul: "nik", tipe: "string", wajib: true, contoh: "3201234567890002" },
    { key: "sex", judul: "sex", tipe: "integer", contoh: "1" },
    { key: "tempatlahir", judul: "tempatlahir", tipe: "string", contoh: "Bandung" },
    { key: "tanggallahir", judul: "tanggallahir", tipe: "date", contoh: "1980-05-12" },
    // Demografi (ID ke Ref)
    { key: "agama_id", judul: "agama_id", tipe: "integer", contoh: "1" },
    { key: "pendidikan_kk_id", judul: "pendidikan_kk_id", tipe: "integer", contoh: "5" },
    { key: "pendidikan_sedang_id", judul: "pendidikan_sedang_id", tipe: "integer", contoh: "0" },
    { key: "pekerjaan_id", judul: "pekerjaan_id", tipe: "integer", contoh: "88" },
    { key: "status_kawin", judul: "status_kawin", tipe: "integer", contoh: "2" },
    { key: "kk_level", judul: "kk_level", tipe: "integer", contoh: "1" },
    { key: "warganegara_id", judul: "warganegara_id", tipe: "integer", contoh: "1" },
    { key: "golongan_darah_id", judul: "golongan_darah_id", tipe: "integer", contoh: "13" },
    { key: "cacat_id", judul: "cacat_id", tipe: "integer", contoh: "0" },
    { key: "cara_kb_id", judul: "cara_kb_id", tipe: "integer", contoh: "0" },
    { key: "hamil", judul: "hamil", tipe: "boolean", contoh: "0" },
    { key: "ktp_el", judul: "ktp_el", tipe: "boolean", contoh: "1" },
    { key: "status_rekam", judul: "status_rekam", tipe: "integer", contoh: "1" },
    { key: "status_dasar", judul: "status_dasar", tipe: "integer", contoh: "1" },
    { key: "id_asuransi", judul: "id_asuransi", tipe: "integer", contoh: "1" },
    // Keluarga
    { key: "ayah_nik", judul: "ayah_nik", tipe: "string", contoh: "" },
    { key: "nama_ayah", judul: "nama_ayah", tipe: "string", contoh: "" },
    { key: "ibu_nik", judul: "ibu_nik", tipe: "string", contoh: "" },
    { key: "nama_ibu", judul: "nama_ibu", tipe: "string", contoh: "" },
    // Dokumen
    { key: "akta_lahir", judul: "akta_lahir", tipe: "string", contoh: "" },
    { key: "dokumen_pasport", judul: "dokumen_pasport", tipe: "string", contoh: "" },
    { key: "tanggal_akhir_paspor", judul: "tanggal_akhir_paspor", tipe: "date", contoh: "" },
    { key: "dokumen_kitas", judul: "dokumen_kitas", tipe: "string", contoh: "" },
    { key: "akta_perkawinan", judul: "akta_perkawinan", tipe: "string", contoh: "" },
    { key: "tanggalperkawinan", judul: "tanggalperkawinan", tipe: "date", contoh: "" },
    { key: "akta_perceraian", judul: "akta_perceraian", tipe: "string", contoh: "" },
    { key: "tanggalperceraian", judul: "tanggalperceraian", tipe: "date", contoh: "" },
    // Lainnya
    { key: "alamat_sekarang", judul: "alamat_sekarang", tipe: "string", contoh: "" },
    { key: "suku", judul: "suku", tipe: "string", contoh: "" },
    { key: "tag_id_card", judul: "tag_id_card", tipe: "string", contoh: "" },
    { key: "no_asuransi", judul: "no_asuransi", tipe: "string", contoh: "" },
    { key: "lat", judul: "lat", tipe: "string", contoh: "" },
    { key: "lng", judul: "lng", tipe: "string", contoh: "" },
  ],
};

// =============================================================
// Sheet: KODE DATA — referensi master.
// Sheet ini berisi 11 pasang kolom [label, id]. Saat generate
// template admin cukup melihat label-nya; import handler akan
// upsert id->label ke tabel Ref*.
// =============================================================
const sheetKodeData: SheetTemplate = {
  key: "kode_data",
  judul: "Kode Data",
  deskripsi:
    "Master referensi. Setiap baris berisi ID (kolom 1) dan Nama (kolom 2) untuk satu kategori. ID dipakai oleh sheet 'Data Penduduk'.",
  barisHeader: 1,
  kolom: [
    { key: "kategori", judul: "Kategori", tipe: "string", contoh: "agama" },
    { key: "id", judul: "ID", tipe: "integer", contoh: "1" },
    { key: "nama", judul: "Nama", tipe: "string", contoh: "ISLAM" },
  ],
};

export const templateSheets: SheetTemplate[] = [
  sheetConfig,
  sheetKategori,
  sheetArtikel,
  sheetUser,
  sheetMediaSosial,
  sheetKeluarga,
  sheetPenduduk,
  sheetKodeData,
];

export function ambilTemplate(key: string): SheetTemplate | undefined {
  return templateSheets.find((s) => s.key === key);
}