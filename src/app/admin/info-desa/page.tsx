// Landing Info Desa — daftar sub-modul + ringkasan status.
// Memudahkan operator desa tahu modul mana yang masih kosong.

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";
export const revalidate = 60;

const subModul = [
  {
    href: "/admin/info-desa/identitas",
    label: "Identitas Desa",
    deskripsi: "Nama desa, kode wilayah, alamat kantor, kontak, peta.",
    rintisan: false,
  },
  {
    href: "/admin/info-desa/wilayah",
    label: "Wilayah Administratif",
    deskripsi: "Pohon Dusun → RW → RT beserta kepala wilayah.",
    rintisan: false,
  },
  {
    href: "/admin/info-desa/pemerintah",
    label: "Pemerintah Desa",
    deskripsi: "Daftar jabatan & perangkat (kepala desa, sekretaris, dst.).",
    rintisan: false,
  },
  {
    href: "/admin/info-desa/status",
    label: "Status Desa",
    deskripsi: "Profil desa: ekologi, internet, adat, kearifan lokal.",
    rintisan: false,
  },
  {
    href: "/admin/info-desa/lembaga",
    label: "Lembaga Desa",
    deskripsi: "BPD, LPM, PKK, RT/RW, dan lembaga masyarakat lain.",
    rintisan: true,
  },
  {
    href: "/admin/info-desa/layanan",
    label: "Layanan Pelanggan",
    deskripsi: "Kanal pengaduan, hotline, tautan formulir eksternal.",
    rintisan: true,
  },
  {
    href: "/admin/info-desa/kerjasama",
    label: "Pendaftaran Kerjasama",
    deskripsi: "Mitra desa (pemerintah, swasta, komunitas).",
    rintisan: true,
  },
] as const;

export default async function AdminInfoDesaPage() {
  // Ringkasan: jumlah baris di tiap tabel modul.
  const [identitas, jumlahWilayah, jumlahPamong, jumlahLembaga, jumlahLayanan, jumlahKerjasama] =
    await Promise.all([
      prisma.config.findFirst({ orderBy: { id: "asc" } }),
      prisma.wilayah.count(),
      prisma.pamong.count(),
      prisma.lembaga.count(),
      prisma.layananPelanggan.count(),
      prisma.kerjasama.count(),
    ]);

  return (
    <div className="space-y-10">
      <header>
        <p className="meta mb-2">Modul</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Info Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Isi identitas desa, struktur wilayah, pemerintah, lembaga, dan
          layanan. Data ini menjadi fondasi modul lain (mis. Cetak Surat
          menggunakan nama & kode desa).
        </p>
      </header>

      {/* Kartu ringkasan status */}
      <section aria-labelledby="status-heading">
        <h3 id="status-heading" className="meta mb-3">
          Status modul
        </h3>
        <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-3">
          {[
            {
              label: "Identitas Desa",
              value: identitas?.nama_desa ? "Terisi" : "Kosong",
              ok: !!identitas?.nama_desa,
            },
            { label: "Wilayah (Dusun/RW/RT)", value: `${jumlahWilayah} baris`, ok: jumlahWilayah > 0 },
            { label: "Perangkat Desa", value: `${jumlahPamong} orang`, ok: jumlahPamong > 0 },
            { label: "Lembaga", value: `${jumlahLembaga} entri`, ok: jumlahLembaga > 0 },
            { label: "Layanan Pelanggan", value: `${jumlahLayanan} entri`, ok: jumlahLayanan > 0 },
            { label: "Kerjasama", value: `${jumlahKerjasama} entri`, ok: jumlahKerjasama > 0 },
          ].map((c) => (
            <div key={c.label} className="bg-paper px-5 py-5">
              <dt className="meta">{c.label}</dt>
              <dd
                className={[
                  "mt-2 font-serif text-xl",
                  c.ok ? "text-ink" : "text-clay",
                ].join(" ")}
              >
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Daftar sub-modul */}
      <section aria-labelledby="sub-heading">
        <h3 id="sub-heading" className="meta mb-3">
          Sub-modul
        </h3>
        <ul className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {subModul.map((m) => (
            <li key={m.href} className="bg-paper">
              <Link
                href={m.href}
                className="group flex h-full flex-col px-5 py-6 transition-colors hover:bg-paper-dim"
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-xl">{m.label}</h4>
                  {m.rintisan && (
                    <span className="meta inline-block border border-ink/20 px-1.5 py-0.5 text-2xs normal-case tracking-normal">
                      Rintisan
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-ink-muted">{m.deskripsi}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
