import Link from "next/link";
import { ambilSlider, ambilArtikelPilihan } from "@/lib/queries";
import { ambilThemeAktif } from "@/lib/theme";
import { ambilDirektori } from "@/modules/direktori";
import { DirektoriCard } from "@/components/frontend/DirektoriCard";

export const dynamic = "force-dynamic";

async function nilaiSetting(key: string, fallback: string | number | boolean) {
  // Pembacaan nilai setting key langsung dari DB.
  // Dipakai untuk opsi tema tanpa memaksa render ulang seluruh layout.
  // (Pembacaan berat dilakukan di server, satu kali per request.)
  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return fallback;
  if (typeof fallback === "number") return Number(row.value) || fallback;
  if (typeof fallback === "boolean") return row.value === "1" || row.value === "true";
  return row.value;
}

export default async function Frontpage() {
  const theme = await ambilThemeAktif();
  const [slider, direktori, pilihan] = await Promise.all([
    ambilSlider(
      (await nilaiSetting("jumlah_slider", (theme.konfigurasi ?? []).find((k) => k.key === "jumlah_slider")?.value as number ?? 4)) as number,
    ),
    ambilDirektori(),
    ambilArtikelPilihan(3),
  ]);

  // Pilih layout sesuai setting tema. Fallback ke right-sidebar.
  const layoutKey = (await nilaiSetting("layout_halaman_depan", "right-sidebar")) as string;
  const Layout = theme.layouts[layoutKey as keyof typeof theme.layouts] ?? theme.layouts["right-sidebar"];

  const Slider = theme.partials.Slider;
  const Article = theme.partials.Article;

  const hero = (
    <>
      {slider.length > 0 ? <Slider slides={slider} /> : null}

      {/* Direktori singkat ala TownPress: kartu lembaga + layanan.
          Posisinya dipromosikan ke slot utama setelah slider — menggantikan
          blok "Berita Utama" (headline) supaya halaman depan lebih ramping
          dan langsung menunjukkan struktur desa. Layout 2 kolom supaya rapi. */}
      {direktori.length > 0 ? (
        <section className="mt-12 lg:mt-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-2">
            <h2 className="font-serif text-2xl">Direktori Desa</h2>
            <Link href="/direktori" className="text-xs text-clay hover:text-ink">
              Buka direktori →
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {direktori.slice(0, 6).map((item) => (
              <li key={item.id} className="min-w-0">
                <DirektoriCard item={item} varian="kartu" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Sorotan Pilihan — card berita di bawah Direktori Desa.
          Headline (Berita Utama) sengaja dihilangkan, hanya daftar
          3 artikel pilihan terbaru yang ditampilkan di sini. */}
      {pilihan.length > 0 ? (
        <section className="mt-12 lg:mt-16">
          <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-2">
            <h2 className="font-serif text-2xl">Sorotan Pilihan</h2>
            <Link href="/artikel" className="text-xs text-clay hover:text-ink">
              Lihat semua artikel →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pilihan.map((item) => (
              <Article key={item.id} artikel={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );

  // Layout dengan sidebar (right/left) atau full-content, teruskan hero sebagai main.
  return <Layout main={hero} />;
}
