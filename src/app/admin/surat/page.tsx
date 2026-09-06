// Halaman ringkasan modul Surat Menyurat.
// Menampilkan statistik singkat dan pintasan ke sub-modul:
//   Template, Arsip Cetak, Permohonan, Dokumen.

import Link from "next/link";
import { ambilRingkasanSurat } from "@/modules/surat";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminSuratPage() {
  const r = await ambilRingkasanSurat();

  const kartu = [
    { label: "Template Aktif", nilai: r.totalFormat, href: "/admin/surat/format", deskripsi: "Daftar format surat" },
    { label: "Arsip Cetak", nilai: r.totalLog, href: "/admin/surat/arsip", deskripsi: `${r.logKonsep} konsep, ${r.logCetak} cetak` },
    { label: "Permohonan", nilai: r.totalPermohonan, href: "/admin/surat/permohonan", deskripsi: `${r.permohonanSelesai} selesai diproses` },
    { label: "Dokumen", nilai: r.totalDokumen, href: "/admin/surat/dokumen", deskripsi: "Lampiran & syarat aktif" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="meta mb-2">Surat Menyurat</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Ringkasan Surat
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Modul ini mengelola template surat, arsip cetak, permohonan Layanan
          Mandiri, dan dokumen/lampiran warga. Statistik di bawah mengikuti
          desa aktif saat ini.
        </p>
      </header>

      <section aria-labelledby="stat-heading">
        <h3 id="stat-heading" className="meta mb-3">
          Statistik singkat
        </h3>
        <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
          {kartu.map((k) => (
            <div key={k.label} className="bg-paper px-5 py-5">
              <dt className="meta">{k.label}</dt>
              <dd className="mt-2 font-serif text-3xl tabular-nums">
                {k.nilai.toLocaleString("id-ID")}
              </dd>
              <p className="meta mt-2 text-2xs normal-case tracking-normal">
                {k.deskripsi}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="pintasan-heading">
        <h3 id="pintasan-heading" className="meta mb-3">
          Pintasan modul
        </h3>
        <ul className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {kartu.map((k) => (
            <li key={k.href} className="bg-paper">
              <Link
                href={k.href}
                className="group flex h-full flex-col px-5 py-6 transition-colors hover:bg-paper-dim"
              >
                <h4 className="font-serif text-xl">{k.label}</h4>
                <p className="meta mt-1 text-2xs normal-case tracking-normal">
                  {k.nilai.toLocaleString("id-ID")} entri
                </p>
                <p className="mt-2 text-sm text-ink-muted">{k.deskripsi}</p>
              </Link>
            </li>
          ))}
          <li className="bg-paper">
            <Link
              href="/admin/surat/format#ref-syarat"
              className="group flex h-full flex-col px-5 py-6 transition-colors hover:bg-paper-dim"
            >
              <h4 className="font-serif text-xl">Referensi Syarat</h4>
              <p className="meta mt-1 text-2xs normal-case tracking-normal">
                {r.totalSyarat} jenis syarat
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Dipakai oleh template surat (M:N via JSON).
              </p>
            </Link>
          </li>
        </ul>
      </section>

      <p className="meta text-2xs">
        © {new Date().getFullYear()} · Modul Surat Menyurat v0.1
      </p>
    </div>
  );
}