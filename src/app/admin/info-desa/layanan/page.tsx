// Halaman Layanan Pelanggan — kanal pengaduan & informasi.

import { ambilDaftarLayanan } from "@/modules/info-desa";
import PanelLayanan from "./_panel";

export const dynamic = "force-dynamic";

export default async function AdminLayananPage() {
  const daftar = await ambilDaftarLayanan();
  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Layanan</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Layanan Pelanggan
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar kanal komunikasi yang bisa dipakai warga untuk aduan,
          konsultasi, atau permintaan informasi.
        </p>
      </header>
      <PanelLayanan daftarAwal={daftar} />
    </div>
  );
}
