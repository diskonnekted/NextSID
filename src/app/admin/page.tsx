// Halaman dasbor admin — entry point setelah login.
// Layout sudah membungkus dengan sidebar + topbar (lihat admin/layout.tsx).

import Link from "next/link";
import { ambilStatistik } from "@/modules/kependudukan";
import { menuAdmin } from "./_menu";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stat = await ambilStatistik();
  const sekarang = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Ringkas semua item dari semua section jadi satu daftar modul.
  const semuaItem = menuAdmin.flatMap((s) =>
    s.items.map((it) => ({ ...it, section: s.label })),
  );

  return (
    <div className="space-y-10">
      {/* Sambutan */}
      <section>
        <p className="meta mb-2">{sekarang}</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Selamat datang di Dasbor Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Pusat pengelolaan data dan konten desa. Pilih modul di sidebar
          untuk mulai bekerja. Modul bertanda <em>Rintisan</em> masih
          dalam pengembangan.
        </p>
      </section>

      {/* Ringkasan angka */}
      <section aria-labelledby="ringkasan-heading">
        <h3 id="ringkasan-heading" className="meta mb-3">
          Ringkasan singkat
        </h3>
        <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-4">
          {[
            { label: "Kartu Keluarga", value: stat.totalKK },
            { label: "Penduduk", value: stat.totalPenduduk },
            { label: "Laki-laki", value: stat.lakiLaki },
            { label: "Perempuan", value: stat.perempuan },
          ].map((c) => (
            <div key={c.label} className="bg-paper px-5 py-5">
              <dt className="meta">{c.label}</dt>
              <dd className="mt-2 font-serif text-3xl tabular-nums">
                {c.value.toLocaleString("id-ID")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Kartu modul */}
      <section aria-labelledby="modul-heading">
        <h3 id="modul-heading" className="meta mb-3">
          Modul tersedia
        </h3>
        <ul className="grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {semuaItem.map((m) => {
            const isKependudukan = m.href.startsWith("/admin/kependudukan");
            return (
              <li key={m.href} className="bg-paper">
                <Link
                  href={m.href}
                  className="group flex h-full flex-col px-5 py-6 transition-colors hover:bg-paper-dim"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <m.ikon className="h-4 w-4 text-clay" />
                    <h4 className="font-serif text-xl">{m.label}</h4>
                    {m.rintisan && (
                      <span className="meta ml-auto inline-block border border-ink/20 px-1.5 py-0.5 text-2xs normal-case tracking-normal">
                        Rintisan
                      </span>
                    )}
                  </div>
                  <p className="meta text-2xs normal-case tracking-normal">
                    {m.section}
                  </p>
                  {m.deskripsi && (
                    <p className="mt-2 text-sm text-ink-muted">{m.deskripsi}</p>
                  )}

                  {isKependudukan && (
                    <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-ink/10 pt-4 text-xs">
                      <div>
                        <dt className="meta">KK</dt>
                        <dd className="font-serif text-lg tabular-nums">
                          {stat.totalKK}
                        </dd>
                      </div>
                      <div>
                        <dt className="meta">Penduduk</dt>
                        <dd className="font-serif text-lg tabular-nums">
                          {stat.totalPenduduk}
                        </dd>
                      </div>
                      <div>
                        <dt className="meta">L / P</dt>
                        <dd className="font-serif text-lg tabular-nums">
                          {stat.lakiLaki} / {stat.perempuan}
                        </dd>
                      </div>
                    </dl>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="meta text-2xs">
        © {new Date().getFullYear()} · Dasbor Admin v0.1
      </p>
    </div>
  );
}
