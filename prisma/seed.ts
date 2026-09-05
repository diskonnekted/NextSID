// Seed data demo untuk Surat SID.
// Tujuan: agar frontpage bisa dirender saat pertama kali dijalankan
// tanpa harus mengekspor data OpenSID terlebih dahulu.
//
// Cara menjalankan: `npm run seed`

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Seed ulang tabel Ref* (master) sesuai format Kode Data OpenSID.
// Dipakai oleh modul impor + form Penduduk.
// Tabel Ref* di OpenSID adalah master global TANPA config_id.
// Catatan: SQLite tidak mendukung `skipDuplicates`, jadi kita hapus
// seluruh isi tabel lalu insert ulang. Aman untuk dev seed.
async function seedRef(_configId: number) {
  await prisma.refAgama.deleteMany();
  await prisma.refPendidikan.deleteMany();
  await prisma.refPekerjaan.deleteMany();
  await prisma.refStatusKawin.deleteMany();
  await prisma.refHubunganKK.deleteMany();
  await prisma.refWarganegara.deleteMany();
  await prisma.refGolonganDarah.deleteMany();
  await prisma.refCacat.deleteMany();
  await prisma.refCaraKB.deleteMany();
  await prisma.refStatusDasar.deleteMany();
  await prisma.refAsuransi.deleteMany();

  await prisma.refAgama.createMany({
    data: [
      { id: 1, nama: "Islam" },
      { id: 2, nama: "Kristen" },
      { id: 3, nama: "Katholik" },
      { id: 4, nama: "Hindu" },
      { id: 5, nama: "Buddha" },
      { id: 6, nama: "Konghucu" },
      { id: 7, nama: "Lainnya" },
    ],
  });
  await prisma.refPendidikan.createMany({
    data: [
      { id: 1, nama: "Tidak/Belum Sekolah" },
      { id: 2, nama: "Belum Tamat SD/Sederajat" },
      { id: 3, nama: "Tamat SD/Sederajat" },
      { id: 4, nama: "SLTP/Sederajat" },
      { id: 5, nama: "SLTA/Sederajat" },
      { id: 6, nama: "Diploma I/II" },
      { id: 7, nama: "Akademi/Diploma III/Sarjana Muda" },
      { id: 8, nama: "Diploma IV/Strata I" },
      { id: 9, nama: "Strata II" },
      { id: 10, nama: "Strata III" },
    ],
  });
  await prisma.refPekerjaan.createMany({
    data: [
      { id: 1, nama: "Petani/Pekebun" },
      { id: 2, nama: "Buruh Tani/Perkebunan" },
      { id: 3, nama: "Pegawai Negeri Sipil" },
      { id: 4, nama: "Karyawan Swasta" },
      { id: 5, nama: "Wiraswasta" },
      { id: 6, nama: "Pedagang" },
      { id: 7, nama: "Peternak" },
      { id: 8, nama: "Nelayan" },
      { id: 9, nama: "Guru" },
      { id: 10, nama: "Ibu Rumah Tangga" },
      { id: 11, nama: "Pelajar/Mahasiswa" },
      { id: 12, nama: "Pensiunan" },
    ],
  });
  await prisma.refStatusKawin.createMany({
    data: [
      { id: 1, nama: "Belum Kawin" },
      { id: 2, nama: "Kawin" },
      { id: 3, nama: "Cerai Hidup" },
      { id: 4, nama: "Cerai Mati" },
    ],
  });
  await prisma.refHubunganKK.createMany({
    data: [
      { id: 1, nama: "Kepala Keluarga" },
      { id: 2, nama: "Istri" },
      { id: 3, nama: "Anak" },
      { id: 4, nama: "Menantu" },
      { id: 5, nama: "Cucu" },
      { id: 6, nama: "Orang Tua" },
      { id: 7, nama: "Mertua" },
      { id: 8, nama: "Famili Lain" },
      { id: 9, nama: "Pembantu" },
      { id: 10, nama: "Lainnya" },
    ],
  });
  await prisma.refWarganegara.createMany({
    data: [
      { id: 1, nama: "WNI" },
      { id: 2, nama: "WNA" },
      { id: 3, nama: "Kewarganegaraan Ganda" },
    ],
  });
  await prisma.refGolonganDarah.createMany({
    data: [
      { id: 1, nama: "A" },
      { id: 2, nama: "B" },
      { id: 3, nama: "AB" },
      { id: 4, nama: "O" },
      { id: 5, nama: "A+" },
      { id: 6, nama: "A-" },
      { id: 7, nama: "B+" },
      { id: 8, nama: "B-" },
      { id: 9, nama: "AB+" },
      { id: 10, nama: "AB-" },
      { id: 11, nama: "O+" },
      { id: 12, nama: "O-" },
      { id: 13, nama: "Tidak Tahu" },
    ],
  });
  await prisma.refCacat.createMany({
    data: [
      { id: 1, nama: "Tidak Cacat" },
      { id: 2, nama: "Tuna Netra" },
      { id: 3, nama: "Tuna Rungu" },
      { id: 4, nama: "Tuna Wicara" },
      { id: 5, nama: "Tuna Daksa" },
      { id: 6, nama: "Tuna Grahita" },
      { id: 7, nama: "Tuna Laras" },
      { id: 8, nama: "Cacat Lainnya" },
    ],
  });
  await prisma.refCaraKB.createMany({
    data: [
      { id: 1, nama: "IUD/AKDR" },
      { id: 2, nama: "MOP/Vasektomi" },
      { id: 3, nama: "MOW/Tubektomi" },
      { id: 4, nama: "Implant" },
      { id: 5, nama: "Suntik" },
      { id: 6, nama: "Pil" },
      { id: 7, nama: "Kondom" },
      { id: 8, nama: "Tidak KB" },
    ],
  });
  await prisma.refStatusDasar.createMany({
    data: [
      { id: 1, nama: "Hidup" },
      { id: 2, nama: "Mati" },
      { id: 3, nama: "Pindah" },
      { id: 4, nama: "Hilang" },
      { id: 9, nama: "Tidak Valid" },
    ],
  });
  await prisma.refAsuransi.createMany({
    data: [
      { id: 1, nama: "BPJS PBI" },
      { id: 2, nama: "BPJS Non PBI" },
      { id: 3, nama: "Jamkesmas" },
      { id: 4, nama: "Tidak Memiliki" },
    ],
  });
}

async function main() {
  // Bersihkan data lama (idempotent untuk development).
  // Penting: panggil deleteMany() TANPA filter untuk menghapus juga
  // rows yang punya config_id NULL (sampah run lama). Kalau filter
  // { config_id }, rows NULL akan lolos dan jadi duplikat di UI.
  await prisma.komentar.deleteMany();
  await prisma.artikel.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.mediaSosial.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.config.deleteMany();
  await prisma.penduduk.deleteMany();
  await prisma.keluarga.deleteMany();
  await prisma.pamong.deleteMany();
  await prisma.refJabatan.deleteMany();
  await prisma.wilayah.deleteMany();
  await prisma.lembaga.deleteMany();
  await prisma.layananPelanggan.deleteMany();
  await prisma.kerjasama.deleteMany();
  await prisma.profilDesa.deleteMany();

  // Config desa
  const config = await prisma.config.create({
    data: {
      nama_desa: "Desa Cintamulya",
      kode_desa: "32.01.01.2008",
      kode_pos: "40394",
      alamat: "Jl. Raya Cintamulya No. 1, Kecamatan Cimenyan, Kabupaten Bandung",
      email: "kantor@cintamulya.desa.id",
      telepon: "(022) 721-1234",
      website: "https://cintamulya.desa.id",
      nama_kecamatan: "Cimenyan",
      nama_kabupaten: "Bandung",
      nama_propinsi: "Jawa Barat",
      lat: "-6.8734",
      lng: "107.6543",
      zoom: 14,
    },
  });

  // User admin
  const admin = await prisma.user.create({
    data: {
      config_id: config.id,
      username: "admin",
      // Hash placeholder — akan diganti setelah auth dipasang.
      password: "PLACEHOLDER_REPLACE_WITH_BCRYPT",
      nama: "Sekretariat Desa",
      email: "admin@cintamulya.desa.id",
      active: 1,
    },
  });

  // Kategori
  const katBerita = await prisma.kategori.create({
    data: { config_id: config.id, kategori: "Berita", slug: "berita", urut: 1 },
  });
  const katPengumuman = await prisma.kategori.create({
    data: { config_id: config.id, kategori: "Pengumuman", slug: "pengumuman", urut: 2 },
  });
  const katPembangunan = await prisma.kategori.create({
    data: { config_id: config.id, kategori: "Pembangunan", slug: "pembangunan", urut: 3 },
  });
  const katLayanan = await prisma.kategori.create({
    data: { config_id: config.id, kategori: "Layanan Publik", slug: "layanan-publik", urut: 4 },
  });

  // Artikel headline
  const headline = await prisma.artikel.create({
    data: {
      config_id: config.id,
      id_kategori: katBerita.id,
      judul: "Musyawarah Desa Penetapan APBDes 2026 Resmi Digelar",
      slug: "musyawarah-desa-apbdes-2026",
      gambar: "/uploads/artikel/artikel-01.jpg",
      gambar1: "",
      gambar2: "",
      gambar3: "",
      isi: `<p>Seluruh pamong desa dan perwakilan masyarakat hadir dalam Musyawarah Desa yang digelar pada Selasa pagi di Aula Kantor Desa Cintamulya. Agenda utama adalah penetapan Anggaran Pendapatan dan Belanja Desa (APBDes) untuk tahun anggaran 2026.</p>
<p>Kepala Desa dalam sambutannya menyampaikan bahwa proses musyawarah ini menjadi bagian penting dari siklus tata kelola keuangan desa yang transparan. Setiap pos pendapatan dan belanja dibahas secara terbuka dengan mengacu pada dokumen RPJMDes dan RKPDes yang sudah disusun sejak awal tahun.</p>
<h2>Pos Prioritas</h2>
<p>Beberapa pos yang menjadi prioritas tahun ini antara lain perbaikan infrastruktur jalan kabupaten di Dusun Sukamaju, peningkatan kualitas posyandu, dan alokasi untuk kegiatan padat karya tunai yang menyasar kelompok rentan.</p>
<blockquote>"Kami memastikan bahwa setiap rupiah belanja desa dapat dipertanggungjawabkan dan memberi dampak langsung bagi warga." — Ketua BPD</blockquote>
<p>Hasil musyawarah akan dituangkan dalam berita acara dan diunggah ke portal desa paling lambat satu minggu setelah kegiatan.</p>`,
      tgl_upload: new Date("2026-01-22T09:00:00Z"),
      enabled: 1,
      headline: 1,
      slider: 1,
      tipe: "dinamis",
      id_user: admin.id,
      hit: 142,
    },
  });

  // Artikel slider lainnya
  await prisma.artikel.createMany({
    data: [
      {
        config_id: config.id,
        id_kategori: katPembangunan.id,
        judul: "Pembangunan Jalan Rabat Beton Dusun Sukamaju Dimulai Pekan Depan",
        slug: "pembangunan-jalan-sukamaju",
        gambar: "/uploads/artikel/artikel-02.jpg",
        isi: "<p>Setelah proses lelang selesai, pekerjaan rabat beton sepanjang 1,2 kilometer di Dusun Sukamaju akan dimulai pada Senin pekan depan. Dana pekerjaan berasal dari APBDes 2025 dengan nilai kontrak Rp 348 juta.</p><p>Pelaksana kegiatan adalah Koperasi desa Bina Mandiri yang berpengalaman dalam proyek infrastruktur serupa.</p>",
        tgl_upload: new Date("2026-01-18T08:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 1,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 86,
      },
      {
        config_id: config.id,
        id_kategori: katLayanan.id,
        judul: "Pelayanan Administrasi Tetap Buka Selama Libur Akhir Pekan",
        slug: "layanan-akap-libur-akhir-pekan",
        gambar: "/uploads/artikel/artikel-03.jpg",
        isi: "<p>Untuk mengantisipasi kebutuhan administrasi warga, kantor desa tetap membuka layanan surat-menyurat pada akhir pekan dengan jam terbatas. Layanan yang dapat dilayani antara lain surat keterangan domisili, surat pengantar, dan legalisasi dokumen.</p><p>Layanan berlangsung pukul 08.00–11.00 WIB setiap Sabtu.</p>",
        tgl_upload: new Date("2026-01-15T07:30:00Z"),
        enabled: 1,
        headline: 0,
        slider: 1,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 71,
      },
      {
        config_id: config.id,
        id_kategori: katPengumuman.id,
        judul: "Jadwal Posyandu Balita Bulan Februari 2026",
        slug: "jadwal-posyandu-februari-2026",
        gambar: "/uploads/artikel/artikel-04.jpg",
        isi: "<p>Posyandu Balita di empat dusun akan dilaksanakan sesuai jadwal rutin. Mohon para orang tua membawa buku KIA dan alat timbang portable.</p><p>Berikut jadwal lengkap Posyandu Balita Februari 2026 untuk masing-masing dusun.</p>",
        tgl_upload: new Date("2026-01-10T07:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 1,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 58,
      },
      {
        config_id: config.id,
        id_kategori: katBerita.id,
        judul: "Gotong Royong Pembersihan Sungai Cikijing Libatkan Tiga Dusun",
        slug: "gotong-royong-sungai-cikijing",
        gambar: "/uploads/artikel/artikel-05.jpg",
        isi: "<p>Kegiatan gotong royong pembersihan Sungai Cikijing diikuti oleh warga dari Dusun Sukamaju, Sukamandi, dan Sukaraja. Total lebih dari 200 warga turut serta bersama pamong dan kader lingkungan.</p><p>Hasil kegiatan adalah terkumpulnya sekitar 1,2 ton sampah yang dipilah menjadi organik, anorganik, dan residu B3 untuk ditangani lebih lanjut.</p>",
        tgl_upload: new Date("2026-01-05T06:30:00Z"),
        enabled: 1,
        headline: 0,
        slider: 0,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 49,
      },
    ],
  });

  // Artikel pilihan
  await prisma.artikel.createMany({
    data: [
      {
        config_id: config.id,
        id_kategori: katBerita.id,
        judul: "Pelatihan Digital Marketing untuk Pelaku UMKM Desa",
        slug: "pelatihan-digital-marketing-umkm",
        gambar: "/uploads/artikel/artikel-06.jpg",
        isi: "<p>Sebanyak 24 pelaku UMKM desa mengikuti pelatihan digital marketing selama dua hari. Materi mencakup pemasaran melalui media sosial, fotografi produk, dan pendaftaran marketplace.</p><p>Pelatihan difasilitasi oleh pendamping desa dan disponsori oleh program tanggung jawab sosial perusahaan daerah.</p>",
        tgl_upload: new Date("2025-12-28T07:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 0,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 38,
      },
      {
        config_id: config.id,
        id_kategori: katLayanan.id,
        judul: "Pembuatan KTP-el dan KK Kini Bisa di Kantor Desa",
        slug: "ktp-el-kk-di-kantor-desa",
        gambar: "/uploads/artikel/artikel-07.jpg",
        isi: "<p>Kerja sama dengan Dinas Kependudukan memungkinkan warga mengurus dokumen kependudukan langsung di kantor desa tanpa harus ke kecamatan. Layanan berlaku setiap hari kerja pukul 09.00–14.00.</p>",
        tgl_upload: new Date("2025-12-20T07:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 0,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 33,
      },
      {
        config_id: config.id,
        id_kategori: katPengumuman.id,
        judul: "Penerimaan Calon Kader Posyandu Tahun 2026",
        slug: "penerimaan-kader-posyandu-2026",
        gambar: "/uploads/artikel/artikel-08.jpg",
        isi: "<p>Pemerintah desa membuka pendaftaran calon kader posyandu untuk lima pos yang tersebar di empat dusun. Pendaftaran dibuka hingga akhir Februari.</p><p>Calon kader akan mendapatkan pelatihan dasar selama satu minggu sebelum ditempatkan.</p>",
        tgl_upload: new Date("2025-12-15T07:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 0,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 27,
      },
      {
        config_id: config.id,
        id_kategori: katPembangunan.id,
        judul: "Verifikasi Lokasi Untuk Pembangunan Irigasi Tersier",
        slug: "verifikasi-lokasi-irigasi-tersier",
        gambar: "/uploads/artikel/artikel-04.jpg",
        isi: "<p>Tim teknis Kabupaten bersama penyuluh pertanian melakukan verifikasi lokasi untuk pembangunan irigasi tersier di area persawahan Dusun Sukamandi. Hasil verifikasi menjadi dasar penyusunan Detail Engineering Design (DED) yang akan dimulai tahun ini.</p>",
        tgl_upload: new Date("2025-12-10T07:00:00Z"),
        enabled: 1,
        headline: 0,
        slider: 0,
        tipe: "dinamis",
        id_user: admin.id,
        hit: 21,
      },
    ],
  });

  // Media sosial
  await prisma.mediaSosial.createMany({
    data: [
      { config_id: config.id, nama: "Facebook", url: "https://facebook.com/", ikon: "facebook", enabled: 1 },
      { config_id: config.id, nama: "Instagram", url: "https://instagram.com/", ikon: "instagram", enabled: 1 },
      { config_id: config.id, nama: "YouTube", url: "https://youtube.com/", ikon: "youtube", enabled: 1 },
    ],
  });

  // Widget sidebar
  await prisma.widget.createMany({
    data: [
      {
        config_id: config.id,
        judul: "Pelayanan Surat",
        isi: "Senin–Jumat · 08.00–15.00 WIB · Kantor Desa",
        urut: 1,
        enabled: 1,
      },
      {
        config_id: config.id,
        judul: "Layanan Pengaduan",
        isi: "Lapor melalui WhatsApp 0812-1234-5678 atau kotak pengaduan di kantor desa.",
        urut: 2,
        enabled: 1,
      },
      {
        config_id: config.id,
        judul: "Posyandu Balita",
        isi: "Jadwal posyandu setiap bulan — lihat pengumuman terkait untuk detail.",
        urut: 3,
        enabled: 1,
      },
    ],
  });

  // Setting key-value
  await prisma.setting.createMany({
    data: [
      { key: "front_title", "value": "Portal Informasi Desa Cintamulya" },
      { key: "default_theme", "value": "esensi" },
      { key: "bahasa_aktif", "value": "id" },
    ],
  });

  // =====================================================================
  // INFO DESA — Wilayah Administratif (pohon Dusun → RW → RT)
  // =====================================================================
  await prisma.wilayah.deleteMany({ where: { config_id: config.id } });
  await prisma.wilayah.createMany({
    data: [
      // Dusun Sukamaju
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "0", rt: "0", urut: 1, urut_cetak: 1 },
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "01", rt: "0", urut: 2, urut_cetak: 2 },
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "01", rt: "001", urut: 3, urut_cetak: 3 },
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "01", rt: "002", urut: 4, urut_cetak: 4 },
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "02", rt: "0", urut: 5, urut_cetak: 5 },
      { config_id: config.id, dusun: "Dusun Sukamaju", rw: "02", rt: "001", urut: 6, urut_cetak: 6 },
      // Dusun Sukamandi
      { config_id: config.id, dusun: "Dusun Sukamandi", rw: "0", rt: "0", urut: 7, urut_cetak: 7 },
      { config_id: config.id, dusun: "Dusun Sukamandi", rw: "01", rt: "0", urut: 8, urut_cetak: 8 },
      { config_id: config.id, dusun: "Dusun Sukamandi", rw: "01", rt: "001", urut: 9, urut_cetak: 9 },
      { config_id: config.id, dusun: "Dusun Sukamandi", rw: "02", rt: "0", urut: 10, urut_cetak: 10 },
      // Dusun Sukaraja
      { config_id: config.id, dusun: "Dusun Sukaraja", rw: "0", rt: "0", urut: 11, urut_cetak: 11 },
      { config_id: config.id, dusun: "Dusun Sukaraja", rw: "01", rt: "0", urut: 12, urut_cetak: 12 },
      { config_id: config.id, dusun: "Dusun Sukaraja", rw: "01", rt: "001", urut: 13, urut_cetak: 13 },
    ],
  });

  // =====================================================================
  // INFO DESA — Jabatan + Pamong (perangkat desa)
  // =====================================================================
  await prisma.pamong.deleteMany({ where: { config_id: config.id } });
  await prisma.refJabatan.deleteMany({ where: { config_id: config.id } });

  const jabKades = await prisma.refJabatan.create({
    data: { config_id: config.id, nama: "Kepala Desa", jenis: 1, tupoksi: "Memimpin & mengelola pemerintahan desa.", urut: 1 },
  });
  const jabSekdes = await prisma.refJabatan.create({
    data: { config_id: config.id, nama: "Sekretaris Desa", jenis: 2, tupoksi: "Mengoordinasikan administrasi & keuangan.", urut: 2 },
  });
  const jabKaur = await prisma.refJabatan.create({
    data: { config_id: config.id, nama: "Kaur Tata Usaha & Umum", jenis: 0, tupoksi: "Mengelola surat-menyurat & kepegawaian.", urut: 3 },
  });
  const jabKasi = await prisma.refJabatan.create({
    data: { config_id: config.id, nama: "Kasi Pemerintahan", jenis: 0, tupoksi: "Membina administrasi pemerintahan.", urut: 4 },
  });
  await prisma.refJabatan.create({
    data: { config_id: config.id, nama: "Kepala Dusun", jenis: 0, tupoksi: "Mengoordinasikan kegiatan di tingkat dusun.", urut: 5 },
  });

  await prisma.pamong.createMany({
    data: [
      {
        config_id: config.id,
        pamong_nama: "Drs. H. Asep Wahyudi, M.Si.",
        pamong_nik: "3204011206650002",
        jabatan_id: jabKades.id,
        pamong_status: 1,
        status_pejabat: 1,
        gelar_depan: "Drs. H.",
        gelar_belakang: "M.Si.",
        sex: 1,
        tempatlahir: "Bandung",
        tanggallahir: new Date("1965-06-12"),
        urutan: 1,
      },
      {
        config_id: config.id,
        pamong_nama: "Hj. Siti Maryam, S.Sos.",
        pamong_nik: "3204014508700003",
        jabatan_id: jabSekdes.id,
        pamong_status: 1,
        status_pejabat: 0,
        gelar_depan: "Hj.",
        gelar_belakang: "S.Sos.",
        sex: 2,
        tempatlahir: "Sumedang",
        tanggallahir: new Date("1970-08-05"),
        urutan: 2,
      },
      {
        config_id: config.id,
        pamong_nama: "Encu Suhartono",
        pamong_nik: "3204012208780004",
        jabatan_id: jabKaur.id,
        pamong_status: 1,
        status_pejabat: 0,
        sex: 1,
        tempatlahir: "Cimenyan",
        tanggallahir: new Date("1978-08-22"),
        urutan: 3,
      },
      {
        config_id: config.id,
        pamong_nama: "Roni Maulana, S.AP.",
        pamong_nik: "3204011509850005",
        jabatan_id: jabKasi.id,
        pamong_status: 1,
        status_pejabat: 0,
        gelar_belakang: "S.AP.",
        sex: 1,
        tempatlahir: "Cimenyan",
        tanggallahir: new Date("1985-09-15"),
        urutan: 4,
      },
    ],
  });

  // =====================================================================
  // INFO DESA — Lembaga Desa
  // =====================================================================
  await prisma.lembaga.deleteMany({ where: { config_id: config.id } });
  await prisma.lembaga.createMany({
    data: [
      { config_id: config.id, nama: "Badan Permusyawaratan Desa", singkatan: "BPD", ketua: "H. Dadan Sunarya", sekretaris: "Maman Sutarman", urut: 1, enabled: 1 },
      { config_id: config.id, nama: "Lembaga Pemberdayaan Masyarakat", singkatan: "LPM", ketua: "Irwan Setiawan", sekretaris: "Nining S.", urut: 2, enabled: 1 },
      { config_id: config.id, nama: "PKK Desa Cintamulya", singkatan: "PKK", ketua: "Hj. Neng Nurhayati", sekretaris: "Ida Farida", urut: 3, enabled: 1 },
      { config_id: config.id, nama: "Karang Taruna", singkatan: "KT", ketua: "Andika Pratama", sekretaris: "Risa Aulia", urut: 4, enabled: 1 },
    ],
  });

  // =====================================================================
  // INFO DESA — Layanan Pelanggan
  // =====================================================================
  await prisma.layananPelanggan.deleteMany({ where: { config_id: config.id } });
  await prisma.layananPelanggan.createMany({
    data: [
      { config_id: config.id, nama: "Pengaduan via WhatsApp", kategori: "Pengaduan", kontak: "0812-1234-5678", enabled: 1 },
      { config_id: config.id, nama: "Layanan Aduan Masyarakat", kategori: "Pengaduan", url_form: "https://cintamulya.desa.id/aduan", enabled: 1 },
      { config_id: config.id, nama: "Konsultasi Pertanian", kategori: "Konsultasi", kontak: "kecamatan@pertanian.go.id", enabled: 1 },
    ],
  });

  // =====================================================================
  // INFO DESA — Profil Desa (status/ekologi/internet/adat)
  // =====================================================================
  await prisma.profilDesa.deleteMany({ where: { config_id: config.id } });
  await prisma.profilDesa.createMany({
    data: [
      { config_id: config.id, key: "status_desa", kategori: "adat", judul: "Status Desa", value: "Desa swasembada, berkembang, dan berbudaya." },
      { config_id: config.id, key: "jenis_tanah", kategori: "ekologi", judul: "Jenis Tanah", value: "Andosol dan latosol, subur untuk hortikultura." },
      { config_id: config.id, key: "topografi", kategori: "ekologi", judul: "Topografi", value: "Dataran tinggi ± 850 mdpl, berbukit ringan." },
      { config_id: config.id, key: "rawan_bencana", kategori: "ekologi", judul: "Daerah Rawan Bencana", value: "Longsor ringan di lereng bukit saat musim hujan." },
      { config_id: config.id, key: "jenis_jaringan", kategori: "internet", judul: "Jenis Jaringan Internet", value: "4G/LTE di tiga dusun; 5G bertahap." },
      { config_id: config.id, key: "provider_internet", kategori: "internet", judul: "Provider Internet", value: "Telkomsel, XL, Indosat, Smartfren." },
      { config_id: config.id, key: "lembaga_adat", kategori: "adat", judul: "Lembaga Adat", value: "Majelis Musyawarah Adat Nagari." },
      { config_id: config.id, key: "kearifan_lokal", kategori: "ekologi", judul: "Kearifan Lokal", value: "Lumbung desa, mapalus, dan ritual seren taun." },
    ],
  });

  // =====================================================================
  // KEPENDUDUKAN — Tabel Ref* (master) + Kartu Keluarga + Penduduk
  // =====================================================================
  await seedRef(config.id);

  await prisma.keluarga.deleteMany({ where: { config_id: config.id } });
  await prisma.penduduk.deleteMany({ where: { config_id: config.id } });

  // Data dummy 5 KK dengan total 18 jiwa (multi-anggota per KK).
  // Ikut konvensi OpenSID: alamat+dusun+rt+rw di level KK, sedangkan
  // detail biodata (NIK, nama, sex, ttl, dll) di level Penduduk.
  const dataKK: Array<{
    no_kk: string;
    alamat: string;
    dusun: string;
    rw: string;
    rt: string;
    kepala: {
      nik: string;
      nama: string;
      sex: 1 | 2;
      ttl: string;
      lahir: Date;
      kk_level: number;
      pekerjaan_id: number;
      pendidikan_kk_id: number;
      status_kawin: number;
    };
    anggota: Array<{
      nik: string;
      nama: string;
      sex: 1 | 2;
      ttl: string;
      lahir: Date;
      kk_level: number;
      pekerjaan_id?: number;
      pendidikan_kk_id?: number;
      status_kawin?: number;
    }>;
  }> = [
    {
      no_kk: "3204010101010001",
      alamat: "Kp. Sukamaju Rt 001 Rw 001",
      dusun: "Dusun Sukamaju",
      rw: "01",
      rt: "001",
      kepala: {
        nik: "3204011505650001",
        nama: "H. Abas Suryadi",
        sex: 1,
        ttl: "Bandung",
        lahir: new Date("1965-05-15"),
        kk_level: 1,
        pekerjaan_id: 5,
        pendidikan_kk_id: 5,
        status_kawin: 2,
      },
      anggota: [
        {
          nik: "3204014508700002",
          nama: "Hj. Aminah",
          sex: 2,
          ttl: "Sumedang",
          lahir: new Date("1970-08-05"),
          kk_level: 2,
          pekerjaan_id: 10,
          pendidikan_kk_id: 4,
          status_kawin: 2,
        },
        {
          nik: "3204015511950003",
          nama: "Ani Suryani",
          sex: 2,
          ttl: "Bandung",
          lahir: new Date("1995-11-15"),
          kk_level: 3,
          pekerjaan_id: 4,
          pendidikan_kk_id: 8,
          status_kawin: 1,
        },
        {
          nik: "3204012004980004",
          nama: "Dendi Suryadi",
          sex: 1,
          ttl: "Bandung",
          lahir: new Date("1998-04-20"),
          kk_level: 3,
          pekerjaan_id: 11,
          pendidikan_kk_id: 5,
          status_kawin: 1,
        },
      ],
    },
    {
      no_kk: "3204010101010002",
      alamat: "Kp. Sukamaju Rt 002 Rw 001",
      dusun: "Dusun Sukamaju",
      rw: "01",
      rt: "002",
      kepala: {
        nik: "3204011206720010",
        nama: "Enceng M. Yusuf",
        sex: 1,
        ttl: "Cimenyan",
        lahir: new Date("1972-06-12"),
        kk_level: 1,
        pekerjaan_id: 1,
        pendidikan_kk_id: 4,
        status_kawin: 2,
      },
      anggota: [
        {
          nik: "3204015009750011",
          nama: "Neng Rohayati",
          sex: 2,
          ttl: "Cimenyan",
          lahir: new Date("1975-09-10"),
          kk_level: 2,
          pekerjaan_id: 10,
          pendidikan_kk_id: 4,
          status_kawin: 2,
        },
        {
          nik: "3204011808010012",
          nama: "Rizky Maulana",
          sex: 1,
          ttl: "Bandung",
          lahir: new Date("2001-08-18"),
          kk_level: 3,
          pekerjaan_id: 11,
          pendidikan_kk_id: 5,
          status_kawin: 1,
        },
        {
          nik: "3204012504060013",
          nama: "Putri Larasati",
          sex: 2,
          ttl: "Bandung",
          lahir: new Date("2006-04-25"),
          kk_level: 3,
          pekerjaan_id: 11,
          pendidikan_kk_id: 3,
          status_kawin: 1,
        },
      ],
    },
    {
      no_kk: "3204010101010003",
      alamat: "Kp. Sukamandi Rt 001 Rw 001",
      dusun: "Dusun Sukamandi",
      rw: "01",
      rt: "001",
      kepala: {
        nik: "3204010509780020",
        nama: "Asep Saepudin",
        sex: 1,
        ttl: "Cililin",
        lahir: new Date("1978-09-05"),
        kk_level: 1,
        pekerjaan_id: 7,
        pendidikan_kk_id: 5,
        status_kawin: 2,
      },
      anggota: [
        {
          nik: "3204016010820021",
          nama: "Tati Sumiati",
          sex: 2,
          ttl: "Cililin",
          lahir: new Date("1982-10-20"),
          kk_level: 2,
          pekerjaan_id: 10,
          pendidikan_kk_id: 4,
          status_kawin: 2,
        },
        {
          nik: "3204012503070022",
          nama: "Galih Saputra",
          sex: 1,
          ttl: "Bandung",
          lahir: new Date("2007-03-25"),
          kk_level: 3,
          pekerjaan_id: 11,
          pendidikan_kk_id: 2,
          status_kawin: 1,
        },
        {
          nik: "3204011804120023",
          nama: "Salwa Aulia",
          sex: 2,
          ttl: "Bandung",
          lahir: new Date("2012-04-18"),
          kk_level: 3,
          status_kawin: 1,
        },
      ],
    },
    {
      no_kk: "3204010101010004",
      alamat: "Kp. Sukamandi Rt 002 Rw 002",
      dusun: "Dusun Sukamandi",
      rw: "02",
      rt: "001",
      kepala: {
        nik: "3204012205800030",
        nama: "Dadan Hamdani",
        sex: 1,
        ttl: "Cimenyan",
        lahir: new Date("1980-05-22"),
        kk_level: 1,
        pekerjaan_id: 5,
        pendidikan_kk_id: 5,
        status_kawin: 2,
      },
      anggota: [
        {
          nik: "3204016005850031",
          nama: "Ida Farida",
          sex: 2,
          ttl: "Cimenyan",
          lahir: new Date("1985-05-20"),
          kk_level: 2,
          pekerjaan_id: 6,
          pendidikan_kk_id: 5,
          status_kawin: 2,
        },
        {
          nik: "3204011509110032",
          nama: "Raka Pratama",
          sex: 1,
          ttl: "Bandung",
          lahir: new Date("2011-09-15"),
          kk_level: 3,
          status_kawin: 1,
        },
      ],
    },
    {
      no_kk: "3204010101010005",
      alamat: "Kp. Sukaraja Rt 001 Rw 001",
      dusun: "Dusun Sukaraja",
      rw: "01",
      rt: "001",
      kepala: {
        nik: "3204011806670040",
        nama: "Drs. H. Engkus Kuswara",
        sex: 1,
        ttl: "Sumedang",
        lahir: new Date("1967-06-18"),
        kk_level: 1,
        pekerjaan_id: 3,
        pendidikan_kk_id: 8,
        status_kawin: 2,
      },
      anggota: [
        {
          nik: "3204016010700041",
          nama: "Hj. Nining S.",
          sex: 2,
          ttl: "Sumedang",
          lahir: new Date("1970-10-20"),
          kk_level: 2,
          pekerjaan_id: 9,
          pendidikan_kk_id: 8,
          status_kawin: 2,
        },
        {
          nik: "3204012004950042",
          nama: "Andika Kuswara",
          sex: 1,
          ttl: "Bandung",
          lahir: new Date("1995-04-20"),
          kk_level: 3,
          pekerjaan_id: 4,
          pendidikan_kk_id: 8,
          status_kawin: 1,
        },
        {
          nik: "3204015508970043",
          nama: "Risa Aulia",
          sex: 2,
          ttl: "Bandung",
          lahir: new Date("1997-08-15"),
          kk_level: 3,
          pekerjaan_id: 4,
          pendidikan_kk_id: 8,
          status_kawin: 1,
        },
      ],
    },
  ];

  for (const kk of dataKK) {
    await prisma.keluarga.create({
      data: {
        config_id: config.id,
        no_kk: kk.no_kk,
        alamat: kk.alamat,
        dusun: kk.dusun,
        rw: kk.rw,
        rt: kk.rt,
      },
    });
    const kepala = kk.kepala;
    await prisma.penduduk.create({
      data: {
        config_id: config.id,
        no_kk: kk.no_kk,
        nik: kepala.nik,
        nama: kepala.nama,
        sex: kepala.sex,
        tempatlahir: kepala.ttl,
        tanggallahir: kepala.lahir,
        kk_level: kepala.kk_level,
        pekerjaan_id: kepala.pekerjaan_id,
        pendidikan_kk_id: kepala.pendidikan_kk_id,
        status_kawin: kepala.status_kawin,
        agama_id: 1,
        warganegara_id: 1,
        ktp_el: 1,
        status_dasar: 1,
      },
    });
    for (const a of kk.anggota) {
      await prisma.penduduk.create({
        data: {
          config_id: config.id,
          no_kk: kk.no_kk,
          nik: a.nik,
          nama: a.nama,
          sex: a.sex,
          tempatlahir: a.ttl,
          tanggallahir: a.lahir,
          kk_level: a.kk_level,
          pekerjaan_id: a.pekerjaan_id ?? null,
          pendidikan_kk_id: a.pendidikan_kk_id ?? null,
          status_kawin: a.status_kawin ?? null,
          agama_id: 1,
          warganegara_id: 1,
          ktp_el: 1,
          status_dasar: 1,
        },
      });
    }
  }

  console.log("Seed selesai:", {
    config: config.nama_desa,
    headline: headline.judul,
    keluarga: dataKK.length,
    penduduk: dataKK.reduce((n, k) => n + 1 + k.anggota.length, 0),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });