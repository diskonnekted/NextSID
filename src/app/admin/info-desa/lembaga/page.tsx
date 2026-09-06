// Halaman Lembaga Desa — CRUD sederhana.

import { ambilDaftarLembaga } from "@/modules/info-desa";
import PanelLembaga from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminLembagaPage() {
  const daftar = await ambilDaftarLembaga();
  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Lembaga</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Lembaga Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Catat lembaga masyarakat (BPD, LPM, PKK, RT/RW, Karang Taruna,
          dan lain-lain) berikut ketua & sekretarisnya.
        </p>
      </header>
      <PanelLembaga daftarAwal={daftar} />
    </div>
  );
}
