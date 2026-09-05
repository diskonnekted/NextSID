"use client";

// Client panel untuk halaman admin kependudukan.
// Menangani upload Excel, fetch daftar paginasi via fetch(), dan
// menampilkan hasil import.

import { useState, useTransition } from "react";
import Link from "next/link";
import type {
  StatistikPenduduk,
  DaftarPendudukResult,
} from "@/modules/kependudukan";

type HasilImport = {
  ok: boolean;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  errors: string[];
};

type Props = {
  statistik: StatistikPenduduk;
  daftarAwal: DaftarPendudukResult;
  cariAwal: string;
};

function formatTanggal(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function labelJK(sex: number | null): string {
  if (sex === 1) return "L";
  if (sex === 2) return "P";
  return "—";
}

export default function PanelKelola({
  statistik,
  daftarAwal,
  cariAwal,
}: Props) {
  const [stat, setStat] = useState(statistik);
  const [daftar, setDaftar] = useState(daftarAwal);
  const [cari, setCari] = useState(cariAwal);
  const [halaman, setHalaman] = useState(daftarAwal.halaman);
  const [perHalaman] = useState(daftarAwal.perHalaman);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangUpload, setSedangUpload] = useState(false);
  const [hasilImport, setHasilImport] = useState<HasilImport | null>(null);
  const [, startTransition] = useTransition();

  async function muatUlang(h: number, q: string) {
    setSedangMemuat(true);
    try {
      const params = new URLSearchParams({
        halaman: String(h),
        perHalaman: String(perHalaman),
      });
      if (q) params.set("cari", q);
      const res = await fetch(`/api/admin/kependudukan/penduduk?${params}`);
      const json = await res.json();
      if (json.ok) {
        setDaftar({
          baris: json.baris,
          total: json.total,
          halaman: json.halaman,
          perHalaman: json.perHalaman,
          totalHalaman: json.totalHalaman,
        });
      }
    } finally {
      setSedangMemuat(false);
    }
  }

  async function refreshStatistik() {
    const res = await fetch("/api/admin/kependudukan/statistik");
    const json = await res.json();
    if (json.ok) setStat(json.data);
  }

  async function handleCari(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHalaman(1);
    await muatUlang(1, cari);
  }

  async function handleHalaman(h: number) {
    setHalaman(h);
    startTransition(() => muatUlang(h, cari));
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>("input[type=file]");
    if (!input?.files?.[0]) return;
    const fd = new FormData();
    fd.append("file", input.files[0]);
    setSedangUpload(true);
    setHasilImport(null);
    try {
      const res = await fetch("/api/admin/import/penduduk", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      setHasilImport({
        ok: !!json.ok,
        totalInserted: json.totalInserted ?? 0,
        totalUpdated: json.totalUpdated ?? 0,
        totalSkipped: json.totalSkipped ?? 0,
        errors: json.errors ?? [],
      });
      // Muat ulang data setelah import
      await refreshStatistik();
      await muatUlang(1, "");
      setCari("");
      setHalaman(1);
    } catch (err) {
      setHasilImport({
        ok: false,
        totalInserted: 0,
        totalUpdated: 0,
        totalSkipped: 0,
        errors: [String(err)],
      });
    } finally {
      setSedangUpload(false);
      // Reset input supaya bisa upload file yang sama lagi
      if (input) input.value = "";
    }
  }

  return (
    <div className="space-y-12">
      {/* === STATISTIK === */}
      <section aria-labelledby="statistik-heading">
        <h2 id="statistik-heading" className="meta mb-4">Ringkasan</h2>
        <dl className="grid grid-cols-2 gap-px border border-ink/10 bg-ink/10 lg:grid-cols-6">
          <StatCell label="Kartu Keluarga" value={stat.totalKK} />
          <StatCell label="Penduduk" value={stat.totalPenduduk} />
          <StatCell label="Laki-laki" value={stat.lakiLaki} />
          <StatCell label="Perempuan" value={stat.perempuan} />
          <StatCell label="Ref. Agama" value={stat.totalAgama} />
          <StatCell label="Ref. Pekerjaan" value={stat.totalPekerjaan} />
        </dl>
      </section>

      {/* === UPLOAD & DOWNLOAD === */}
      <section aria-labelledby="impor-heading" className="grid gap-8 lg:grid-cols-2">
        <div className="border border-ink/15 p-6">
          <h2 id="impor-heading" className="mb-1 font-serif text-2xl">Impor dari Excel</h2>
          <p className="mb-5 text-sm text-ink-muted">
            Unggah file <code className="bg-paper-dim px-1 font-mono text-xs">.xlsx</code>{" "}
            sesuai format{" "}
            <code className="bg-paper-dim px-1 font-mono text-xs">format-impor-excel.xlsm</code>.
            Sheet <em>Data Penduduk</em> + <em>Kode Data</em> akan dikenali otomatis.
          </p>
          <form onSubmit={handleUpload} className="space-y-4">
            <label className="block">
              <span className="meta block">File Excel</span>
              <input
                type="file"
                accept=".xlsx,.xlsm"
                required
                className="mt-2 block w-full cursor-pointer border border-ink/30 bg-paper px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-paper file:cursor-pointer"
              />
            </label>
            <button
              type="submit"
              disabled={sedangUpload}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-clay disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sedangUpload ? "Mengimpor…" : "Impor Sekarang"}
            </button>
          </form>

          {hasilImport && (
            <div
              className={`mt-5 border p-4 text-sm ${hasilImport.ok ? "border-ink/15 bg-paper-dim" : "border-clay/40 bg-clay/5"}`}
              role="status"
            >
              <p className="font-medium">
                {hasilImport.ok ? "Impor selesai" : "Impor selesai dengan catatan"}
              </p>
              <ul className="mt-2 space-y-1 text-ink-soft">
                <li>Baris baru : <strong>{hasilImport.totalInserted}</strong></li>
                <li>Diperbarui : <strong>{hasilImport.totalUpdated}</strong></li>
                <li>Dilewati : <strong>{hasilImport.totalSkipped}</strong></li>
              </ul>
              {hasilImport.errors.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-clay">
                    {hasilImport.errors.length} pesan kesalahan
                  </summary>
                  <ul className="mt-2 space-y-1 text-xs">
                    {hasilImport.errors.slice(0, 20).map((e, i) => (
                      <li key={i} className="font-mono text-clay">{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="border border-ink/15 p-6">
          <h2 className="mb-1 font-serif text-2xl">Template & Ekspor</h2>
          <p className="mb-5 text-sm text-ink-muted">
            Unduh template kosong untuk diisi ulang, atau ekspor seluruh
            data kependudukan saat ini dalam format yang sama.
          </p>
          <div className="space-y-3">
            <a
              href="/api/admin/import/penduduk/template"
              download
              className="inline-flex w-full items-center justify-between border border-ink/30 px-4 py-3 text-sm transition-colors hover:border-clay hover:text-clay"
            >
              <span>Template impor (kosong)</span>
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href="/api/admin/kependudukan/ekspor"
              download
              className="inline-flex w-full items-center justify-between border border-clay bg-clay px-4 py-3 text-sm text-paper transition-colors hover:bg-ink"
            >
              <span>Ekspor data saat ini</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            File ekspor mengikuti header 43 kolom yang sama dengan template
            sehingga dapat diimpor kembali tanpa penyesuaian.
          </p>
        </div>
      </section>

      {/* === DAFTAR PENDUDUK === */}
      <section aria-labelledby="daftar-heading">
        <div className="mb-4 flex flex-col gap-4 border-b border-ink/15 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="daftar-heading" className="font-serif text-2xl">Daftar Penduduk</h2>
            <p className="meta mt-1">
              {daftar.total} baris · halaman {daftar.halaman} dari {daftar.totalHalaman}
            </p>
          </div>
          <form onSubmit={handleCari} className="flex items-end gap-2">
            <label className="flex-1 lg:w-72">
              <span className="meta block">Cari nama atau NIK</span>
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Ketik untuk mencari…"
                className="mt-1 w-full"
              />
            </label>
            <button
              type="submit"
              className="border border-ink bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-clay"
            >
              Cari
            </button>
          </form>
        </div>

        <div className="overflow-x-auto border border-ink/15">
          <table className="min-w-full divide-y divide-ink/10 text-sm">
            <thead className="bg-paper-dim text-left">
              <tr>
                <Th>NIK</Th>
                <Th>Nama</Th>
                <Th>JK</Th>
                <Th>Tempat, Tgl Lahir</Th>
                <Th>No. KK</Th>
                <Th>Kepala Keluarga</Th>
                <Th>Alamat</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {daftar.baris.length === 0 && !sedangMemuat ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                    Tidak ada data{cari ? ` untuk "${cari}"` : ""}.
                  </td>
                </tr>
              ) : (
                daftar.baris.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-dim/50">
                    <Td className="font-mono text-xs">{p.nik}</Td>
                    <Td>
                      <div className="font-medium">{p.nama}</div>
                      <div className="meta text-2xs">
                        {p.agama ?? "—"} · {p.pekerjaan ?? "—"}
                      </div>
                    </Td>
                    <Td>{labelJK(p.sex)}</Td>
                    <Td>
                      <div>{p.tempatlahir ?? "—"}</div>
                      <div className="meta text-2xs">
                        {formatTanggal(p.tanggallahir)}
                      </div>
                    </Td>
                    <Td>
                      {p.no_kk ? (
                        <Link
                          href={`/admin/kependudukan/kk/${p.no_kk}`}
                          className="font-mono text-xs underline decoration-ink/20 underline-offset-2 hover:text-clay hover:decoration-clay"
                        >
                          {p.no_kk}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>{p.kepala_keluarga ?? "—"}</Td>
                    <Td className="text-ink-muted">
                      {p.alamat ? (
                        <>
                          {p.alamat}
                          <div className="meta text-2xs">
                            {p.dusun ? `Dusun ${p.dusun}` : ""}
                            {p.rt || p.rw ? ` · RT ${p.rt ?? "—"}/RW ${p.rw ?? "—"}` : ""}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINASI */}
        {daftar.totalHalaman > 1 && (
          <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
            <p className="meta">
              Menampilkan {(halaman - 1) * perHalaman + 1}–
              {Math.min(halaman * perHalaman, daftar.total)} dari {daftar.total}
            </p>
            <div className="flex items-center gap-1">
              <PageBtn
                disabled={halaman <= 1 || sedangMemuat}
                onClick={() => handleHalaman(halaman - 1)}
                label="Sebelumnya"
              />
              {Array.from({ length: daftar.totalHalaman }, (_, i) => i + 1)
                .filter((h) => {
                  if (daftar.totalHalaman <= 7) return true;
                  if (h === 1 || h === daftar.totalHalaman) return true;
                  return Math.abs(h - halaman) <= 2;
                })
                .map((h, i, arr) => {
                  const prev = arr[i - 1];
                  const perluElipsis = prev !== undefined && h - prev > 1;
                  return (
                    <span key={h} className="flex items-center gap-1">
                      {perluElipsis && <span className="px-2 text-ink-muted">…</span>}
                      <PageBtn
                        active={h === halaman}
                        onClick={() => handleHalaman(h)}
                        disabled={sedangMemuat}
                      >
                        {h}
                      </PageBtn>
                    </span>
                  );
                })}
              <PageBtn
                disabled={halaman >= daftar.totalHalaman || sedangMemuat}
                onClick={() => handleHalaman(halaman + 1)}
                label="Berikutnya"
              />
            </div>
          </nav>
        )}
      </section>

      {/* LINK KE DETAIL KK */}
      <aside className="border-t border-ink/15 pt-6 text-sm text-ink-muted">
        <Link href="/admin" className="hover:text-clay">
          ← Kembali ke Dasbor
        </Link>
      </aside>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper px-4 py-5">
      <dt className="meta">{label}</dt>
      <dd className="mt-2 font-serif text-3xl tabular-nums">{value.toLocaleString("id-ID")}</dd>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 font-medium uppercase tracking-wide text-xs text-ink-soft">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function PageBtn({
  children,
  label,
  active,
  disabled,
  onClick,
}: {
  children?: React.ReactNode;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={`min-w-[2.25rem] border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/30 hover:border-clay hover:text-clay"
      }`}
    >
      {label ?? children}
    </button>
  );
}