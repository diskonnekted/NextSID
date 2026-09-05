import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ambilThemeAktif } from "@/lib/theme";

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

  return (
    <html
      lang="id"
      // Beberapa ekstensi browser (mis. perekam aktivitas) menyuntik atribut
      // ke <html> saat hydration; suppressHydrationWarning di sini supaya
      // React tidak mengeluarkan warning "Extra attributes from the server"
      // untuk atribut yang bukan berasal dari aplikasi.
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <theme.partials.Header />
        <main>{children}</main>
        <theme.partials.Footer />
      </body>
    </html>
  );
}