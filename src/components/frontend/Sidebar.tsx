import Link from "next/link";
import { ambilWidgetAktif } from "@/lib/queries";
import { CariForm } from "./CariForm";
import { ArticleCard } from "./ArticleCard";
import { ambilArtikelPilihan } from "@/lib/queries";

export async function Sidebar() {
  const [widget, terpopuler] = await Promise.all([
    ambilWidgetAktif(),
    ambilArtikelPilihan(4),
  ]);

  return (
    <aside className="space-y-12">
      <section aria-labelledby="cari-heading">
        <h2 id="cari-heading" className="meta mb-4">Pencarian</h2>
        <CariForm />
      </section>

      {terpopuler.length > 0 ? (
        <section aria-labelledby="terpopuler-heading">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 id="terpopuler-heading" className="meta">Artikel Terbaru</h2>
            <Link href="/artikel" className="text-xs text-clay hover:text-ink">
              Semua artikel
            </Link>
          </div>
          <div>
            {terpopuler.map((a) => (
              <ArticleCard key={a.id} artikel={a} varian="compact" />
            ))}
          </div>
        </section>
      ) : null}

      {widget.length > 0 ? (
        <section aria-labelledby="widget-heading">
          <h2 id="widget-heading" className="meta mb-4">Layanan</h2>
          <ul className="space-y-4">
            {widget.map((w) => (
              <li
                key={w.id}
                className="border-l-2 border-clay/60 pl-4 text-sm leading-relaxed"
              >
                <p className="font-serif text-base text-ink">{w.judul}</p>
                <p className="mt-1 text-ink-muted">{w.isi}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}