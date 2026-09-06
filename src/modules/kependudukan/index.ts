// Entry point module kependudukan.
// Ekspor importer + helper statistik desa.

export { importKependudukan } from "./handler";
export type { ImporterResult } from "./handler";
export { eksporPendudukExcel } from "./ekspor";

import { prisma } from "@/lib/prisma";

export type StatistikPenduduk = {
  totalKK: number;
  totalPenduduk: number;
  lakiLaki: number;
  perempuan: number;
  totalAgama: number;
  totalPekerjaan: number;
};

export async function ambilStatistik(): Promise<StatistikPenduduk> {
  const [totalKK, totalPenduduk, lakiLaki, perempuan, totalAgama, totalPekerjaan] =
    await Promise.all([
      prisma.keluarga.count(),
      prisma.penduduk.count(),
      prisma.penduduk.count({ where: { sex: 1 } }),
      prisma.penduduk.count({ where: { sex: 2 } }),
      prisma.refAgama.count(),
      prisma.refPekerjaan.count(),
    ]);
  return {
    totalKK,
    totalPenduduk,
    lakiLaki,
    perempuan,
    totalAgama,
    totalPekerjaan,
  };
}

export type DaftarPendudukArgs = {
  halaman?: number;
  perHalaman?: number;
  cari?: string;
  configId?: number;
};

export type DaftarPendudukResult = {
  baris: Array<{
    id: number;
    nik: string;
    nama: string;
    sex: number | null;
    tempatlahir: string | null;
    tanggallahir: Date | null;
    alamat: string | null;
    dusun: string | null;
    rw: string | null;
    rt: string | null;
    agama: string | null;
    pekerjaan: string | null;
    status_kawin: number | null;
    kk_level: number | null;
    hubungan_kk: string | null;
    no_kk: string | null;
    kepala_keluarga: string | null;
  }>;
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
};

export async function ambilDaftarPenduduk(
  args: DaftarPendudukArgs = {},
): Promise<DaftarPendudukResult> {
  const halaman = Math.max(1, args.halaman ?? 1);
  const perHalaman = Math.min(100, Math.max(1, args.perHalaman ?? 20));
  const skip = (halaman - 1) * perHalaman;
  const where: any = {};
  if (args.configId) where.config_id = args.configId;
  if (args.cari) {
    where.OR = [
      { nama: { contains: args.cari } },
      { nik: { contains: args.cari } },
    ];
  }
  const [total, data] = await Promise.all([
    prisma.penduduk.count({ where }),
    prisma.penduduk.findMany({
      where,
      skip,
      take: perHalaman,
      orderBy: { nik: "asc" },
      include: {
        agama: true,
        pekerjaan: true,
        kk_level_ref: true,
        keluarga: {
          select: { no_kk: true, alamat: true, dusun: true, rw: true, rt: true },
        },
      },
    }),
  ]);

  // Cari kepala keluarga untuk setiap KK di hasil
  const noKkList = Array.from(new Set(data.map((d) => d.no_kk).filter(Boolean) as string[]));
  const kepalaMap = new Map<string, string>();
  if (noKkList.length > 0) {
    const kepala = await prisma.penduduk.findMany({
      where: { no_kk: { in: noKkList }, kk_level: 1 },
      select: { no_kk: true, nama: true },
    });
    for (const k of kepala) if (k.no_kk) kepalaMap.set(k.no_kk, k.nama);
  }

  const baris = data.map((d) => ({
    id: d.id,
    nik: d.nik,
    nama: d.nama,
    sex: d.sex,
    tempatlahir: d.tempatlahir,
    tanggallahir: d.tanggallahir,
    alamat: d.keluarga?.alamat ?? null,
    dusun: d.keluarga?.dusun ?? null,
    rw: d.keluarga?.rw ?? null,
    rt: d.keluarga?.rt ?? null,
    agama: d.agama?.nama ?? null,
    pekerjaan: d.pekerjaan?.nama ?? null,
    status_kawin: d.status_kawin,
    kk_level: d.kk_level,
    hubungan_kk: d.kk_level_ref?.nama ?? null,
    no_kk: d.no_kk,
    kepala_keluarga: d.no_kk ? kepalaMap.get(d.no_kk) ?? null : null,
  }));

  return {
    baris,
    total,
    halaman,
    perHalaman,
    totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
  };
}

// =====================================================================
// Rekap Rumah Tangga per Dusun + per RW.
// Dipakai oleh halaman /admin/rumah-tangga.
// =====================================================================

export type RekapRumahTangga = {
  perDusun: Array<{
    dusun: string;
    rw: string | null;
    rt: string | null;
    jumlahKK: number;
    jumlahJiwa: number;
  }>;
  perRW: Array<{
    dusun: string;
    rw: string;
    jumlahKK: number;
    jumlahJiwa: number;
  }>;
};

export async function ambilRekapRumahTangga(): Promise<RekapRumahTangga> {
  const kkList = await prisma.keluarga.findMany({
    select: {
      no_kk: true,
      dusun: true,
      rw: true,
      rt: true,
      _count: { select: { anggota: true } },
    },
    orderBy: [{ dusun: "asc" }, { rw: "asc" }, { rt: "asc" }],
  });

  const perDusunMap = new Map<string, { rw: string | null; rt: string | null; jumlahKK: number; jumlahJiwa: number }>();
  const perRWMap = new Map<string, { dusun: string; rw: string; jumlahKK: number; jumlahJiwa: number }>();

  for (const k of kkList) {
    const keyDusun = k.dusun ?? "(Tidak diketahui)";
    const existingDusun = perDusunMap.get(keyDusun) ?? { rw: k.rw, rt: k.rt, jumlahKK: 0, jumlahJiwa: 0 };
    existingDusun.jumlahKK += 1;
    existingDusun.jumlahJiwa += k._count.anggota;
    perDusunMap.set(keyDusun, existingDusun);

    if (k.rw && k.rw !== "0") {
      const keyRW = `${keyDusun}__${k.rw}`;
      const existingRW = perRWMap.get(keyRW) ?? { dusun: keyDusun, rw: k.rw, jumlahKK: 0, jumlahJiwa: 0 };
      existingRW.jumlahKK += 1;
      existingRW.jumlahJiwa += k._count.anggota;
      perRWMap.set(keyRW, existingRW);
    }
  }

  const perDusun = Array.from(perDusunMap.entries()).map(([dusun, v]) => ({
    dusun,
    rw: v.rw,
    rt: v.rt,
    jumlahKK: v.jumlahKK,
    jumlahJiwa: v.jumlahJiwa,
  }));

  const perRW = Array.from(perRWMap.values()).map((v) => ({
    dusun: v.dusun,
    rw: v.rw,
    jumlahKK: v.jumlahKK,
    jumlahJiwa: v.jumlahJiwa,
  }));

  return { perDusun, perRW };
}

// =====================================================================
// Daftar KK per Dusun / per RW (untuk halaman drill-down Rumah Tangga).
// =====================================================================

export type BarisKKRumahTangga = {
  no_kk: string;
  alamat: string | null;
  dusun: string | null;
  rw: string | null;
  rt: string | null;
  jumlahAnggota: number;
};

export type HasilKK = {
  baris: BarisKKRumahTangga[];
  total: number;
};

export async function ambilDaftarKKByDusun(
  dusun: string,
  halaman: number,
  perHalaman: number,
): Promise<HasilKK> {
  const skip = (Math.max(1, halaman) - 1) * perHalaman;
  const where = { dusun };

  const [barisRaw, total] = await Promise.all([
    prisma.keluarga.findMany({
      where,
      select: {
        no_kk: true,
        alamat: true,
        dusun: true,
        rw: true,
        rt: true,
        _count: { select: { anggota: true } },
      },
      orderBy: [{ rw: "asc" }, { rt: "asc" }, { no_kk: "asc" }],
      skip,
      take: perHalaman,
    }),
    prisma.keluarga.count({ where }),
  ]);

  return {
    baris: barisRaw.map((b) => ({
      no_kk: b.no_kk,
      alamat: b.alamat,
      dusun: b.dusun,
      rw: b.rw,
      rt: b.rt,
      jumlahAnggota: b._count.anggota,
    })),
    total,
  };
}

export async function ambilDaftarKKByRW(
  dusun: string,
  rw: string,
  halaman: number,
  perHalaman: number,
): Promise<HasilKK> {
  const skip = (Math.max(1, halaman) - 1) * perHalaman;
  const where = { dusun, rw };

  const [barisRaw, total] = await Promise.all([
    prisma.keluarga.findMany({
      where,
      select: {
        no_kk: true,
        alamat: true,
        dusun: true,
        rw: true,
        rt: true,
        _count: { select: { anggota: true } },
      },
      orderBy: [{ rt: "asc" }, { no_kk: "asc" }],
      skip,
      take: perHalaman,
    }),
    prisma.keluarga.count({ where }),
  ]);

  return {
    baris: barisRaw.map((b) => ({
      no_kk: b.no_kk,
      alamat: b.alamat,
      dusun: b.dusun,
      rw: b.rw,
      rt: b.rt,
      jumlahAnggota: b._count.anggota,
    })),
    total,
  };
}

/** Daftar dusun unik untuk navigasi. */
export async function ambilDaftarDusun(): Promise<string[]> {
  const rows = await prisma.keluarga.findMany({
    select: { dusun: true },
    distinct: ["dusun"],
    orderBy: { dusun: "asc" },
  });
  return rows.map((r) => r.dusun ?? "").filter((d) => d.length > 0);
}

// =====================================================================
// Rekap Kelompok per Pekerjaan.
// Dipakai oleh halaman /admin/kelompok.
// =====================================================================

export type RekapKelompokPekerjaan = Array<{
  id: number;
  nama: string;
  total: number;
  laki: number;
  perempuan: number;
  persen: number;
}>;

export async function ambilRekapKelompokPekerjaan(): Promise<{
  baris: RekapKelompokPekerjaan;
  total: number;
}> {
  const refs = await prisma.refPekerjaan.findMany({ orderBy: { nama: "asc" } });
  const total = await prisma.penduduk.count();

  const baris = await Promise.all(
    refs.map(async (r) => {
      const [semua, laki, perempuan] = await Promise.all([
        prisma.penduduk.count({ where: { pekerjaan_id: r.id } }),
        prisma.penduduk.count({ where: { pekerjaan_id: r.id, sex: 1 } }),
        prisma.penduduk.count({ where: { pekerjaan_id: r.id, sex: 2 } }),
      ]);
      return {
        id: r.id,
        nama: r.nama,
        total: semua,
        laki,
        perempuan,
        persen: total > 0 ? Number(((semua / total) * 100).toFixed(1)) : 0,
      };
    }),
  );

  return { baris, total };
}

// =====================================================================
// Calon Pemilih (>= 17 tahun, WNI, status hidup).
// Dipakai oleh halaman /admin/pemilih.
// =====================================================================

export type CalonPemilihArgs = {
  halaman?: number;
  perHalaman?: number;
  configId?: number;
};

export type CalonPemilihResult = {
  baris: Array<{
    id: number;
    nik: string;
    nama: string;
    sex: number | null;
    tanggallahir: Date | null;
    tempatlahir: string | null;
    usia: number | null;
    dusun: string | null;
    rw: string | null;
    rt: string | null;
    no_kk: string | null;
  }>;
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
};

export function hitungUsia(tglLahir: Date | null, now: Date = new Date()): number | null {
  if (!tglLahir) return null;
  let usia = now.getFullYear() - tglLahir.getFullYear();
  const m = now.getMonth() - tglLahir.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < tglLahir.getDate())) usia--;
  return usia;
}

export async function ambilDaftarCalonPemilih(
  args: CalonPemilihArgs = {},
): Promise<CalonPemilihResult> {
  const halaman = Math.max(1, args.halaman ?? 1);
  const perHalaman = Math.min(100, Math.max(1, args.perHalaman ?? 20));
  const skip = (halaman - 1) * perHalaman;

  // Cutoff tanggal lahir: penduduk dengan tgl lahir <= cutoff
  // berarti sudah berusia minimal 17 tahun.
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 17);

  const where: any = {
    status_dasar: 1,
    warganegara_id: 1,
    tanggallahir: { lte: cutoff },
  };
  if (args.configId) where.config_id = args.configId;

  const [total, data] = await Promise.all([
    prisma.penduduk.count({ where }),
    prisma.penduduk.findMany({
      where,
      skip,
      take: perHalaman,
      orderBy: { tanggallahir: "desc" },
      include: {
        keluarga: { select: { dusun: true, rw: true, rt: true, no_kk: true } },
      },
    }),
  ]);

  const baris = data.map((p) => ({
    id: p.id,
    nik: p.nik,
    nama: p.nama,
    sex: p.sex,
    tanggallahir: p.tanggallahir,
    tempatlahir: p.tempatlahir,
    usia: hitungUsia(p.tanggallahir),
    dusun: p.keluarga?.dusun ?? null,
    rw: p.keluarga?.rw ?? null,
    rt: p.keluarga?.rt ?? null,
    no_kk: p.keluarga?.no_kk ?? null,
  }));

  return {
    baris,
    total,
    halaman,
    perHalaman,
    totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
  };
}

export type StatistikCalonPemilih = {
  total: number;
  laki: number;
  perempuan: number;
  batasUsia: number;
};

export async function ambilStatistikCalonPemilih(): Promise<StatistikCalonPemilih> {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 17);
  const base = {
    status_dasar: 1,
    warganegara_id: 1,
    tanggallahir: { lte: cutoff },
  } as const;
  const [total, laki, perempuan] = await Promise.all([
    prisma.penduduk.count({ where: base }),
    prisma.penduduk.count({ where: { ...base, sex: 1 } }),
    prisma.penduduk.count({ where: { ...base, sex: 2 } }),
  ]);
  return { total, laki, perempuan, batasUsia: 17 };
}

// =====================================================================
// CRUD Kartu Keluarga + Penduduk (anggota KK).
// Dipakai oleh server actions + halaman detail.
// =====================================================================

export type BuatKKArgs = {
  no_kk: string;
  alamat?: string | null;
  dusun?: string | null;
  rw?: string | null;
  rt?: string | null;
  // Data kepala keluarga (wajib): di-insert bersamaan dengan KK.
  kepala: {
    nik: string;
    nama: string;
    sex?: number | null;
    tempatlahir?: string | null;
    tanggallahir?: Date | null;
    agama_id?: number | null;
    pekerjaan_id?: number | null;
    status_kawin?: number | null;
    pendidikan_kk_id?: number | null;
    warganegara_id?: number | null;
    golongan_darah_id?: number | null;
  };
};

export async function buatKKBaru(args: BuatKKArgs): Promise<{ no_kk: string }> {
  if (!args.no_kk.trim()) throw new Error("Nomor KK wajib diisi.");
  if (!args.kepala.nik.trim()) throw new Error("NIK kepala keluarga wajib diisi.");
  if (!args.kepala.nama.trim()) throw new Error("Nama kepala keluarga wajib diisi.");

  const configId = await ambilConfigId();

  // Cek KK duplikat
  const existing = await prisma.keluarga.findUnique({
    where: { no_kk: args.no_kk },
  });
  if (existing) throw new Error(`KK ${args.no_kk} sudah tercatat.`);

  // Cek NIK duplikat
  const existingNik = await prisma.penduduk.findUnique({
    where: { nik: args.kepala.nik },
  });
  if (existingNik) throw new Error(`NIK ${args.kepala.nik} sudah terdaftar.`);

  return prisma.$transaction(async (tx) => {
    await tx.keluarga.create({
      data: {
        no_kk: args.no_kk,
        config_id: configId,
        alamat: args.alamat ?? null,
        dusun: args.dusun ?? null,
        rw: args.rw ?? null,
        rt: args.rt ?? null,
      },
    });
    await tx.penduduk.create({
      data: {
        nik: args.kepala.nik,
        no_kk: args.no_kk,
        config_id: configId,
        nama: args.kepala.nama,
        sex: args.kepala.sex ?? null,
        tempatlahir: args.kepala.tempatlahir ?? null,
        tanggallahir: args.kepala.tanggallahir ?? null,
        agama_id: args.kepala.agama_id ?? null,
        pekerjaan_id: args.kepala.pekerjaan_id ?? null,
        status_kawin: args.kepala.status_kawin ?? null,
        pendidikan_kk_id: args.kepala.pendidikan_kk_id ?? null,
        warganegara_id: args.kepala.warganegara_id ?? null,
        golongan_darah_id: args.kepala.golongan_darah_id ?? null,
        kk_level: 1,
        status_dasar: 1,
      },
    });
    return { no_kk: args.no_kk };
  });
}

export type EditKKArgs = {
  no_kk: string;
  alamat?: string | null;
  dusun?: string | null;
  rw?: string | null;
  rt?: string | null;
};

export async function editKK(args: EditKKArgs): Promise<void> {
  // Partial update: hanya field yang dikirim (bukan undefined) yang di-update.
  const data: any = {};
  if (args.alamat !== undefined) data.alamat = args.alamat ?? null;
  if (args.dusun !== undefined) data.dusun = args.dusun ?? null;
  if (args.rw !== undefined) data.rw = args.rw ?? null;
  if (args.rt !== undefined) data.rt = args.rt ?? null;
  await prisma.keluarga.update({
    where: { no_kk: args.no_kk },
    data,
  });
}

export async function hapusKK(no_kk: string): Promise<void> {
  await prisma.keluarga.delete({ where: { no_kk } });
}

export type TambahAnggotaArgs = {
  no_kk: string;
  nik: string;
  nama: string;
  sex?: number | null;
  tempatlahir?: string | null;
  tanggallahir?: Date | null;
  kk_level?: number | null;
  agama_id?: number | null;
  pekerjaan_id?: number | null;
  status_kawin?: number | null;
  pendidikan_kk_id?: number | null;
  warganegara_id?: number | null;
  golongan_darah_id?: number | null;
};

export async function tambahAnggota(args: TambahAnggotaArgs): Promise<{ nik: string }> {
  if (!args.nik.trim()) throw new Error("NIK wajib diisi.");
  if (!args.nama.trim()) throw new Error("Nama wajib diisi.");
  const kk = await prisma.keluarga.findUnique({ where: { no_kk: args.no_kk } });
  if (!kk) throw new Error(`KK ${args.no_kk} tidak ditemukan.`);

  const existing = await prisma.penduduk.findUnique({ where: { nik: args.nik } });
  if (existing) throw new Error(`NIK ${args.nik} sudah terdaftar.`);

  await prisma.penduduk.create({
    data: {
      nik: args.nik,
      no_kk: args.no_kk,
      config_id: kk.config_id,
      nama: args.nama,
      sex: args.sex ?? null,
      tempatlahir: args.tempatlahir ?? null,
      tanggallahir: args.tanggallahir ?? null,
      kk_level: args.kk_level ?? 3,
      agama_id: args.agama_id ?? null,
      pekerjaan_id: args.pekerjaan_id ?? null,
      status_kawin: args.status_kawin ?? null,
      pendidikan_kk_id: args.pendidikan_kk_id ?? null,
      warganegara_id: args.warganegara_id ?? null,
      golongan_darah_id: args.golongan_darah_id ?? null,
      status_dasar: 1,
    },
  });
  return { nik: args.nik };
}

export type EditAnggotaArgs = TambahAnggotaArgs & { nikAsal: string };

export async function editAnggota(args: EditAnggotaArgs): Promise<void> {
  const { nikAsal, ...data } = args;
  // Jika NIK berubah, validasi unik.
  if (nikAsal !== data.nik) {
    const existing = await prisma.penduduk.findUnique({ where: { nik: data.nik } });
    if (existing) throw new Error(`NIK ${data.nik} sudah dipakai warga lain.`);
  }
  // Partial update: hanya field yang dikirim (bukan undefined) yang di-update.
  // Saat ini FormData selalu mengirim semua field, jadi "" string dianggap
  // "tidak diubah" untuk dropdown ID opsional.
  const updateData: any = {
    nik: data.nik,
    nama: data.nama,
  };
  if (data.sex !== undefined) updateData.sex = data.sex ?? null;
  if (data.tempatlahir !== undefined) updateData.tempatlahir = data.tempatlahir ?? null;
  if (data.tanggallahir !== undefined) updateData.tanggallahir = data.tanggallahir ?? null;
  if (data.kk_level !== undefined && data.kk_level !== null) updateData.kk_level = data.kk_level;
  // Untuk dropdown opsional: hanya update bila nilai non-kosong string dikirim.
  if (data.agama_id !== undefined) updateData.agama_id = data.agama_id ?? null;
  if (data.pekerjaan_id !== undefined) updateData.pekerjaan_id = data.pekerjaan_id ?? null;
  if (data.status_kawin !== undefined) updateData.status_kawin = data.status_kawin ?? null;
  if (data.pendidikan_kk_id !== undefined) updateData.pendidikan_kk_id = data.pendidikan_kk_id ?? null;
  if (data.warganegara_id !== undefined) updateData.warganegara_id = data.warganegara_id ?? null;
  if (data.golongan_darah_id !== undefined) updateData.golongan_darah_id = data.golongan_darah_id ?? null;

  await prisma.penduduk.update({
    where: { nik: nikAsal },
    data: updateData,
  });
}

export async function hapusAnggota(nik: string): Promise<void> {
  const p = await prisma.penduduk.findUnique({ where: { nik } });
  if (!p) return;
  if (p.kk_level === 1) {
    throw new Error("Tidak dapat menghapus kepala keluarga. Hapus KK seluruhnya.");
  }
  await prisma.penduduk.delete({ where: { nik } });
}

// Cache referensi penduduk di memory.
// Data referensi (agama, pekerjaan, dll) jarang berubah — cache selama lifetime server.
// Mengurangi 11 query DB menjadi 1 query per server restart.
let _cacheReferensi: ReturnType<typeof ambilReferensiPenduduk> | null = null;
let _cacheReferensiTime = 0;

/** Ambil referensi untuk form penduduk (agama, pekerjaan, dll). */
export async function ambilReferensiPenduduk() {
  // Cek cache (TTL 1 jam)
  const now = Date.now();
  if (_cacheReferensi && now - _cacheReferensiTime < 3600_000) {
    return _cacheReferensi;
  }

  const result = await _fetchReferensi();
  _cacheReferensi = result;
  _cacheReferensiTime = now;
  return result;
}

async function _fetchReferensi() {
  const [agama, pekerjaan, statusKawin, pendidikan, hubunganKK, warganegara, golonganDarah, cacat, caraKB, statusDasar, asuransi] =
    await Promise.all([
      prisma.refAgama.findMany({ orderBy: { nama: "asc" } }),
      prisma.refPekerjaan.findMany({ orderBy: { nama: "asc" } }),
      prisma.refStatusKawin.findMany({ orderBy: { nama: "asc" } }),
      prisma.refPendidikan.findMany({ orderBy: { nama: "asc" } }),
      prisma.refHubunganKK.findMany({ orderBy: { nama: "asc" } }),
      prisma.refWarganegara.findMany({ orderBy: { nama: "asc" } }),
      prisma.refGolonganDarah.findMany({ orderBy: { nama: "asc" } }),
      prisma.refCacat.findMany({ orderBy: { nama: "asc" } }),
      prisma.refCaraKB.findMany({ orderBy: { nama: "asc" } }),
      prisma.refStatusDasar.findMany({ orderBy: { nama: "asc" } }),
      prisma.refAsuransi.findMany({ orderBy: { nama: "asc" } }),
    ]);
  return {
    agama,
    pekerjaan,
    statusKawin,
    pendidikan,
    hubunganKK,
    warganegara,
    golonganDarah,
    cacat,
    caraKB,
    statusDasar,
    asuransi,
  };
}

// Util bersama: ambil config_id (mengikuti info-desa)
export async function ambilConfigId(): Promise<number> {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  return cfg?.id ?? 1;
}

// =====================================================================
// Detail satu Kartu Keluarga + daftar anggotanya.
// Dipakai oleh halaman /admin/kependudukan/kk/[no_kk].
// =====================================================================

export type DetailKK = {
  kk: {
    no_kk: string;
    alamat: string | null;
    dusun: string | null;
    rw: string | null;
    rt: string | null;
    created_at: Date | null;
    updated_at: Date | null;
  };
  statistik: {
    total: number;
    lakiLaki: number;
    perempuan: number;
  };
  kepala: {
    nik: string;
    nama: string;
    hubungan_kk: string | null;
  } | null;
  anggota: Array<{
    id: number;
    nik: string;
    nama: string;
    sex: number | null;
    tempatlahir: string | null;
    tanggallahir: Date | null;
    kk_level: number | null;
    hubungan_kk: string | null;
    status_kawin: number | null;
    status_kawin_nama: string | null;
    pekerjaan: string | null;
    pekerjaan_id: number | null;
    agama: string | null;
    agama_id: number | null;
    pendidikan: string | null;
    pendidikan_kk_id: number | null;
    warganegara: string | null;
    warganegara_id: number | null;
    golongan_darah: string | null;
    golongan_darah_id: number | null;
    ayah_nik: string | null;
    ibu_nik: string | null;
  }>;
};

export async function ambilDetailKK(noKK: string): Promise<DetailKK | null> {
  if (!noKK) return null;

  const keluarga = await prisma.keluarga.findUnique({
    where: { no_kk: noKK },
  });
  if (!keluarga) return null;

  const anggotaRaw = await prisma.penduduk.findMany({
    where: { no_kk: noKK },
    orderBy: [{ kk_level: "asc" }, { nik: "asc" }],
    include: {
      kk_level_ref: true,
      agama: true,
      pekerjaan: true,
      pendidikan_kk: true,
      warganegara: true,
      golongan_darah: true,
    },
  });

  // Lookup status kawin (tabel terpisah, tidak di-include di atas).
  const statusKawinIds = Array.from(
    new Set(anggotaRaw.map((a) => a.status_kawin).filter((v): v is number => v != null)),
  );
  const refStatusKawin =
    statusKawinIds.length > 0
      ? await prisma.refStatusKawin.findMany({
          where: { id: { in: statusKawinIds } },
          select: { id: true, nama: true },
        })
      : [];
  const statusKawinMap = new Map<number, string>();
  for (const r of refStatusKawin) statusKawinMap.set(r.id, r.nama);

  const lakiLaki = anggotaRaw.filter((a) => a.sex === 1).length;
  const perempuan = anggotaRaw.filter((a) => a.sex === 2).length;

  const anggota = anggotaRaw.map((a) => ({
    id: a.id,
    nik: a.nik,
    nama: a.nama,
    sex: a.sex,
    tempatlahir: a.tempatlahir,
    tanggallahir: a.tanggallahir,
    kk_level: a.kk_level,
    hubungan_kk: a.kk_level_ref?.nama ?? null,
    status_kawin: a.status_kawin,
    status_kawin_nama: a.status_kawin != null ? statusKawinMap.get(a.status_kawin) ?? null : null,
    pekerjaan: a.pekerjaan?.nama ?? null,
    pekerjaan_id: a.pekerjaan_id,
    agama: a.agama?.nama ?? null,
    agama_id: a.agama_id,
    pendidikan: a.pendidikan_kk?.nama ?? null,
    pendidikan_kk_id: a.pendidikan_kk_id,
    warganegara: a.warganegara?.nama ?? null,
    warganegara_id: a.warganegara_id,
    golongan_darah: a.golongan_darah?.nama ?? null,
    golongan_darah_id: a.golongan_darah_id,
    ayah_nik: a.ayah_nik,
    ibu_nik: a.ibu_nik,
  }));

  const kepalaRow = anggotaRaw.find((a) => a.kk_level === 1) ?? null;
  const kepala = kepalaRow
    ? {
        nik: kepalaRow.nik,
        nama: kepalaRow.nama,
        hubungan_kk: kepalaRow.kk_level_ref?.nama ?? "Kepala Keluarga",
      }
    : null;

  return {
    kk: {
      no_kk: keluarga.no_kk,
      alamat: keluarga.alamat,
      dusun: keluarga.dusun,
      rw: keluarga.rw,
      rt: keluarga.rt,
      created_at: keluarga.created_at,
      updated_at: keluarga.updated_at,
    },
    statistik: {
      total: anggotaRaw.length,
      lakiLaki,
      perempuan,
    },
    kepala,
    anggota,
  };
}

// =====================================================================
// Daftar KK paginasi (untuk halaman /admin/kependudukan/kk).
// =====================================================================

export type DaftarKKArgs = {
  halaman?: number;
  perHalaman?: number;
  cari?: string;
  configId?: number;
};

export type BarisKK = {
  no_kk: string;
  alamat: string | null;
  dusun: string | null;
  rt: string | null;
  rw: string | null;
  jumlahAnggota: number;
  kepalaKeluarga: string | null;
};

export type DaftarKKResult = {
  baris: BarisKK[];
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
};

// =====================================================================
// Modul Kelompok.
// "Kelompok" di sini adalah pengelompokan warga berdasarkan salah satu
// dari 6 referensi demografis (pekerjaan, pendidikan, agama, status
// kawin, kewarganegaraan, golongan darah). Dipakai oleh halaman
// /admin/kelompok (tab navigasi) dan /admin/kelompok/[jenis]/[id]
// (detail per kelompok + daftar anggotanya).
// =====================================================================

export const JENIS_KELOMPOK = [
  "pekerjaan",
  "pendidikan",
  "agama",
  "status-kawin",
  "warganegara",
  "golongan-darah",
] as const;
export type JenisKelompok = (typeof JENIS_KELOMPOK)[number];

export const LABEL_JENIS_KELOMPOK: Record<JenisKelompok, string> = {
  pekerjaan: "Pekerjaan",
  pendidikan: "Pendidikan",
  agama: "Agama",
  "status-kawin": "Status Kawin",
  warganegara: "Kewarganegaraan",
  "golongan-darah": "Golongan Darah",
};

// Pemetaan JenisKelompok → (model Ref, field id di Penduduk, field nama di ref).
const PETA_JENIS = {
  pekerjaan: { idField: "pekerjaan_id" as const, label: "Pekerjaan" },
  pendidikan: { idField: "pendidikan_kk_id" as const, label: "Pendidikan" },
  agama: { idField: "agama_id" as const, label: "Agama" },
  "status-kawin": { idField: "status_kawin" as const, label: "Status Kawin" },
  warganegara: { idField: "warganegara_id" as const, label: "Kewarganegaraan" },
  "golongan-darah": { idField: "golongan_darah_id" as const, label: "Golongan Darah" },
};

async function ambilDaftarRef(jenis: JenisKelompok): Promise<Array<{ id: number; nama: string }>> {
  switch (jenis) {
    case "pekerjaan":
      return prisma.refPekerjaan.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
    case "pendidikan":
      return prisma.refPendidikan.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
    case "agama":
      return prisma.refAgama.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
    case "status-kawin":
      return prisma.refStatusKawin.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
    case "warganegara":
      return prisma.refWarganegara.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
    case "golongan-darah":
      return prisma.refGolonganDarah.findMany({
        orderBy: { nama: "asc" },
        select: { id: true, nama: true },
      });
  }
}

export type BarisKelompok = {
  id: number;
  nama: string;
  total: number;
  laki: number;
  perempuan: number;
  persen: number;
};

export type RekapKelompokResult = {
  jenis: JenisKelompok;
  label: string;
  totalPenduduk: number;
  baris: BarisKelompok[];
};

// Ambil rekap kelompok generik untuk satu jenis.
// Mengembalikan baris berisi: id kelompok, nama, total anggota + JK, persen.
export async function ambilRekapKelompok(jenis: JenisKelompok): Promise<RekapKelompokResult> {
  const peta = PETA_JENIS[jenis];
  const refs = await ambilDaftarRef(jenis);
  const totalPenduduk = await prisma.penduduk.count();

  const idField = peta.idField;

  const baris = await Promise.all(
    refs.map(async (r) => {
      const where = { [idField]: r.id };
      const [semua, laki, perempuan] = await Promise.all([
        prisma.penduduk.count({ where }),
        prisma.penduduk.count({ where: { ...where, sex: 1 } }),
        prisma.penduduk.count({ where: { ...where, sex: 2 } }),
      ]);
      return {
        id: r.id,
        nama: r.nama,
        total: semua,
        laki,
        perempuan,
        persen: totalPenduduk > 0 ? Number(((semua / totalPenduduk) * 100).toFixed(1)) : 0,
      };
    }),
  );

  return {
    jenis,
    label: peta.label,
    totalPenduduk,
    baris,
  };
}

export type InfoKelompok = {
  jenis: JenisKelompok;
  id: number;
  nama: string;
  total: number;
  laki: number;
  perempuan: number;
};

// Ambil info 1 kelompok (nama + komposisi). Return null jika id tidak ada.
export async function ambilInfoKelompok(
  jenis: JenisKelompok,
  id: number,
): Promise<InfoKelompok | null> {
  const refs = await ambilDaftarRef(jenis);
  const ref = refs.find((r) => r.id === id);
  if (!ref) return null;

  const where = { [PETA_JENIS[jenis].idField]: id };
  const [total, laki, perempuan] = await Promise.all([
    prisma.penduduk.count({ where }),
    prisma.penduduk.count({ where: { ...where, sex: 1 } }),
    prisma.penduduk.count({ where: { ...where, sex: 2 } }),
  ]);

  return { jenis, id, nama: ref.nama, total, laki, perempuan };
}

export type DaftarAnggotaKelompokArgs = {
  jenis: JenisKelompok;
  id: number;
  halaman?: number;
  perHalaman?: number;
};

export type BarisAnggotaKelompok = {
  id: number;
  nik: string;
  nama: string;
  sex: number | null;
  tempatlahir: string | null;
  tanggallahir: Date | null;
  no_kk: string | null;
  hubungan_kk: string | null;
};

export type DaftarAnggotaKelompokResult = {
  baris: BarisAnggotaKelompok[];
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
};

export async function ambilDaftarAnggotaKelompok(
  args: DaftarAnggotaKelompokArgs,
): Promise<DaftarAnggotaKelompokResult> {
  const halaman = Math.max(1, args.halaman ?? 1);
  const perHalaman = Math.min(100, Math.max(1, args.perHalaman ?? 20));
  const skip = (halaman - 1) * perHalaman;

  const idField = PETA_JENIS[args.jenis].idField;
  const where = { [idField]: args.id };

  const [total, data] = await Promise.all([
    prisma.penduduk.count({ where }),
    prisma.penduduk.findMany({
      where,
      skip,
      take: perHalaman,
      orderBy: [{ kk_level: "asc" }, { nama: "asc" }],
      include: { kk_level_ref: true },
    }),
  ]);

  const baris: BarisAnggotaKelompok[] = data.map((p) => ({
    id: p.id,
    nik: p.nik,
    nama: p.nama,
    sex: p.sex,
    tempatlahir: p.tempatlahir,
    tanggallahir: p.tanggallahir,
    no_kk: p.no_kk,
    hubungan_kk: p.kk_level_ref?.nama ?? null,
  }));

  return {
    baris,
    total,
    halaman,
    perHalaman,
    totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
  };
}
export async function ambilDaftarKK(
  args: DaftarKKArgs = {},
): Promise<DaftarKKResult> {
  const halaman = Math.max(1, args.halaman ?? 1);
  const perHalaman = Math.min(100, Math.max(1, args.perHalaman ?? 20));
  const skip = (halaman - 1) * perHalaman;
  const where: any = {};
  if (args.configId) where.config_id = args.configId;
  if (args.cari) {
    where.OR = [
      { no_kk: { contains: args.cari } },
      { alamat: { contains: args.cari } },
      { dusun: { contains: args.cari } },
      {
        anggota: {
          some: { nama: { contains: args.cari } },
        },
      },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.keluarga.count({ where }),
    prisma.keluarga.findMany({
      where,
      skip,
      take: perHalaman,
      orderBy: { no_kk: "asc" },
      include: {
        anggota: {
          where: { kk_level: 1 },
          take: 1,
          select: { nama: true },
        },
        _count: { select: { anggota: true } },
      },
    }),
  ]);

  const baris: BarisKK[] = data.map((k) => ({
    no_kk: k.no_kk,
    alamat: k.alamat,
    dusun: k.dusun,
    rt: k.rt,
    rw: k.rw,
    jumlahAnggota: k._count.anggota,
    kepalaKeluarga: k.anggota[0]?.nama ?? null,
  }));

  return {
    baris,
    total,
    halaman,
    perHalaman,
    totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
  };
}