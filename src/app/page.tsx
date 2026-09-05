import Link from "next/link";
import {
  ambilHeadline,
  ambilSlider,
  ambilArtikelPilihan,
  ambilDaftarArtikel,
  ambilConfig,
} from "@/lib/queries";
import { ambilThemeAktif, ambilKonfigurasiTema } from "@/lib/theme";
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
  const [config, headline, slider, pilihan, daftar, direktori] = await Promise.all([
    ambilConfig(),
    ambilHeadline(),
    ambilSlider(
      (await nilaiSetting("jumlah_slider", (theme.konfigurasi ?? []).find((k) => k.key === "jumlah_slider")?.value as number ?? 4)) as number,
    ),
    ambilArtikelPilihan(
      (await nilaiSetting("jumlah_artikel_pilihan", (theme.konfigurasi ?? []).find((k) => k.key === "jumlah_artikel_pilihan")?.value as number ?? 3)) as number,
    ),
    ambilDaftarArtikel({
      halaman: 1,
      perHalaman: 4,
    }),
    ambilDirektori(),
  ]);

  const leadId = headline?.id;
  const excludeIds = [leadId, ...slider.map((s) => s.id)].filter(
    (x): x is number => typeof x === "number",
  );

  // Pilih layout sesuai setting tema. Fallback ke right-sidebar.
  const layoutKey = (await nilaiSetting("layout_halaman_depan", "right-sidebar")) as string;
  const Layout = theme.layouts[layoutKey as keyof typeof theme.layouts] ?? theme.layouts["right-sidebar"];
  const tampilkanSidebar = await nilaiSetting("tampilkan_sidebar", true);

  const Slider = theme.partials.Slider;
  const Headline = theme.partials.Headline;
  const Article = theme.partials.Article;
  const Pagination = theme.partials.Pagination;

  const hero = (
    <>
      {slider.length > 0 ? <Slider slides={slider} /> : null}
      {headline ? (
        <div className="mt-12 lg:mt-16">
          <Headline artikel={headline} />
        </div>
      ) : null}

      {/* Direktori singkat ala TownPress: kartu lembaga + layanan.
          Ditempatkan tepat setelah headline sebagai "jendela" ke direktori. */}
      {direktori.length > 0 ? (
        <section className="mt-16 lg:mt-20">
          <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-2">
            <h2 className="font-serif text-2xl">Direktori Desa</h2>
            <Link href="/direktori" className="text-xs text-clay hover:text-ink">
              Buka direktori →
            </Link>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {direktori.slice(0, 4).map((item) => (
              <li key={item.id}>
                <DirektoriCard item={item} varian="kartu" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16">
        {pilihan.length > 0 ? (
          <div className="mb-12">
            <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-2">
              <h2 className="font-serif text-2xl">Sorotan Pilihan</h2>
              <Link href="/artikel" className="text-xs text-clay hover:text-ink">
                Arsip artikel →
              </Link>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {pilihan
                .filter((p) => p.id !== leadId)
                .slice(0, 3)
                .map((a) => (
                  <Article key={a.id} artikel={a} />
                ))}
            </div>
          </div>
        ) : null}

        {daftar.items.length > 0 ? (
          <div>
            <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-2">
              <h2 className="font-serif text-2xl">Berita Desa</h2>
              <p className="meta">
                {config?.nama_desa ?? "Desa"} · {new Date().getFullYear()}
              </p>
            </div>
            <div className="space-y-10">
              {daftar.items.map((a) => (
                <Article key={a.id} artikel={a} />
              ))}
            </div>
            <Pagination
              halaman={daftar.halaman}
              total={daftar.total}
              perHalaman={daftar.perHalaman}
              basePath="/artikel"
            />
          </div>
        ) : (
          <div className="border border-ink/10 bg-paper-dim p-12 text-center">
            <p className="meta">Belum ada berita</p>
            <p className="mt-3 text-ink-muted">
              Saat artikel diunggah melalui dasbor admin, daftar ini akan terisi otomatis.
            </p>
          </div>
        )}
      </section>
    </>
  );

  // Layout dengan sidebar (right/left) atau full-content, teruskan hero sebagai main.
  return <Layout main={hero} />;
}