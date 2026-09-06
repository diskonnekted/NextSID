import Link from "next/link";
import { ambilConfig } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pemerintahan Desa",
  description: "Perangkat desa, struktur organisasi, dan lembaga desa.",
};

// Gabungkan gelar depan/belakang dengan nama, hindari duplikasi
// jika gelar sudah ada di dalam nama.
function namaLengkap(nama: string, depan: string | null, belakang: string | null): string {
  let hasil = nama;
  if (depan && !nama.startsWith(depan.trim())) {
    hasil = `${depan} ${hasil}`;
  }
  if (belakang) {
    const belakangTrimmed = belakang.replace(/^,?\s*/, "");
    const pattern = new RegExp(`[,\\s]${backslashEscape(belakangTrimmed)}\\s*$`);
    if (!pattern.test(nama)) {
      hasil = `${hasil}, ${belakangTrimmed}`;
    }
  }
  return hasil;
}

function backslashEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function PemerintahanPage() {
  const config = await ambilConfig();

  const pamong = await prisma.pamong.findMany({
    where: { pamong_status: 1 },
    orderBy: [{ urutan: "asc" }, { id: "asc" }],
    include: { jabatan: true },
  });

  const totalAparatur = pamong.length;

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="mb-12 border-b border-ink/15 pb-8">
        <p className="meta mb-3">Tata Kelola</p>
        <h1 className="font-serif text-display-md leading-tight">
          Pemerintahan {config?.nama_desa ?? "Desa"}
        </h1>
        <p className="mt-4 max-w-prose text-ink-muted">
          Struktur organisasi dan aparatur Pemerintah Desa, termasuk perangkat
          desa aktif dan lembaga desa yang berada di bawah koordinasi.
        </p>
      </header>

      <section id="perangkat" className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="font-serif text-headline mb-6">
            Perangkat Desa ({totalAparatur})
          </h2>

          {pamong.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Belum ada data perangkat desa yang ditampilkan.
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2">
              {pamong.map((p) => {
                const namaTuntas = namaLengkap(
                  p.pamong_nama,
                  p.gelar_depan,
                  p.gelar_belakang,
                );
                return (
                  <li
                    key={p.id}
                    className="border border-ink/15 bg-paper overflow-hidden"
                  >
                    {/* Foto perangkat */}
                    {p.foto ? (
                      <div className="aspect-square overflow-hidden bg-paper-dim">
                        <img
                          src={`/${p.foto}`}
                          alt={`${p.jabatan?.nama ?? "Perangkat Desa"} - ${p.pamong_nama}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-paper-dim">
                        <span className="text-3xl font-serif text-ink/20">
                          {(p.pamong_nama ?? "?")[0]}
                        </span>
                      </div>
                    )}

                    {/* Info perangkat */}
                    <div className="p-5">
                      <p className="meta">
                        {p.jabatan?.nama ?? "Perangkat Desa"}
                      </p>
                      <p className="mt-2 font-serif text-lg leading-tight">
                        {namaTuntas}
                      </p>
                      {p.pamong_niap ? (
                        <p className="mt-2 text-xs text-ink-muted">
                          NIAP: {p.pamong_niap}
                        </p>
                      ) : null}
                      {p.no_hp ? (
                        <p className="mt-1 text-xs text-ink-muted">
                          HP: {p.no_hp}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside id="sotk" className="lg:col-span-4">
          <h2 className="font-serif text-headline mb-4">SOTK</h2>
          <p className="text-sm text-ink-muted">
            Bagan Struktur Organisasi dan Tata Kerja (SOTK) Pemerintah Desa
            akan ditampilkan sebagai diagram pada bagian ini.
          </p>
          <div className="mt-4 border border-dashed border-ink/20 p-6 text-center text-xs text-ink-muted">
            Placeholder diagram SOTK
          </div>

          <h3 id="kerjasama" className="font-serif text-lg mt-8 mb-3">
            Lembaga Desa
          </h3>
          <p className="text-sm text-ink-muted">
            Daftar lembaga desa dapat dilihat pada direktori:
          </p>
          <Link href="/direktori?kategori=lembaga" className="link-clay mt-2 inline-block">
            Buka Direktori Lembaga
          </Link>
        </aside>
      </section>
    </div>
  );
}
