"use client";

import { useState, useTransition } from "react";
import { aksiTambahKerjasama, aksiHapusKerjasama } from "@/modules/info-desa/handler";
import type { BarisKerjasama } from "@/modules/info-desa";

function formatTanggal(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default function PanelKerjasama({ daftarAwal }: { daftarAwal: BarisKerjasama[] }) {
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  function tambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      await aksiTambahKerjasama(fd);
      setPesan("Kerjasama ditambahkan");
      (e.target as HTMLFormElement).reset();
    });
  }
  function hapus(id: number) {
    if (!confirm("Hapus kerjasama ini?")) return;
    mulai(async () => {
      await aksiHapusKerjasama(id);
      setPesan("Kerjasama dihapus");
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={tambah} className="border border-ink/15 bg-paper p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Judul Kerjasama *</span>
            <input name="judul" type="text" required className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="Kerjasama Pembangunan Jalan Desa" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Mitra *</span>
            <input name="mitra" type="text" required className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="Dinas PUPR Kab. Bogor" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Bidang</span>
            <input name="bidang" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="Infrastruktur" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Tanggal Mulai</span>
            <input name="tanggal_mulai" type="date" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Tanggal Selesai</span>
            <input name="tanggal_selesai" type="date" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nomor Kontrak / PKS</span>
            <input name="nomor" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Keterangan</span>
            <textarea name="keterangan" rows={2} className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <p className="meta text-2xs">{pesan ?? "Tambah catatan kerjasama."}</p>
          <button type="submit" disabled={sedang} className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60">
            {sedang ? "Menyimpan…" : "Tambah Kerjasama"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">Judul</th>
              <th className="px-3 py-2">Mitra</th>
              <th className="px-3 py-2">Periode</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {daftarAwal.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-ink-muted">
                  Belum ada catatan kerjasama.
                </td>
              </tr>
            )}
            {daftarAwal.map((k) => (
              <tr key={k.id} className="border-t border-ink/10">
                <td className="px-3 py-2 font-medium">{k.judul}</td>
                <td className="px-3 py-2 text-ink-muted">{k.mitra}</td>
                <td className="px-3 py-2 text-ink-muted">
                  {formatTanggal(k.tanggal_mulai)} → {formatTanggal(k.tanggal_selesai)}
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => hapus(k.id)} className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
