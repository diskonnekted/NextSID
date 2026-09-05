// Theme "esensi" — partial footer.
// Override default footer dengan menambahkan blok ThemeSwitcher di
// kolom kanan, sehingga user bisa ganti tema & mode tanpa harus
// lewat Dasbor. Gaya editorial tetap dijaga (meta uppercase + rule
// line + tipografi serif untuk judul).

import Link from "next/link";
import { ambilConfig, ambilMediaSosial } from "@/lib/queries";
import ThemeSwitcher from "@/components/frontend/ThemeSwitcher";

export async function Footer() {
  const config = await ambilConfig();
  const sosmed = await ambilMediaSosial();

  return (
    <footer data-chrome="public" className="mt-24 border-t border-ink/15 bg-paper-dim/40">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="meta mb-3">Sistem Informasi Desa</p>
          <h2 className="font-serif text-headline leading-tight">
            {config?.nama_desa ?? "Desa"}
          </h2>
          {config?.alamat ? (
            <p className="mt-4 max-w-prose text-sm text-ink-muted">{config.alamat}</p>
          ) : null}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {config?.nama_kecamatan ? (
              <>
                <dt className="meta">Kecamatan</dt>
                <dd>{config.nama_kecamatan}</dd>
              </>
            ) : null}
            {config?.nama_kabupaten ? (
              <>
                <dt className="meta">Kabupaten</dt>
                <dd>{config.nama_kabupaten}</dd>
              </>
            ) : null}
            {config?.nama_propinsi ? (
              <>
                <dt className="meta">Provinsi</dt>
                <dd>{config.nama_propinsi}</dd>
              </>
            ) : null}
            {config?.telepon ? (
              <>
                <dt className="meta">Telepon</dt>
                <dd>{config.telepon}</dd>
              </>
            ) : null}
          </dl>
        </div>

        <div className="lg:col-span-3">
          <p className="meta mb-4">Navigasi</p>
          <ul className="space-y-2">
            <li><Link href="/profil-desa" className="link-clay">Profil Desa</Link></li>
            <li><Link href="/pemerintahan" className="link-clay">Pemerintahan</Link></li>
            <li><Link href="/data-statistik" className="link-clay">Data Statistik</Link></li>
            <li><Link href="/direktori" className="link-clay">Direktori</Link></li>
            <li><Link href="/galeri" className="link-clay">Galeri</Link></li>
            <li><Link href="/surat-mandiri" className="link-clay">Surat Mandiri</Link></li>
            <li><Link href="/artikel" className="link-clay">Daftar Artikel</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="meta mb-4">Media Sosial</p>
          {sosmed.length === 0 ? (
            <p className="text-sm text-ink-muted">Belum ada tautan media sosial.</p>
          ) : (
            <ul className="space-y-2">
              {sosmed.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-clay"
                  >
                    {s.nama}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 border-t border-ink/15 pt-6">
            <p className="meta">Tampilan</p>
            <p className="mt-2 text-xs text-ink-muted">
              Pilih tema & mode tampilan sesuai preferensi Anda.
            </p>
            <div className="mt-3">
              <ThemeSwitcher />
            </div>
          </div>

          <div className="mt-10 border-t border-ink/15 pt-6">
            <p className="meta">Hak Cipta</p>
            <p className="mt-2 text-xs text-ink-muted">
              Konten diterbitkan oleh Pemerintah {config?.nama_desa ?? "Desa"}. Konten dapat
              disitasi dengan menyebutkan sumber.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;