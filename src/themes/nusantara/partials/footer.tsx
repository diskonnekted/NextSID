// Theme "nusantara" — partial footer.
// Solid background tanpa gradient dekoratif. Pemakai garis tipis sebagai
// pemisah, warna kertas untuk kontras yang memadai di mode gelap.

import Link from "next/link";
import { ambilConfig, ambilMediaSosial } from "@/lib/queries";
import ThemeSwitcher from "@/components/frontend/ThemeSwitcher";

export async function Footer() {
  const config = await ambilConfig();
  const sosmed = await ambilMediaSosial();

  return (
    <footer
      data-chrome="public"
      className="mt-24 bg-ink text-paper"
    >
      <div className="container-page grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="meta mb-3 text-clay">Sistem Informasi Desa</p>
          <h2 className="font-serif text-headline leading-tight text-paper">
            {config?.nama_desa ?? "Desa"}
          </h2>
          {config?.alamat ? (
            <p className="mt-4 max-w-prose text-sm text-paper/75">{config.alamat}</p>
          ) : null}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-paper/85">
            {config?.nama_kecamatan ? (
              <>
                <dt className="meta text-paper/60">Kecamatan</dt>
                <dd>{config.nama_kecamatan}</dd>
              </>
            ) : null}
            {config?.nama_kabupaten ? (
              <>
                <dt className="meta text-paper/60">Kabupaten</dt>
                <dd>{config.nama_kabupaten}</dd>
              </>
            ) : null}
            {config?.nama_propinsi ? (
              <>
                <dt className="meta text-paper/60">Provinsi</dt>
                <dd>{config.nama_propinsi}</dd>
              </>
            ) : null}
            {config?.telepon ? (
              <>
                <dt className="meta text-paper/60">Telepon</dt>
                <dd>{config.telepon}</dd>
              </>
            ) : null}
          </dl>
        </div>

        <div className="lg:col-span-3">
          <p className="meta mb-4 text-clay">Navigasi</p>
          <ul className="space-y-2">
            <li><Link href="/profil-desa" className="text-paper/85 hover:text-clay">Profil Desa</Link></li>
            <li><Link href="/pemerintahan" className="text-paper/85 hover:text-clay">Pemerintahan</Link></li>
            <li><Link href="/data-statistik" className="text-paper/85 hover:text-clay">Data Statistik</Link></li>
            <li><Link href="/direktori" className="text-paper/85 hover:text-clay">Direktori</Link></li>
            <li><Link href="/galeri" className="text-paper/85 hover:text-clay">Galeri</Link></li>
            <li><Link href="/surat-mandiri" className="text-paper/85 hover:text-clay">Surat Mandiri</Link></li>
            <li><Link href="/artikel" className="text-paper/85 hover:text-clay">Daftar Artikel</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="meta mb-4 text-clay">Media Sosial</p>
          {sosmed.length === 0 ? (
            <p className="text-sm text-paper/70">Belum ada tautan media sosial.</p>
          ) : (
            <ul className="space-y-2">
              {sosmed.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-paper/85 hover:text-clay"
                  >
                    {s.nama}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 rounded border border-paper/10 p-5">
            <p className="meta text-paper/60">Tampilan</p>
            <p className="mt-1 text-xs text-paper/75">
              Pilih tema dan mode tampilan sesuai preferensi Anda.
            </p>
            <div className="mt-3">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-page py-5 text-xs text-paper/60">
          Konten diterbitkan oleh Pemerintah {config?.nama_desa ?? "Desa"}. Konten dapat
          disitasi dengan menyebutkan sumber.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
