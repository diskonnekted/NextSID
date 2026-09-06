// Halaman Konfigurasi Desa.
// Mengelola: tema (warna/border), app_key, setting key-value, logo desa.

import {
  ambilKonfigurasi,
  ambilSemuaSetting,
} from "@/modules/konfigurasi";
import FormKonfigurasi from "./_form";
import UploadLogo from "./_logo-upload";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminKonfigurasiPage() {
  const [cfg, settings] = await Promise.all([
    ambilKonfigurasi(),
    ambilSemuaSetting(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Pengaturan · Konfigurasi</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Konfigurasi Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Atur logo, warna tema, dan parameter global aplikasi. Perubahan
          langsung diterapkan ke situs publik dan modul internal.
        </p>
      </header>

      <UploadLogo
        logo={cfg.logo}
        kantor={cfg.kantor_desa}
        hero={cfg.hero_banner}
      />

      <FormKonfigurasi
        nilaiAwal={{
          warna: cfg.warna,
          border: cfg.border,
          app_key: cfg.app_key,
        }}
        settings={settings}
      />
    </div>
  );
}