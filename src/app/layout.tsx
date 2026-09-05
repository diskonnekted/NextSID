import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ambilThemeAktif, ambilModeAktif } from "@/lib/theme";
import { PRE_HYDRATION_SCRIPT } from "@/lib/theme-switcher";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Surat SID — Portal Informasi Desa",
    template: "%s · Surat SID",
  },
  description:
    "Portal informasi desa: berita, statistik, layanan publik, dan transparansi APBDes.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await ambilThemeAktif();
  const mode = await ambilModeAktif();
  const themeKey = theme.key;

  return (
    <html
      lang="id"
      // Beberapa ekstensi browser (mis. perekam aktivitas) menyuntik atribut
      // ke <html> saat hydration; suppressHydrationWarning di sini supaya
      // React tidak mengeluarkan warning "Extra attributes from the server"
      // untuk atribut yang bukan berasal dari aplikasi.
      suppressHydrationWarning
      data-theme={themeKey}
      data-mode={mode}
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <head>
        {/* Pre-hydration script: set data-theme + data-mode SEBELUM React mount
            untuk mencegah flash of wrong theme saat switch. Aman dieksekusi
            berulang karena idempotent (cuma baca cookie + set attribute). */}
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <theme.partials.Header />
        <main>{children}</main>
        <theme.partials.Footer />
      </body>
    </html>
  );
}