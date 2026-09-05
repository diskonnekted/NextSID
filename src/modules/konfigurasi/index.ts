// Module konfigurasi.
// Backend untuk halaman Konfigurasi Desa:
// - Tema & border warna, app_key
// - Setting key-value global
// - Upload / hapus logo desa & foto kantor desa

import { prisma } from "@/lib/prisma";

// =====================================================================
// Konfigurasi utama (model Config)
// =====================================================================

export type KonfigurasiUmum = {
  warna: string;
  border: string;
  app_key: string;
  logo: string;
  kantor_desa: string;
  hero_banner: string;
};

export async function ambilKonfigurasi(): Promise<KonfigurasiUmum> {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  return {
    warna: cfg?.warna ?? "",
    border: cfg?.border ?? "",
    app_key: cfg?.app_key ?? "",
    logo: cfg?.logo ?? "",
    kantor_desa: cfg?.kantor_desa ?? "",
    hero_banner: cfg?.hero_banner ?? "",
  };
}

export type SimpanKonfigurasiArgs = {
  warna?: string;
  border?: string;
  app_key?: string;
};

export async function simpanKonfigurasi(args: SimpanKonfigurasiArgs) {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  const data: Record<string, string | null> = {};
  if (args.warna !== undefined) data.warna = args.warna || null;
  if (args.border !== undefined) data.border = args.border || null;
  if (args.app_key !== undefined) data.app_key = args.app_key || null;
  if (!cfg) {
    return prisma.config.create({
      data: { nama_desa: "Desa", ...data },
    });
  }
  return prisma.config.update({
    where: { id: cfg.id },
    data,
  });
}

export async function simpanLogo(pathPublik: string) {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) {
    return prisma.config.create({
      data: { nama_desa: "Desa", logo: pathPublik },
    });
  }
  return prisma.config.update({
    where: { id: cfg.id },
    data: { logo: pathPublik },
  });
}

export async function hapusLogo() {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) return;
  await prisma.config.update({
    where: { id: cfg.id },
    data: { logo: null },
  });
}

export async function simpanFotoKantor(pathPublik: string) {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) {
    return prisma.config.create({
      data: { nama_desa: "Desa", kantor_desa: pathPublik },
    });
  }
  return prisma.config.update({
    where: { id: cfg.id },
    data: { kantor_desa: pathPublik },
  });
}

export async function simpanHeroBanner(pathPublik: string) {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) {
    return prisma.config.create({
      data: { nama_desa: "Desa", hero_banner: pathPublik },
    });
  }
  return prisma.config.update({
    where: { id: cfg.id },
    data: { hero_banner: pathPublik },
  });
}

export async function hapusHeroBanner() {
  const cfg = await prisma.config.findFirst({ orderBy: { id: "asc" } });
  if (!cfg) return;
  await prisma.config.update({
    where: { id: cfg.id },
    data: { hero_banner: null },
  });
}

// =====================================================================
// Setting key-value
// =====================================================================

export type Setting = {
  id: number;
  key: string;
  value: string;
};

export async function ambilSemuaSetting(): Promise<Setting[]> {
  const rows = await prisma.setting.findMany({ orderBy: { key: "asc" } });
  return rows.map((r) => ({ id: r.id, key: r.key, value: r.value }));
}

export async function simpanSetting(key: string, value: string) {
  if (!key) return;
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function simpanBanyakSetting(items: Array<{ key: string; value: string }>) {
  for (const it of items) {
    if (!it.key) continue;
    await prisma.setting.upsert({
      where: { key: it.key },
      update: { value: it.value },
      create: { key: it.key, value: it.value },
    });
  }
}

export async function hapusSetting(key: string) {
  if (!key) return;
  try {
    await prisma.setting.delete({ where: { key } });
  } catch {
    // ignore jika tidak ada
  }
}