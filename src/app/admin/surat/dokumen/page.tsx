// Halaman Dokumen (lampiran/syarat).
// CRUD untuk tabel Dokumen dengan soft-delete (kolom deleted=0/1).
// Tipe kategori:
//   1 = Informasi Publik
//   2 = Dokumen Desa
//   3 = Surat Masuk/Keluar

import { ambilDaftarDokumen } from "@/modules/surat";
import { ambilDaftarPenduduk } from "@/modules/kependudukan";
import { ambilDaftarSyarat } from "@/modules/surat";
import PanelDokumen from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

const KATEGORI = {
  1: "Informasi Publik",
  2: "Dokumen Desa",
  3: "Surat",
};

export default async function AdminDokumenPage() {
  const [dokRaw, syarat, pendudukRes] = await Promise.all([
    ambilDaftarDokumen(),
    ambilDaftarSyarat(),
    ambilDaftarPenduduk({ perHalaman: 200 }).catch(() => ({ baris: [] as any[] })),
  ]);

  const items = dokRaw.map((d) => ({
    id: d.id,
    nama: d.nama,
    kategori: d.kategori,
    kategori_label: KATEGORI[d.kategori as keyof typeof KATEGORI] ?? String(d.kategori),
    id_pend: d.id_pend,
    id_syarat: d.id_syarat,
    enabled: d.enabled,
    satuan: d.satuan ?? "",
    lokasi_arsip: d.lokasi_arsip ?? "",
    tipe: d.tipe ?? "",
    url: d.url ?? "",
    tahun: d.tahun ?? "",
    tgl_upload: (d.tgl_upload ?? new Date()).toISOString().slice(0, 10),
    dok_warga: d.dok_warga,
  }));

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Surat Menyurat · Dokumen</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Dokumen / Lampiran
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Arsip dokumen desa: informasi publik, dokumen internal, atau
          lampiran/syarat yang terkait dengan surat warga. Soft-delete
          (kolom <code>deleted</code>) sehingga data tetap ada untuk audit.
        </p>
      </header>

      <PanelDokumen
        items={items}
        syarat={syarat.map((s) => ({ id: s.id, nama: s.ref_syarat_nama }))}
        penduduk={(pendudukRes.baris ?? []).map((p) => ({
          id: p.id,
          label: `${p.nama} · ${p.nik}`,
        }))}
        kategoriMap={KATEGORI}
      />
    </div>
  );
}