// Halaman detail Direktori ala TownPress — single listing page.
// 3 jenis sumber: lembaga, layanan, pamong.

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ambilDetailPamong,
  ambilDaftarLembaga,
  ambilDaftarLayanan,
} from "@/modules/info-desa";
import { ambilConfig } from "@/lib/queries";
import {
  filterDirektori,
  hitungKategori,
  ambilDirektori,
} from "@/modules/direktori";
import { DirektoriCard } from "@/components/frontend/DirektoriCard";

export const dynamic = "force-dynamic";

function keSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function judulJenis(j: string): string {
  if (j === "lembaga") return "Lembaga Desa";
  if (j === "layanan") return "Layanan Publik";
  if (j === "pamong") return "Perangkat Desa";
  return "Direktori";
}

export default async function DirektoriDetailPage({
  params,
}: {
  params: Promise<{ jenis: string; slug: string }>;
}) {
  const { jenis, slug } = await params;
  if (!["lembaga", "layanan", "pamong"].includes(jenis)) notFound();

  const config = await ambilConfig();

  // Cari entri: lembaga pakai slug=keSlug(nama); pamong & layanan juga.
  let entri: {
    judul: string;
    kategori: string;
    alamat?: string | null;
    kontak?: string | null;
    catatan?: Array<[string, string]>;
  } | null = null;

  if (jenis === "lembaga") {
    const daftar = await ambilDaftarLembaga();
    const row = daftar.find((l) => (keSlug(l.nama) || `lembaga-${l.id}`) === slug);
    if (row) {
      entri = {
        judul: row.nama,
        kategori: row.singkatan ?? "Lembaga",
        alamat: row.alamat ?? null,
        kontak: [row.ketua, row.sekretaris].filter(Boolean).join(" · "),
        catatan: [
          ["Singkatan", row.singkatan ?? "—"],
          ["Ketua", row.ketua ?? "—"],
          ["Sekretaris", row.sekretaris ?? "—"],
          ["Keterangan", row.keterangan ?? "—"],
        ],
      };
    }
  } else if (jenis === "layanan") {
    const daftar = await ambilDaftarLayanan();
    const row = daftar.find((y) => (keSlug(y.nama) || `layanan-${y.id}`) === slug);
    if (row) {
      entri = {
        judul: row.nama,
        kategori: row.kategori ?? "Layanan",
        kontak: row.kontak ?? null,
        alamat: row.keterangan ?? null,
        catatan: [
          ["Kategori", row.kategori ?? "—"],
          ["Kontak", row.kontak ?? "—"],
          ["Tautan", row.url_form ?? "—"],
          ["Keterangan", row.keterangan ?? "—"],
        ],
      };
    }
  } else if (jenis === "pamong") {
    // Cari by slug di antara pamong (id-based).
    const idNum = parseInt(slug.replace(/^pamong-/, ""), 10);
    if (!isNaN(idNum)) {
      const detail = await ambilDetailPamong(idNum);
      if (detail) {
        const jabatanNama = detail.jabatan?.nama ?? null;
        entri = {
          judul: detail.pamong_nama,
          kategori: jabatanNama ?? "Perangkat Desa",
          kontak: [detail.gelar_depan, detail.pamong_nama, detail.gelar_belakang]
            .filter(Boolean)
            .join(" "),
          catatan: [
            ["Jabatan", jabatanNama ?? "—"],
            ["NIK", detail.pamong_nik ?? "—"],
            ["NIAP", detail.pamong_niap ?? "—"],
            ["Tempat, Tanggal Lahir", `${detail.tempatlahir ?? "—"}, ${detail.tanggallahir ? new Intl.DateTimeFormat("id-ID").format(new Date(detail.tanggallahir)) : "—"}`],
            ["Status", detail.pamong_status === 1 ? "Aktif" : "Tidak Aktif"],
            ["No. HP", detail.no_hp ?? "—"],
          ],
        };
      }
    }
  }

  if (!entri) notFound();

  // Listing terkait: ambil semua, filter jenis sama, drop item ini.
  const semua = await ambilDirektori();
  const terkait = filterDirektori(semua, jenis as any).filter(
    (i) => i.slug !== slug,
  ).slice(0, 3);
  const kat = hitungKategori(semua);

  return (
    <div className="container-page py-12 lg:py-16">
      {/* Breadcrumb ala TownPress */}
      <nav aria-label="breadcrumb" className="meta mb-6 flex flex-wrap items-center gap-2">
        <Link href="/direktori" className="hover:text-clay">
          Direktori
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/direktori?kategori=${jenis}`}
          className="hover:text-clay"
        >
          {judulJenis(jenis)}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{entri.judul}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Kolom utama: judul + data detail ala TownPress single page */}
        <article className="min-w-0 lg:col-span-8">
          <p className="meta mb-2">{entri.kategori}</p>
          <h1 className="font-serif text-display-sm leading-tight lg:text-display-md">
            {entri.judul}
          </h1>

          {entri.alamat ? (
            <p className="meta mt-4">📍 {entri.alamat}</p>
          ) : null}
          {entri.kontak ? (
            <p className="meta mt-1">☎ {entri.kontak}</p>
          ) : null}

          {/* Plate info ala TownPress: tabel informasi detail */}
          <section className="mt-10 border-t border-ink/15 pt-6">
            <h2 className="meta mb-4">Informasi</h2>
            <dl className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2">
              {entri.catatan?.map(([k, v]) => (
                <div key={k} className="bg-paper px-4 py-3">
                  <dt className="meta">{k}</dt>
                  <dd className="mt-1 text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Keterangan singkat */}
          <section className="mt-10">
            <h2 className="meta mb-3">Tentang entri ini</h2>
            <p className="max-w-prose text-ink-soft">
              Entri ini bagian dari direktori{" "}
              {config?.nama_desa ?? "Desa"}. Diperbarui melalui dasbor admin
              modul Info Desa. Untuk perubahan data, hubungi operator desa.
            </p>
          </section>
        </article>

        {/* Sidebar: kategori + entri terkait ala TownPress right sidebar */}
        <aside className="min-w-0 space-y-10 lg:col-span-4">
          <section aria-labelledby="kat-heading">
            <h2 id="kat-heading" className="meta mb-3">
              Kategori
            </h2>
            <ul className="space-y-2 text-sm">
              {kat.map((k) => (
                <li key={k.key} className="flex items-baseline justify-between border-b border-ink/10 py-2">
                  <Link
                    href={`/direktori${k.key === "semua" ? "" : `?kategori=${k.key}`}`}
                    className={[
                      "hover:text-clay",
                      k.key === jenis ? "font-medium text-ink" : "text-ink-muted",
                    ].join(" ")}
                  >
                    {k.label}
                  </Link>
                  <span className="meta">{k.jumlah}</span>
                </li>
              ))}
            </ul>
          </section>

          {terkait.length > 0 ? (
            <section aria-labelledby="terkait-heading">
              <h2 id="terkait-heading" className="meta mb-3">
                Entri terkait
              </h2>
              <div>
                {terkait.map((item) => (
                  <DirektoriCard key={item.id} item={item} varian="ringkas" />
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
