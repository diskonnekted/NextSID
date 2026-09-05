// Tipe bersama untuk theme registry.
// Setiap theme di src/themes/{nama}/ harus conform ke interface ini.

import type { ComponentType } from "react";

export type ThemePartial<P = unknown> = ComponentType<P>;

export type LayoutComponent = ComponentType<{
  main: React.ReactNode;
  sticky?: boolean;
}>;

export type ThemeOption = {
  judul: string;
  key: string;
  value: string | number | boolean;
  type: "input-text" | "input-number" | "input-color" | "toggle" | "select";
  keterangan?: string;
  options?: Array<{ label: string; value: string }> | null;
  attributes?: Record<string, string | number>;
  readonly?: boolean;
  group: string;
};

export type Theme = {
  key: string;
  name: string;
  judul?: string;
  versi?: string;
  deskripsi?: string;
  partials: {
    Header: ThemePartial;
    Footer: ThemePartial;
    Slider: ThemePartial<{ slides: unknown[] }>;
    Headline: ThemePartial<{ artikel: unknown }>;
    Article: ThemePartial<{ artikel: unknown }>;
    Sidebar: ThemePartial;
    Pagination: ThemePartial<{
      halaman: number;
      total: number;
      perHalaman: number;
      basePath?: string;
      queryParams?: Record<string, string | undefined>;
    }>;
  };
  layouts: Record<string, LayoutComponent>;
  konfigurasi?: ThemeOption[];
  tokens?: Record<string, unknown>;
};