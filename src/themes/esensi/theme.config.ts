// Konfigurasi theme "esensi".
// Port 1:1 dari OpenSID themes/esensi/config.json dengan penyesuaian untuk Next.js.
// File ini dibaca oleh `sumberTheme()` di @/lib/theme untuk mengatur opsi admin.

export type ThemeOptionType =
  | "input-text"
  | "input-number"
  | "input-color"
  | "toggle"
  | "select";

export type ThemeOption = {
  judul: string;
  key: string;
  value: string | number | boolean;
  type: ThemeOptionType;
  keterangan?: string;
  options?: Array<{ label: string; value: string }> | null;
  attributes?: Record<string, string | number>;
  readonly?: boolean;
  group: string;
};

const themeConfig: ThemeOption[] = [
  {
    judul: "Nama Tema",
    key: "nama_tema",
    value: "esensi",
    type: "input-text",
    keterangan: "Identifier internal tema",
    readonly: true,
    group: "Umum",
  },
  {
    judul: "Versi Tema",
    key: "versi_tema",
    value: "1.0.0",
    type: "input-text",
    readonly: true,
    group: "Umum",
  },
  {
    judul: "Jumlah Artikel per Halaman",
    key: "jumlah_artikel_perhalaman",
    value: 9,
    type: "input-number",
    attributes: { min: 3, max: 30, step: 1 },
    group: "Artikel",
  },
  {
    judul: "Jumlah Slider",
    key: "jumlah_slider",
    value: 4,
    type: "input-number",
    attributes: { min: 1, max: 10, step: 1 },
    group: "Artikel",
  },
  {
    judul: "Jumlah Artikel Pilihan",
    key: "jumlah_artikel_pilihan",
    value: 3,
    type: "input-number",
    attributes: { min: 1, max: 9, step: 1 },
    group: "Artikel",
  },
  {
    judul: "Tampilkan Sidebar",
    key: "tampilkan_sidebar",
    value: true,
    type: "toggle",
    group: "Tampilan",
  },
  {
    judul: "Tampilkan Search di Header",
    key: "tampilkan_search",
    value: true,
    type: "toggle",
    group: "Tampilan",
  },
  {
    judul: "Layout Halaman Depan",
    key: "layout_halaman_depan",
    value: "right-sidebar",
    type: "select",
    options: [
      { label: "Konten penuh", value: "full-content" },
      { label: "Sidebar kanan", value: "right-sidebar" },
      { label: "Sidebar kiri", value: "left-sidebar" },
    ],
    group: "Tampilan",
  },
  {
    judul: "Jumlah Pembangunan per Halaman",
    key: "jumlah_pembangunan_perhalaman",
    value: 10,
    type: "input-number",
    attributes: { min: 1, max: 50, step: 1 },
    group: "Pembangunan",
  },
  {
    judul: "Jumlah Pengaduan per Halaman",
    key: "jumlah_pengaduan_perhalaman",
    value: 10,
    type: "input-number",
    attributes: { min: 1, max: 50, step: 1 },
    group: "Pengaduan",
  },
];

export default themeConfig;