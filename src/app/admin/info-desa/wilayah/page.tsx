// Halaman Wilayah Administratif.
// Menampilkan pohon Dusun → RW → RT.
// Tambah dusun / RW / RT via form ringkas; hapus per-baris.

import { ambilDaftarPenduduk } from "@/modules/kependudukan";
import { ambilPohonWilayah, ambilDaftarWilayahRingkas } from "@/modules/info-desa";
import PanelWilayah from "./_panel";

export const dynamic = "force-dynamic";

export default async function AdminWilayahPage() {
  const [pohon, ringkas, daftarPenduduk] = await Promise.all([
    ambilPohonWilayah(),
    ambilDaftarWilayahRingkas(),
    // Daftar kepala (penduduk aktif) untuk dipilih sebagai id_kepala.
    ambilDaftarPenduduk({ halaman: 1, perHalaman: 200 }),
  ]);

  // Hitung ringkasan: jumlah dusun, RW, RT.
  let totalDusun = pohon.length;
  let totalRW = 0;
  let totalRT = 0;
  for (const d of pohon) {
    totalRW += d.rw.length;
    for (const r of d.rw) totalRT += r.rt.length;
  }

  // Map id_penduduk → nama untuk lookup kepala wilayah.
  const kepalaById = new Map<number, string>();
  for (const p of daftarPenduduk.baris) {
    kepalaById.set(p.id, p.nama);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Wilayah</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Wilayah Administratif
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Susun hierarki Dusun → RW → RT. Setiap baris bisa di tautkan ke
          seorang kepala wilayah. Penomoran mengikuti konvensi OpenSID:
          baris dusun memiliki <code>RT=0 & RW=0</code>.
        </p>
      </header>

      <dl className="grid grid-cols-3 gap-px border border-ink/10 bg-ink/10">
        <div className="bg-paper px-5 py-4">
          <dt className="meta">Dusun</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums">{totalDusun}</dd>
        </div>
        <div className="bg-paper px-5 py-4">
          <dt className="meta">RW</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums">{totalRW}</dd>
        </div>
        <div className="bg-paper px-5 py-4">
          <dt className="meta">RT</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums">{totalRT}</dd>
        </div>
      </dl>

      <PanelWilayah
        pohon={pohon}
        ringkas={ringkas}
        kepalaById={Object.fromEntries(kepalaById) as Record<number, string>}
      />
    </div>
  );
}
