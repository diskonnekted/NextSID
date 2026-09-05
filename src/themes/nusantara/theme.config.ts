// Konfigurasi theme "nusantara".
// Tema vibrant & colorful. Mengikuti pola theme.config esensi
// untuk konsistensi parser admin.

import type { ThemeOption } from "@/types";

const themeConfig: ThemeOption[] = [
  {
    judul: "Nama Tema",
    key: "nama_tema",
    value: "nusantara",
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
    judul: "Mode Default",
    key: "mode_default",
    value: "light",
    type: "select",
    options: [
      { label: "Terang", value: "light" },
      { label: "Gelap", value: "dark" },
    ],
    keterangan: "Mode warna saat user pertama datang",
    group: "Tampilan",
  },
  {
    judul: "Tampilkan Hero Gradien",
    key: "tampilkan_hero_gradient",
    value: true,
    type: "toggle",
    keterangan: "Hero block penuh warna di halaman depan",
    group: "Tampilan",
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
];

export default themeConfig;