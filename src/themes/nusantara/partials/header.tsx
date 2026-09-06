// Theme "nusantara" — partial header.
// Editorial style: masthead bersih, navigasi tipe-based tanpa pill shape.
// Garis tipis sebagai pemisah, bukan shadow atau gradient dekoratif.

import Link from "next/link";
import Image from "next/image";
import { ambilConfig, ambilMediaSosial } from "@/lib/queries";

type MenuItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: MenuItem[];
};

const MENU_UTAMA: MenuItem[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Profil Desa",
    href: "/profil-desa",
    children: [
      { label: "Identitas Desa", href: "/profil-desa" },
      { label: "Wilayah Administratif", href: "/profil-desa#wilayah" },
      { label: "Sejarah Desa", href: "/profil-desa#sejarah" },
      { label: "Visi & Misi", href: "/profil-desa#visi-misi" },
    ],
  },
  {
    label: "Pemerintahan",
    href: "/pemerintahan",
    children: [
      { label: "Perangkat Desa", href: "/pemerintahan" },
      { label: "SOTK", href: "/pemerintahan#sotk" },
      { label: "Lembaga Desa", href: "/direktori?kategori=lembaga" },
      { label: "Kerjasama Desa", href: "/pemerintahan#kerjasama" },
    ],
  },
  { label: "Artikel", href: "/artikel" },
  {
    label: "Data Statistik",
    href: "/data-statistik",
    children: [
      { label: "Penduduk", href: "/data-statistik#penduduk" },
      { label: "Jenis Kelamin", href: "/data-statistik#jenis-kelamin" },
      { label: "Umur", href: "/data-statistik#umur" },
      { label: "Pendidikan", href: "/data-statistik#pendidikan" },
      { label: "Pekerjaan", href: "/data-statistik#pekerjaan" },
    ],
  },
  { label: "Direktori", href: "/direktori" },
  { label: "Galeri", href: "/galeri" },
  { label: "Surat Mandiri", href: "/surat-mandiri" },
];

export async function Header() {
  const config = await ambilConfig();
  const sosmed = await ambilMediaSosial();

  return (
    <header data-chrome="public" className="border-b border-ink/10 bg-paper">
      {/* Top strip: identitas singkat + media sosial */}
      <div className="border-b border-ink/5">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
          <p className="text-ink-muted">
            {config?.alamat ? <span>{config.alamat}</span> : <span>Sistem Informasi Desa</span>}
          </p>
          <div className="flex items-center gap-4">
            {sosmed.length > 0 ? (
              <ul className="flex items-center gap-3">
                {sosmed.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-muted hover:text-clay"
                      aria-label={s.nama}
                    >
                      {s.nama}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>

      {/* Masthead: logo / judul utama */}
      <div className="container-page py-6 lg:py-8">
        <Link href="/" className="flex items-center gap-5">
          {config?.logo ? (
            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-ink/10 bg-paper lg:h-20 lg:w-20">
              <Image
                src={config.logo}
                alt={`Logo ${config.nama_desa}`}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-contain"
              />
            </span>
          ) : null}
          <div>
            <p className="meta mb-1 text-clay">Sistem Informasi Desa</p>
            <h1 className="font-serif text-display-md leading-none text-ink lg:text-display-lg">
              {config?.nama_desa ?? "Desa"}
            </h1>
            {config?.alamat ? (
              <p className="mt-2 max-w-prose text-sm text-ink-muted">{config.alamat}</p>
            ) : null}
          </div>
        </Link>
      </div>

      {/* Main nav: tipe-based tanpa pill shape */}
      <nav aria-label="Navigasi utama" className="bg-paper-dim">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
          {MENU_UTAMA.map((item) =>
            item.children && item.children.length > 0 ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 font-medium text-ink transition-colors hover:text-clay"
                  aria-haspopup="true"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-[0.6rem]">{"\u25BC"}</span>
                </Link>
                <ul
                  role="menu"
                  className="invisible absolute left-0 top-full z-20 mt-2 min-w-[14rem] -translate-y-1 border border-ink/10 bg-paper opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100"
                >
                  {item.children.map((child) => (
                    <li key={child.label} role="none">
                      <Link
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-ink first:rounded-t-lg last:rounded-b-lg hover:bg-paper-dim hover:text-clay"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="font-medium text-ink transition-colors hover:text-clay"
              >
                {item.label}
              </Link>
            ),
          )}
          <span className="ml-auto" aria-hidden="true" />
          <Link
            href="/admin"
            className="inline-flex items-center rounded bg-clay px-4 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-ink"
          >
            Masuk Dasbor
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Header;
