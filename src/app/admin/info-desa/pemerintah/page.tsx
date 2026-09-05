// Halaman Pemerintah Desa — Jabatan + Pamong.
// 2 tabel + form tambah untuk masing-masing.

import { ambilDaftarJabatan, ambilDaftarPamong } from "@/modules/info-desa";
import PanelPemerintah from "./_panel";

export const dynamic = "force-dynamic";

export default async function AdminPemerintahPage() {
  const [jabatan, pamongRaw] = await Promise.all([
    ambilDaftarJabatan(),
    ambilDaftarPamong(),
  ]);

  // Serialize Date → string ISO agar bisa di-pass ke client component.
  const pamong = pamongRaw.map((p) => ({
    ...p,
    tanggallahir: p.tanggallahir ? p.tanggallahir.toISOString() : null,
  }));

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Pemerintah</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Pemerintah Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Kelola jabatan (mis. Kepala Desa, Sekretaris, Kaur) lalu tautkan
          ke perangkat desa (Pamong). Data dipakai saat cetak surat resmi
          dan tanda tangan dokumen.
        </p>
      </header>

      <PanelPemerintah jabatan={jabatan} pamong={pamong} />
    </div>
  );
}
