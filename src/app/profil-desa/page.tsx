import { ambilConfig } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil Desa",
  description: "Identitas, wilayah, sejarah, dan visi-misi desa.",
};

export default async function ProfilDesaPage() {
  const config = await ambilConfig();

  const stats = [
    { label: "Luas Wilayah", value: config?.path ? "Lihat Peta" : "—", hint: "Batas administratif via peta" },
    { label: "Kecamatan", value: config?.nama_kecamatan ?? "—", hint: config?.kode_kecamatan ? `Kode ${config.kode_kecamatan}` : "" },
    { label: "Kabupaten", value: config?.nama_kabupaten ?? "—", hint: config?.kode_kabupaten ? `Kode ${config.kode_kabupaten}` : "" },
    { label: "Provinsi", value: config?.nama_propinsi ?? "—", hint: config?.kode_propinsi ? `Kode ${config.kode_propinsi}` : "" },
  ];

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="mb-12 border-b border-ink/15 pb-8">
        <p className="meta mb-3">Tentang Desa</p>
        <h1 className="font-serif text-display-md leading-tight">
          Profil {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-4 max-w-prose text-ink-muted">
          Informasi dasar identitas desa, wilayah administratif, sejarah singkat,
          dan arah kebijakan yang diemban Pemerintah Desa.
        </p>
      </header>

      <section id="identitas" className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-serif text-headline mb-4">Identitas Desa</h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              ["Nama Desa", config?.nama_desa],
              ["Kode Desa", config?.kode_desa],
              ["Kode Desa BPS", config?.kode_desa_bps],
              ["Kode Pos", config?.kode_pos],
              ["Alamat Kantor", config?.alamat_kantor ?? config?.alamat],
              ["Telepon", config?.telepon],
              ["Email", config?.email],
              ["Website", config?.website],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-ink/10 pb-2">
                <dt className="meta">{k}</dt>
                <dd className="mt-1 text-sm">{v ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside id="wilayah" className="lg:col-span-5">
          <h2 className="font-serif text-headline mb-4">Wilayah Administratif</h2>
          <ul className="space-y-3 text-sm">
            {stats.map((s) => (
              <li key={s.label} className="border-b border-ink/10 pb-2">
                <p className="meta">{s.label}</p>
                <p className="mt-1 font-medium">{s.value}</p>
                {s.hint ? <p className="mt-0.5 text-xs text-ink-muted">{s.hint}</p> : null}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section id="sejarah" className="mt-16 border-t border-ink/15 pt-10">
        <h2 className="font-serif text-headline mb-4">Sejarah Desa</h2>
        <div className="prose max-w-prose">
          <p>
            Narasi sejarah desa akan ditampilkan pada bagian ini. Pada OpenSID
            asli, modul ini dipanggil dari menu <em>Profil Desa</em> dan dapat
            diedit melalui halaman administrasi <em>Info Desa</em>.
          </p>
        </div>
      </section>

      <section id="visi-misi" className="mt-16 border-t border-ink/15 pt-10">
        <h2 className="font-serif text-headline mb-4">Visi & Misi</h2>
        <div className="prose max-w-prose">
          <p>
            Visi dan misi Pemerintah Desa akan dimuat di sini. Konten dapat
            bersumber dari <code>profil_desa</code> (key-value) di database.
          </p>
        </div>
      </section>
    </div>
  );
}