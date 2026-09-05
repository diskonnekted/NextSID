// Module info-desa.
// Backend queries & mutations untuk Identitas Desa, Wilayah Administratif,
// Pemerintah Desa (Pamong + RefJabatan), Lembaga Desa, Layanan Pelanggan,
// Pendaftaran Kerjasama, dan Profil Desa (status desa / ekologi / internet).

import { prisma } from "@/lib/prisma";

// =====================================================================
// Util bersama
// =====================================================================

export async function ambilConfigId(): Promise<number> {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  return cfg?.id ?? 1;
}

// =====================================================================
// IDENTITAS DESA
// =====================================================================

export async function ambilIdentitas() {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  return cfg;
}

export type SimpanIdentitasArgs = Partial<{
  nama_desa: string;
  kode_desa: string;
  kode_desa_bps: string;
  kode_pos: string;
  alamat: string;
  alamat_kantor: string;
  email: string;
  telepon: string;
  nomor_operator: string;
  website: string;
  nama_kecamatan: string;
  kode_kecamatan: string;
  nama_kepala_camat: string;
  nip_kepala_camat: string;
  nama_kabupaten: string;
  kode_kabupaten: string;
  nama_propinsi: string;
  kode_propinsi: string;
  nama_kontak: string;
  hp_kontak: string;
  jabatan_kontak: string;
  lat: string;
  lng: string;
  zoom: number;
  map_tipe: string;
}>;

export async function simpanIdentitas(args: SimpanIdentitasArgs) {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) {
    return prisma.config.create({
      data: { nama_desa: args.nama_desa ?? "Desa Baru", ...args },
    });
  }
  return prisma.config.update({ where: { id: cfg.id }, data: args });
}

// =====================================================================
// WILAYAH ADMINISTRATIF
// =====================================================================

export type BarisWilayah = {
  id: number;
  dusun: string;
  rw: string;
  rt: string;
  id_kepala: string | null;
  urut: number;
  urut_cetak: number;
};

export type PohonWilayah = {
  dusun: string;
  urut: number;
  rw: Array<{
    id: number;
    rw: string;
    urut: number;
    rt: Array<{ id: number; rt: string; urut: number }>;
  }>;
};

export async function ambilPohonWilayah(): Promise<PohonWilayah[]> {
  const semua = await prisma.wilayah.findMany({
    orderBy: [{ urut: "asc" }, { rw: "asc" }, { rt: "asc" }],
  });
  const dusunMap = new Map<string, PohonWilayah>();
  for (const w of semua) {
    if (w.rt === "0" && w.rw === "0") {
      // baris dusun
      if (!dusunMap.has(w.dusun)) {
        dusunMap.set(w.dusun, { dusun: w.dusun, urut: w.urut, rw: [] });
      }
    }
  }
  for (const w of semua) {
    if (w.rt === "0" && w.rw !== "0") {
      const dusun = dusunMap.get(w.dusun);
      if (dusun) {
        dusun.rw.push({ id: w.id, rw: w.rw, urut: w.urut, rt: [] });
      }
    }
  }
  for (const w of semua) {
    if (w.rt !== "0") {
      const dusun = dusunMap.get(w.dusun);
      const rw = dusun?.rw.find((r) => r.rw === w.rw);
      if (rw) rw.rt.push({ id: w.id, rt: w.rt, urut: w.urut });
    }
  }
  // Sort
  for (const d of dusunMap.values()) {
    d.rw.sort((a, b) => Number(a.rw) - Number(b.rw));
    for (const r of d.rw) r.rt.sort((a, b) => Number(a.rt) - Number(b.rt));
  }
  return Array.from(dusunMap.values()).sort((a, b) => a.urut - b.urut);
}

export async function ambilDaftarWilayahRingkas(): Promise<BarisWilayah[]> {
  return prisma.wilayah.findMany({
    orderBy: [{ dusun: "asc" }, { rw: "asc" }, { rt: "asc" }],
  });
}

export async function tambahWilayah(args: {
  dusun: string;
  rw?: string;
  rt?: string;
  id_kepala?: string;
}) {
  const configId = await ambilConfigId();
  const last = await prisma.wilayah.findFirst({
    where: { dusun: args.dusun, rw: args.rw ?? "0", rt: args.rt ?? "0" },
    orderBy: { urut: "desc" },
  });
  const urut = (last?.urut ?? 0) + 1;
  return prisma.wilayah.create({
    data: {
      config_id: configId,
      dusun: args.dusun,
      rw: args.rw ?? "0",
      rt: args.rt ?? "0",
      id_kepala: args.id_kepala ?? null,
      urut,
    },
  });
}

export async function hapusWilayah(id: number) {
  return prisma.wilayah.delete({ where: { id } });
}

// =====================================================================
// PEMERINTAH DESA — JABATAN
// =====================================================================

export type Jabatan = {
  id: number;
  nama: string;
  jenis: number;
  tupoksi: string | null;
  urut: number;
};

export async function ambilDaftarJabatan(): Promise<Jabatan[]> {
  return prisma.refJabatan.findMany({ orderBy: [{ urut: "asc" }, { id: "asc" }] });
}

export async function tambahJabatan(args: { nama: string; jenis?: number; tupoksi?: string }) {
  const configId = await ambilConfigId();
  const namaBersih = (args.nama ?? "").trim();
  if (!namaBersih) {
    throw new Error("Nama jabatan wajib diisi.");
  }
  // Tolak duplikat nama dalam scope desa yang sama.
  const duplikat = await prisma.refJabatan.findFirst({
    where: { config_id: configId, nama: namaBersih },
  });
  if (duplikat) {
    throw new Error(`Jabatan "${namaBersih}" sudah ada.`);
  }
  // Jabatan Kepala Desa (jenis=1) dan Sekretaris Desa (jenis=2)
  // hanya boleh satu per desa — sesuai struktur OpenSID.
  const jenis = args.jenis ?? 0;
  if (jenis === 1 || jenis === 2) {
    const slotTerpakai = await prisma.refJabatan.findFirst({
      where: { config_id: configId, jenis },
    });
    if (slotTerpakai) {
      const label = jenis === 1 ? "Kepala Desa" : "Sekretaris Desa";
      throw new Error(`Slot ${label} sudah dipakai oleh "${slotTerpakai.nama}".`);
    }
  }
  const last = await prisma.refJabatan.findFirst({ orderBy: { urut: "desc" } });
  return prisma.refJabatan.create({
    data: {
      config_id: configId,
      nama: namaBersih,
      jenis,
      tupoksi: args.tupoksi ?? null,
      urut: (last?.urut ?? 0) + 1,
    },
  });
}

export async function hapusJabatan(id: number) {
  return prisma.refJabatan.delete({ where: { id } });
}

export async function editJabatan(args: {
  id: number;
  nama?: string;
  jenis?: number;
  tupoksi?: string | null;
}) {
  const data: any = {};
  if (args.nama !== undefined) data.nama = args.nama;
  if (args.jenis !== undefined) data.jenis = args.jenis;
  if (args.tupoksi !== undefined) data.tupoksi = args.tupoksi;
  await prisma.refJabatan.update({ where: { id: args.id }, data });
}

// =====================================================================
// PEMERINTAH DESA — PAMONG (perangkat desa)
// =====================================================================

export type BarisPamong = {
  id: number;
  pamong_nama: string;
  pamong_nik: string | null;
  jabatan_id: number | null;
  jabatan_nama: string | null;
  pamong_status: number;
  status_pejabat: number;
  tempatlahir: string | null;
  tanggallahir: Date | null;
  sex: number | null;
  no_hp: string | null;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  foto: string | null;
  urutan: number;
};

export async function ambilDaftarPamong(): Promise<BarisPamong[]> {
  const data = await prisma.pamong.findMany({
    orderBy: [{ urutan: "asc" }, { id: "asc" }],
    include: { jabatan: true },
  });
  return data.map((p) => ({
    id: p.id,
    pamong_nama: p.pamong_nama,
    pamong_nik: p.pamong_nik,
    jabatan_id: p.jabatan_id,
    jabatan_nama: p.jabatan?.nama ?? null,
    pamong_status: p.pamong_status,
    status_pejabat: p.status_pejabat,
    tempatlahir: p.tempatlahir,
    tanggallahir: p.tanggallahir,
    sex: p.sex,
    no_hp: p.no_hp,
    gelar_depan: p.gelar_depan,
    gelar_belakang: p.gelar_belakang,
    foto: p.foto,
    urutan: p.urutan,
  }));
}

export async function ambilDetailPamong(id: number) {
  return prisma.pamong.findUnique({
    where: { id },
    include: { jabatan: true },
  });
}

export async function tambahPamong(args: {
  pamong_nama: string;
  pamong_nik?: string;
  jabatan_id?: number;
  pamong_status?: number;
  status_pejabat?: number;
  no_hp?: string;
  tempatlahir?: string;
  tanggallahir?: Date | null;
  sex?: number;
  gelar_depan?: string;
  gelar_belakang?: string;
}) {
  const configId = await ambilConfigId();
  // Jika jabatan yang dipilih adalah Kepala Desa (jenis=1) atau
  // Sekretaris Desa (jenis=2), pastikan slot tersebut belum dipakai
  // oleh pamong aktif lain di desa ini.
  if (args.jabatan_id != null && (args.pamong_status ?? 1) === 1) {
    const jab = await prisma.refJabatan.findUnique({
      where: { id: args.jabatan_id },
    });
    if (jab && (jab.jenis === 1 || jab.jenis === 2)) {
      const bentrok = await prisma.pamong.findFirst({
        where: {
          config_id: configId,
          pamong_status: 1,
          jabatan_id: { not: null },
          jabatan: { jenis: jab.jenis },
        },
        select: { id: true, pamong_nama: true },
      });
      if (bentrok) {
        const label = jab.jenis === 1 ? "Kepala Desa" : "Sekretaris Desa";
        throw new Error(
          `Slot ${label} sudah dipakai oleh "${bentrok.pamong_nama}". Non-aktifkan dulu jika ingin mengganti.`,
        );
      }
    }
  }
  const last = await prisma.pamong.findFirst({ orderBy: { urutan: "desc" } });
  return prisma.pamong.create({
    data: {
      config_id: configId,
      pamong_nama: args.pamong_nama,
      pamong_nik: args.pamong_nik ?? null,
      jabatan_id: args.jabatan_id ?? null,
      pamong_status: args.pamong_status ?? 1,
      status_pejabat: args.status_pejabat ?? 0,
      no_hp: args.no_hp ?? null,
      tempatlahir: args.tempatlahir ?? null,
      tanggallahir: args.tanggallahir ?? null,
      sex: args.sex ?? null,
      gelar_depan: args.gelar_depan ?? null,
      gelar_belakang: args.gelar_belakang ?? null,
      urutan: (last?.urutan ?? 0) + 1,
    },
  });
}

export async function hapusPamong(id: number) {
  return prisma.pamong.delete({ where: { id } });
}

export async function editPamong(args: {
  id: number;
  pamong_nama?: string;
  pamong_nik?: string | null;
  jabatan_id?: number | null;
  pamong_status?: number;
  status_pejabat?: number;
  no_hp?: string | null;
  tempatlahir?: string | null;
  tanggallahir?: Date | null;
  sex?: number | null;
  gelar_depan?: string | null;
  gelar_belakang?: string | null;
}) {
  const data: any = {};
  if (args.pamong_nama !== undefined) data.pamong_nama = args.pamong_nama;
  if (args.pamong_nik !== undefined) data.pamong_nik = args.pamong_nik;
  if (args.jabatan_id !== undefined) data.jabatan_id = args.jabatan_id;
  if (args.pamong_status !== undefined) data.pamong_status = args.pamong_status;
  if (args.status_pejabat !== undefined) data.status_pejabat = args.status_pejabat;
  if (args.no_hp !== undefined) data.no_hp = args.no_hp;
  if (args.tempatlahir !== undefined) data.tempatlahir = args.tempatlahir;
  if (args.tanggallahir !== undefined) data.tanggallahir = args.tanggallahir;
  if (args.sex !== undefined) data.sex = args.sex;
  if (args.gelar_depan !== undefined) data.gelar_depan = args.gelar_depan;
  if (args.gelar_belakang !== undefined) data.gelar_belakang = args.gelar_belakang;
  await prisma.pamong.update({ where: { id: args.id }, data });
}

// =====================================================================
// PROFIL DESA (status, ekologi, internet, adat)
// key-value, mengikuti OpenSID asli.
// =====================================================================

export type ProfilItem = {
  id: number;
  key: string;
  value: string;
  kategori: string;
  judul: string;
};

export const PROFIL_PRESET: Array<{ key: string; kategori: string; judul: string }> = [
  { key: "status_desa", kategori: "adat", judul: "Status Desa" },
  { key: "jenis_tanah", kategori: "ekologi", judul: "Jenis Tanah" },
  { key: "topografi", kategori: "ekologi", judul: "Topografi" },
  { key: "sumber_daya_alam", kategori: "ekologi", judul: "Sumber Daya Alam" },
  { key: "flora_fauna", kategori: "ekologi", judul: "Flora & Fauna" },
  { key: "rawan_bencana", kategori: "ekologi", judul: "Daerah Rawan Bencana" },
  { key: "kearifan_lokal", kategori: "ekologi", judul: "Kearifan Lokal" },
  { key: "jenis_jaringan", kategori: "internet", judul: "Jenis Jaringan Internet" },
  { key: "provider_internet", kategori: "internet", judul: "Provider Internet" },
  { key: "cakupan_wilayah", kategori: "internet", judul: "Cakupan Wilayah" },
  { key: "kecepatan_internet", kategori: "internet", judul: "Kecepatan Internet" },
  { key: "akses_publik", kategori: "internet", judul: "Akses Publik" },
  { key: "lembaga_adat", kategori: "adat", judul: "Lembaga Adat" },
  { key: "struktur_adat", kategori: "adat", judul: "Struktur Adat" },
  { key: "wilayah_adat", kategori: "adat", judul: "Wilayah Adat" },
  { key: "peraturan_adat", kategori: "adat", judul: "Peraturan Adat" },
];

export async function ambilProfilDesa(): Promise<ProfilItem[]> {
  const data = await prisma.profilDesa.findMany({
    orderBy: [{ kategori: "asc" }, { key: "asc" }],
  });
  return data;
}

export async function simpanProfil(args: {
  items: Array<{ key: string; value: string; kategori: string; judul: string }>;
}) {
  const configId = await ambilConfigId();
  const hasil: ProfilItem[] = [];
  for (const it of args.items) {
    const row = await prisma.profilDesa.upsert({
      where: { config_id_key: { config_id: configId, key: it.key } },
      update: { value: it.value, kategori: it.kategori, judul: it.judul },
      create: {
        config_id: configId,
        key: it.key,
        value: it.value,
        kategori: it.kategori,
        judul: it.judul,
      },
    });
    hasil.push(row);
  }
  return hasil;
}

// =====================================================================
// LEMBAGA DESA
// =====================================================================

export type BarisLembaga = {
  id: number;
  nama: string;
  singkatan: string | null;
  ketua: string | null;
  sekretaris: string | null;
  alamat: string | null;
  keterangan: string | null;
  urut: number;
  enabled: number;
};

export async function ambilDaftarLembaga(): Promise<BarisLembaga[]> {
  return prisma.lembaga.findMany({ orderBy: [{ urut: "asc" }, { id: "asc" }] });
}

export async function tambahLembaga(args: {
  nama: string;
  singkatan?: string;
  ketua?: string;
  sekretaris?: string;
  alamat?: string;
  keterangan?: string;
}) {
  const configId = await ambilConfigId();
  const last = await prisma.lembaga.findFirst({ orderBy: { urut: "desc" } });
  return prisma.lembaga.create({
    data: {
      config_id: configId,
      nama: args.nama,
      singkatan: args.singkatan ?? null,
      ketua: args.ketua ?? null,
      sekretaris: args.sekretaris ?? null,
      alamat: args.alamat ?? null,
      keterangan: args.keterangan ?? null,
      urut: (last?.urut ?? 0) + 1,
      enabled: 1,
    },
  });
}

export async function hapusLembaga(id: number) {
  return prisma.lembaga.delete({ where: { id } });
}

export async function editLembaga(args: {
  id: number;
  nama?: string;
  singkatan?: string | null;
  ketua?: string | null;
  sekretaris?: string | null;
  alamat?: string | null;
  keterangan?: string | null;
}) {
  const data: any = {};
  if (args.nama !== undefined) data.nama = args.nama;
  if (args.singkatan !== undefined) data.singkatan = args.singkatan;
  if (args.ketua !== undefined) data.ketua = args.ketua;
  if (args.sekretaris !== undefined) data.sekretaris = args.sekretaris;
  if (args.alamat !== undefined) data.alamat = args.alamat;
  if (args.keterangan !== undefined) data.keterangan = args.keterangan;
  await prisma.lembaga.update({ where: { id: args.id }, data });
}

// =====================================================================
// LAYANAN PELANGGAN
// =====================================================================

export type BarisLayanan = {
  id: number;
  nama: string;
  kategori: string | null;
  kontak: string | null;
  url_form: string | null;
  keterangan: string | null;
  enabled: number;
};

export async function ambilDaftarLayanan(): Promise<BarisLayanan[]> {
  return prisma.layananPelanggan.findMany({ orderBy: [{ id: "asc" }] });
}

export async function tambahLayanan(args: {
  nama: string;
  kategori?: string;
  kontak?: string;
  url_form?: string;
  keterangan?: string;
}) {
  const configId = await ambilConfigId();
  return prisma.layananPelanggan.create({
    data: {
      config_id: configId,
      nama: args.nama,
      kategori: args.kategori ?? null,
      kontak: args.kontak ?? null,
      url_form: args.url_form ?? null,
      keterangan: args.keterangan ?? null,
      enabled: 1,
    },
  });
}

export async function hapusLayanan(id: number) {
  return prisma.layananPelanggan.delete({ where: { id } });
}

// =====================================================================
// PENDAFTARAN KERJASAMA
// =====================================================================

export type BarisKerjasama = {
  id: number;
  judul: string;
  mitra: string;
  bidang: string | null;
  tanggal_mulai: Date | null;
  tanggal_selesai: Date | null;
  nomor: string | null;
  keterangan: string | null;
  enabled: number;
};

export async function ambilDaftarKerjasama(): Promise<BarisKerjasama[]> {
  return prisma.kerjasama.findMany({ orderBy: [{ id: "desc" }] });
}

export async function tambahKerjasama(args: {
  judul: string;
  mitra: string;
  bidang?: string;
  tanggal_mulai?: Date | null;
  tanggal_selesai?: Date | null;
  nomor?: string;
  keterangan?: string;
}) {
  const configId = await ambilConfigId();
  return prisma.kerjasama.create({
    data: {
      config_id: configId,
      judul: args.judul,
      mitra: args.mitra,
      bidang: args.bidang ?? null,
      tanggal_mulai: args.tanggal_mulai ?? null,
      tanggal_selesai: args.tanggal_selesai ?? null,
      nomor: args.nomor ?? null,
      keterangan: args.keterangan ?? null,
      enabled: 1,
    },
  });
}

export async function hapusKerjasama(id: number) {
  return prisma.kerjasama.delete({ where: { id } });
}
