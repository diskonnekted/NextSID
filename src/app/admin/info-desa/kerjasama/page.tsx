// Halaman Pendaftaran Kerjasama — mitra desa.

import { ambilDaftarKerjasama } from "@/modules/info-desa";
import PanelKerjasama from "./_panel";

export const dynamic = "force-dynamic";

export default async function AdminKerjasamaPage() {
  const daftar = await ambilDaftarKerjasama();
  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Kerjasama</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Pendaftaran Kerjasama
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Catat mitra kerjasama desa: instansi pemerintah, swasta, LSM,
          atau komunitas. Periode & nomor kontrak dicatat untuk arsip.
        </p>
      </header>
      <PanelKerjasama daftarAwal={daftar} />
    </div>
  );
}
