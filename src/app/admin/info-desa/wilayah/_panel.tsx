// Panel interaktif Wilayah Administratif: pohon + form tambah + hapus.

"use client";

import { useState, useTransition } from "react";
import { aksiTambahWilayah, aksiHapusWilayah } from "@/modules/info-desa/handler";
import type { PohonWilayah, BarisWilayah } from "@/modules/info-desa";

type Tab = "tambah" | "hapus";

export default function PanelWilayah({
  pohon,
  ringkas,
  kepalaById,
}: {
  pohon: PohonWilayah[];
  ringkas: BarisWilayah[];
  kepalaById: Record<number, string>;
}) {
  const [tab, setTab] = useState<Tab>("tambah");
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  // Form state: tingkat + dusun target untuk tambah RW/RT.
  const [tingkat, setTingkat] = useState<"dusun" | "rw" | "rt">("dusun");
  const [dusunTarget, setDusunTarget] = useState("");
  const [rwTarget, setRwTarget] = useState("");

  function tambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      await aksiTambahWilayah(fd);
      setPesan("Wilayah ditambahkan");
      (e.target as HTMLFormElement).reset();
    });
  }

  function hapus(id: number) {
    if (!confirm("Hapus baris wilayah ini?")) return;
    mulai(async () => {
      await aksiHapusWilayah(id);
      setPesan("Baris dihapus");
    });
  }

  return (
    <div className="space-y-6">
      {/* Tab sederhana */}
      <div role="tablist" className="flex border-b border-ink/15">
        {(
          [
            ["tambah", "Tambah"],
            ["hapus", "Daftar & Hapus"],
          ] as Array<[Tab, string]>
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={[
              "px-4 py-2 text-sm",
              tab === k
                ? "border-b-2 border-clay text-ink"
                : "border-b-2 border-transparent text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tambah" && (
        <form onSubmit={tambah} className="border border-ink/15 bg-paper p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                ["dusun", "Dusun"],
                ["rw", "RW"],
                ["rt", "RT"],
              ] as Array<[typeof tingkat, string]>
            ).map(([k, label]) => (
              <label
                key={k}
                className={[
                  "cursor-pointer border px-4 py-3 text-center text-sm",
                  tingkat === k
                    ? "border-clay bg-clay/5 text-ink"
                    : "border-ink/15 text-ink-muted hover:border-ink/30",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="tingkat"
                  value={k}
                  checked={tingkat === k}
                  onChange={() => setTingkat(k)}
                  className="sr-only"
                />
                Tambah {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {tingkat !== "dusun" && (
              <label className="block">
                <span className="meta mb-1 block">Dusun</span>
                <select
                  name="dusun"
                  value={dusunTarget}
                  onChange={(e) => setDusunTarget(e.target.value)}
                  required
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  <option value="">— Pilih dusun —</option>
                  {pohon.map((d) => (
                    <option key={d.dusun} value={d.dusun}>
                      {d.dusun}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {tingkat === "dusun" && (
              <label className="block sm:col-span-2">
                <span className="meta mb-1 block">Nama Dusun</span>
                <input
                  name="dusun"
                  type="text"
                  required
                  placeholder="Dusun I"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
            )}
            {tingkat !== "dusun" && (
              <label className="block">
                <span className="meta mb-1 block">Nomor {tingkat.toUpperCase()}</span>
                <input
                  name={tingkat}
                  type="text"
                  required
                  value={tingkat === "rw" ? rwTarget : undefined}
                  onChange={(e) => tingkat === "rw" && setRwTarget(e.target.value)}
                  placeholder={tingkat === "rw" ? "01" : "001"}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
            )}
            {tingkat === "rt" && (
              <input type="hidden" name="rw" value={rwTarget} />
            )}
            <label className="block">
              <span className="meta mb-1 block">Kepala (opsional)</span>
              <select
                name="id_kepala"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
              >
                <option value="">— Belum ditentukan —</option>
                {Object.entries(kepalaById).map(([id, nama]) => (
                  <option key={id} value={id}>
                    {nama}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
            <p className="meta text-2xs">
              {pesan ?? "Tambah baris mengikuti struktur pohon."}
            </p>
            <button
              type="submit"
              disabled={sedang}
              className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
            >
              {sedang ? "Menyimpan…" : "Tambah"}
            </button>
          </div>
        </form>
      )}

      {tab === "hapus" && (
        <div className="overflow-x-auto border border-ink/15">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left">
              <tr>
                <th className="px-3 py-2">Dusun</th>
                <th className="px-3 py-2">RW</th>
                <th className="px-3 py-2">RT</th>
                <th className="px-3 py-2">Kepala</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ringkas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-ink-muted">
                    Belum ada baris wilayah.
                  </td>
                </tr>
              )}
              {ringkas.map((r) => {
                const kepala = r.id_kepala ? kepalaById[Number(r.id_kepala)] ?? r.id_kepala : "—";
                const tipe =
                  r.rt === "0" && r.rw === "0"
                    ? "Dusun"
                    : r.rt === "0"
                      ? "RW"
                      : "RT";
                return (
                  <tr key={r.id} className="border-t border-ink/10">
                    <td className="px-3 py-2">{r.dusun}</td>
                    <td className="px-3 py-2">{r.rw === "0" ? "—" : r.rw}</td>
                    <td className="px-3 py-2">{r.rt === "0" ? "—" : r.rt}</td>
                    <td className="px-3 py-2 text-ink-muted">{kepala}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="meta mr-2 inline-block text-2xs">{tipe}</span>
                      <button
                        type="button"
                        onClick={() => hapus(r.id)}
                        className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
