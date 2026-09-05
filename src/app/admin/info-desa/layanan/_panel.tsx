"use client";

import { useState, useTransition } from "react";
import { aksiTambahLayanan, aksiHapusLayanan } from "@/modules/info-desa/handler";
import type { BarisLayanan } from "@/modules/info-desa";

export default function PanelLayanan({ daftarAwal }: { daftarAwal: BarisLayanan[] }) {
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  function tambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      await aksiTambahLayanan(fd);
      setPesan("Layanan ditambahkan");
      (e.target as HTMLFormElement).reset();
    });
  }
  function hapus(id: number) {
    if (!confirm("Hapus layanan ini?")) return;
    mulai(async () => {
      await aksiHapusLayanan(id);
      setPesan("Layanan dihapus");
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={tambah} className="border border-ink/15 bg-paper p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nama Layanan *</span>
            <input name="nama" type="text" required className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="Pengaduan via WhatsApp" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kategori</span>
            <input name="kategori" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="Pengaduan" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kontak</span>
            <input name="kontak" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="0812-… atau email" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">URL Formulir (opsional)</span>
            <input name="url_form" type="url" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="https://…" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Keterangan</span>
            <textarea name="keterangan" rows={2} className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <p className="meta text-2xs">{pesan ?? "Tambah kanal layanan baru."}</p>
          <button type="submit" disabled={sedang} className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60">
            {sedang ? "Menyimpan…" : "Tambah Layanan"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Kategori</th>
              <th className="px-3 py-2">Kontak</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {daftarAwal.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-ink-muted">
                  Belum ada layanan.
                </td>
              </tr>
            )}
            {daftarAwal.map((l) => (
              <tr key={l.id} className="border-t border-ink/10">
                <td className="px-3 py-2 font-medium">{l.nama}</td>
                <td className="px-3 py-2 text-ink-muted">{l.kategori ?? "—"}</td>
                <td className="px-3 py-2 text-ink-muted">{l.kontak ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => hapus(l.id)} className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay">
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
