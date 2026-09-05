const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  const a = await p.artikel.findMany({
    where: { enabled: 1 },
    select: { id: true, slug: true, judul: true },
    take: 5,
    orderBy: { id: "asc" },
  });
  const l = await p.lembaga.findMany({
    where: { enabled: 1 },
    select: { id: true, nama: true },
    take: 5,
  });
  const lp = await p.layananPelanggan.findMany({
    where: { enabled: 1 },
    select: { id: true, nama: true },
    take: 5,
  });
  const pam = await p.pamong.findMany({
    where: { pamong_status: 1 },
    select: { id: true, pamong_nama: true },
    take: 5,
  });
  const k = await p.kategori.findMany({
    where: { enabled: 1 },
    select: { id: true, kategori: true, slug: true },
  });
  console.log("Artikel:", JSON.stringify(a, null, 2));
  console.log("Lembaga:", JSON.stringify(l, null, 2));
  console.log("Layanan:", JSON.stringify(lp, null, 2));
  console.log("Pamong:", JSON.stringify(pam, null, 2));
  console.log("Kategori:", JSON.stringify(k, null, 2));
  await p.$disconnect();
})();