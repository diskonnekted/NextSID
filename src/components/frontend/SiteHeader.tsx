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

export async function SiteHeader() {
  const config = await ambilConfig();
  const sosmed = await ambilMediaSosial();

  return (
    <header data-chrome="public" className="border-b border-ink/15">
      {/* Top strip: identitas singkat + media sosial */}
      <div className="border-b border-ink/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 text-xs text-ink-muted">
          <p>
            {config?.alamat ? (
              <span>{config.alamat}</span>
            ) : (
              <span>Sistem Informasi Desa</span>
            )}
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
                      className="hover:text-clay"
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

      {/* Masthead: logo / judul utama dengan hero banner background */}
      <div className="relative overflow-hidden">
        {config?.hero_banner ? (
          <Image
            src={config.hero_banner}
            alt=""
            aria-hidden="true"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          />
        ) : null}
        {/* Overlay agar teks tetap terbaca di atas gambar. */}
        <div
          aria-hidden="true"
          className={
            config?.hero_banner
              ? "absolute inset-0 z-[1] bg-gradient-to-r from-ink/85 via-ink/55 to-ink/30"
              : ""
          }
        />
        <div className="container-page relative z-[2] py-8 lg:py-12">
          <Link href="/" className="flex items-center gap-5">
            {config?.logo ? (
              <Image
                src={config.logo}
                alt={`Logo ${config.nama_desa}`}
                width={72}
                height={72}
                unoptimized
                className="h-16 w-16 shrink-0 object-contain bg-paper/85 p-1 lg:h-[72px] lg:w-[72px]"
              />
            ) : null}
            <div
              className={
                config?.hero_banner ? "text-paper" : undefined
              }
            >
              <p
                className={
                  config?.hero_banner
                    ? "meta mb-2 text-paper/80"
                    : "meta mb-2"
                }
              >
                Sistem Informasi Desa
              </p>
              <h1 className="font-serif text-display-md leading-none lg:text-display-lg">
                {config?.nama_desa ?? "Desa"}
              </h1>
              {config?.alamat ? (
                <p
                  className={
                    config?.hero_banner
                      ? "mt-3 max-w-prose text-sm text-paper/85"
                      : "mt-3 max-w-prose text-sm text-ink-muted"
                  }
                >
                  {config.alamat}
                </p>
              ) : null}
            </div>
          </Link>
        </div>
      </div>

      {/* Main nav ala OpenSID: li.dropdown > a + ul.dropdown-menu */}
      <nav aria-label="Navigasi utama" className="border-t border-ink/15">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm">
          {MENU_UTAMA.map((item) =>
            item.children && item.children.length > 0 ? (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-clay"
                  aria-haspopup="true"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-[0.6rem]">▼</span>
                </Link>
                <ul
                  role="menu"
                  className="invisible absolute left-0 top-full z-20 min-w-[14rem] -translate-y-1 border border-ink/15 bg-paper opacity-0 shadow-soft transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100"
                >
                  {item.children.map((child) => (
                    <li key={child.label} role="none">
                      <Link
                        href={child.href}
                        role="menuitem"
                        className="block px-4 py-2 text-sm hover:bg-paper-dim hover:text-clay"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="hover:text-clay">
                {item.label}
              </Link>
            ),
          )}
          <span className="ml-auto text-2xs text-ink-muted" aria-hidden="true">·</span>
          <Link
            href="/admin"
            className="text-2xs uppercase tracking-wider text-ink-muted hover:text-clay"
          >
            Masuk Dasbor
          </Link>
        </div>
      </nav>
    </header>
  );
}