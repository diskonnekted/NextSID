// Halaman Status Desa — Profil Desa (key-value).
// Tiga kategori: ekologi, internet, adat.

import { ambilProfilDesa, PROFIL_PRESET } from "@/modules/info-desa";
import PanelStatus from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminStatusPage() {
  const ada = await ambilProfilDesa();
  const nilai = new Map<string, string>();
  for (const r of ada) nilai.set(r.key, r.value);

  // Bentuk daftar field: preset + (jika ada) item non-preset.
  const presetKeys = new Set(PROFIL_PRESET.map((p) => p.key));
  const tambahan = ada
    .filter((r) => !presetKeys.has(r.key))
    .map((r) => ({ key: r.key, judul: r.judul, kategori: r.kategori }));

  const semuaField = [
    ...PROFIL_PRESET,
    ...tambahan,
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Status</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Status Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Profil desa mengikuti model OpenSID: data ekologi (jenis tanah,
          topografi, rawan bencana), infrastruktur internet, dan adat istiadat.
        </p>
      </header>

      <PanelStatus
        items={semuaField.map((f) => ({
          key: f.key,
          judul: f.judul,
          kategori: f.kategori,
          value: nilai.get(f.key) ?? "",
        }))}
      />
    </div>
  );
}
