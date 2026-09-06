// Definisi menu sidebar admin.
// Ditulis sebagai sumber tunggal (single source of truth) supaya layout
// + komponen lain (mis. breadcrumbs) konsisten.
//
// Saat modul baru siap, tambahkan entry di sini.
//
// Struktur menu mengikuti menu asli OpenSID:
//   - Info Desa (7 sub)
//   - Kependudukan (6 sub)
//   - dst.

import type { ComponentType, SVGProps } from "react";

export type MenuItem = {
  href: string;
  label: string;
  deskripsi?: string;
  // Ikon kecil inline SVG; dibuat modular agar layout tidak bergantung
  // pada library ikon eksternal.
  ikon: ComponentType<SVGProps<SVGSVGElement>>;
  // true = masih dalam pengembangan / hanya shell
  rintisan?: boolean;
  // Sub-menu (untuk parent group, mis. Info Desa, Kependudukan).
  // Parent tidak punya halaman sendiri; hanya sebagai "section header"
  // di sidebar yang bisa di-expand.
  children?: MenuItem[];
};

// ===== Ikon =====

const IkonRumah: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10.5V20h14v-9.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IkonOrang: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
  </svg>
);

const IkonKeluarga: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="8" cy="7" r="3" />
    <circle cx="16" cy="7" r="3" />
    <path d="M2 21c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
    <path d="M10 21c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
  </svg>
);

const IkonArtikel: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M8 9h8M8 13h8M8 17h5" strokeLinecap="round" />
  </svg>
);

const IkonKategori: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 5h7l2 2h9v12H3z" strokeLinejoin="round" />
    <path d="M3 9h18" strokeLinecap="round" />
  </svg>
);

const IkonKonfigurasi: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" strokeLinejoin="round" />
  </svg>
);

const IkonKontak: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 6h16v12H4z" />
    <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IkonInfoDesa: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </svg>
);

const IkonPeta: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" strokeLinejoin="round" />
    <path d="M9 4v14M15 6v14" />
  </svg>
);

const IkonInstansi: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 21h18M5 21V9l7-5 7 5v12" strokeLinejoin="round" />
    <path d="M9 21v-6h6v6" strokeLinejoin="round" />
    <path d="M9 12h.01M15 12h.01M12 12h.01" strokeLinecap="round" />
  </svg>
);

const IkonLembaga: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="6" r="3" />
    <circle cx="5" cy="9" r="2" />
    <circle cx="19" cy="9" r="2" />
    <path d="M2 21c0-3 2.5-5 5-5M9 21c0-3.3 2.7-6 6-6s6 2.7 6 6M22 21c0-3-2.5-5-5-5" strokeLinecap="round" />
  </svg>
);

const IkonStatus: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6z" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IkonRumahTangga: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M3 11 12 4l9 7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10v10h14V10" strokeLinejoin="round" />
    <path d="M10 20v-6h4v6" strokeLinecap="round" />
  </svg>
);

const IkonKelompok: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="8" cy="9" r="3" />
    <circle cx="16" cy="9" r="3" />
    <circle cx="12" cy="6" r="2.5" />
    <path d="M2 21c0-3 2.5-5.5 5.5-5.5S13 18 13 21M11 21c0-3 2.5-5.5 5.5-5.5S22 18 22 21M6 21c0-3 2.5-5.5 5.5-5.5S17 18 17 21" strokeLinecap="round" />
  </svg>
);

const IkonSuplemen: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="1" />
    <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
  </svg>
);

const IkonPemilih: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M5 12 10 7l9 9-5 5z" strokeLinejoin="round" />
    <path d="m8 16 1.5 1.5L17 10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IkonSurat: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M5 4h11l3 3v13H5z" strokeLinejoin="round" />
    <path d="M16 4v3h3M8 12h8M8 16h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IkonArsip: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <rect x="3" y="4" width="18" height="4" rx="0.5" />
    <path d="M5 8v12h14V8M9 12h6" strokeLinecap="round" />
  </svg>
);

const IkonPermohonan: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M4 4h16v4H4z" />
    <path d="M4 10h16M4 14h12M4 18h8" strokeLinecap="round" />
  </svg>
);

const IkonDokumen: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M14 3H6v18h12V7z" strokeLinejoin="round" />
    <path d="M14 3v4h4M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== Daftar menu =====

// Section "Info Desa" — 7 sub mengikuti menu OpenSID asli:
//   Identitas Desa, Wilayah Administratif, Pemerintah Desa, Status Desa,
//   Lembaga Desa, Layanan Pelanggan, Pendaftaran Kerjasama.

const menuInfoDesa: MenuItem[] = [
  {
    href: "/admin/info-desa/identitas",
    label: "Identitas Desa",
    deskripsi: "Nama, kode, alamat, kontak desa",
    ikon: IkonInfoDesa,
  },
  {
    href: "/admin/info-desa/wilayah",
    label: "Wilayah Administratif",
    deskripsi: "Dusun, RW, RT",
    ikon: IkonPeta,
  },
  {
    href: "/admin/info-desa/pemerintah",
    label: "Pemerintah Desa",
    deskripsi: "Kepala desa & perangkat",
    ikon: IkonInstansi,
  },
  {
    href: "/admin/info-desa/status",
    label: "Status Desa",
    deskripsi: "Profil desa, ekologi, adat, internet",
    ikon: IkonStatus,
  },
  {
    href: "/admin/info-desa/lembaga",
    label: "Lembaga Desa",
    deskripsi: "Daftar lembaga & kepengurusan",
    ikon: IkonLembaga,
    rintisan: true,
  },
  {
    href: "/admin/info-desa/layanan",
    label: "Layanan Pelanggan",
    deskripsi: "Kanal pengaduan & informasi",
    ikon: IkonKontak,
    rintisan: true,
  },
  {
    href: "/admin/info-desa/kerjasama",
    label: "Pendaftaran Kerjasama",
    deskripsi: "Mitra & kerja sama desa",
    ikon: IkonArtikel,
    rintisan: true,
  },
];

// Section "Kependudukan" — 6 sub mengikuti menu OpenSID asli:
//   Penduduk, Keluarga, Rumah Tangga, Kelompok, Data Suplemen, Calon Pemilih.

const menuKependudukan: MenuItem[] = [
  {
    href: "/admin/kependudukan",
    label: "Penduduk",
    deskripsi: "Impor & kelola data warga",
    ikon: IkonOrang,
  },
  {
    href: "/admin/kk",
    label: "Kartu Keluarga",
    deskripsi: "Daftar KK & anggota",
    ikon: IkonKeluarga,
  },
  {
    href: "/admin/rumah-tangga",
    label: "Rumah Tangga",
    deskripsi: "RTM & daftar anggota",
    ikon: IkonRumahTangga,
  },
  {
    href: "/admin/kelompok",
    label: "Kelompok",
    deskripsi: "Kelas sosial & ekonomi",
    ikon: IkonKelompok,
  },
  {
    href: "/admin/suplemen",
    label: "Data Suplemen",
    deskripsi: "Sasaran & variabel tambahan",
    ikon: IkonSuplemen,
  },
  {
    href: "/admin/pemilih",
    label: "Calon Pemilih",
    deskripsi: "Daftar pemilih potensial",
    ikon: IkonPemilih,
  },
];

export type MenuSection = {
  label: string;
  // Ikon section header di sidebar.
  ikon: ComponentType<SVGProps<SVGSVGElement>>;
  items: MenuItem[];
};

export const menuAdmin: MenuSection[] = [
  {
    label: "Ringkasan",
    ikon: IkonRumah,
    items: [
      {
        href: "/admin",
        label: "Dasbor",
        deskripsi: "Statistik singkat desa",
        ikon: IkonRumah,
      },
    ],
  },
  {
    label: "Info Desa",
    ikon: IkonInfoDesa,
    items: menuInfoDesa,
  },
  {
    label: "Kependudukan",
    ikon: IkonOrang,
    items: menuKependudukan,
  },
  {
    label: "Surat Menyurat",
    ikon: IkonSurat,
    items: [
      {
        href: "/admin/surat",
        label: "Ringkasan",
        deskripsi: "Statistik surat & permohonan",
        ikon: IkonSurat,
      },
      {
        href: "/admin/surat/format",
        label: "Template Surat",
        deskripsi: "Daftar template & referensi syarat",
        ikon: IkonSurat,
      },
      {
        href: "/admin/surat/arsip",
        label: "Arsip Cetak",
        deskripsi: "Log surat yang telah dicetak",
        ikon: IkonArsip,
      },
      {
        href: "/admin/surat/permohonan",
        label: "Permohonan",
        deskripsi: "Permohonan Layanan Mandiri",
        ikon: IkonPermohonan,
      },
      {
        href: "/admin/surat/dokumen",
        label: "Dokumen",
        deskripsi: "Lampiran & syarat surat",
        ikon: IkonDokumen,
      },
    ],
  },
  {
    label: "Konten",
    ikon: IkonArtikel,
    items: [
      {
        href: "/admin/artikel",
        label: "Artikel",
        deskripsi: "Berita & pengumuman desa",
        ikon: IkonArtikel,
        rintisan: true,
      },
      {
        href: "/admin/kategori",
        label: "Kategori",
        deskripsi: "Pengelompokan artikel",
        ikon: IkonKategori,
        rintisan: true,
      },
    ],
  },
  {
    label: "Layanan",
    ikon: IkonKontak,
    items: [
      {
        href: "/admin/kontak",
        label: "Pesan Masuk",
        deskripsi: "Kotak pesan warga",
        ikon: IkonKontak,
        rintisan: true,
      },
    ],
  },
  {
    label: "Pengaturan",
    ikon: IkonKonfigurasi,
    items: [
      {
        href: "/admin/konfigurasi",
        label: "Konfigurasi Desa",
        deskripsi: "Logo, tema & setting",
        ikon: IkonKonfigurasi,
      },
    ],
  },
];

// Cari menu aktif (termasuk yang punya children). Dipakai untuk highlight
// di sidebar + breadcrumb.
export function cariMenuAktif(pathname: string): {
  section: MenuSection;
  item: MenuItem;
} | null {
  const semuaItem = menuAdmin.flatMap((s) => s.items);
  // Urutkan dari path terlama dulu agar prefix match benar.
  const urut = [...semuaItem].sort((a, b) => b.href.length - a.href.length);
  const item = urut.find(
    (m) => pathname === m.href || pathname.startsWith(m.href + "/"),
  );
  if (!item) return null;
  const section = menuAdmin.find((s) => s.items.includes(item)) ?? null;
  if (!section) return null;
  return { section, item };
}
