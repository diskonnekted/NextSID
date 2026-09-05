"use client";

import { useState, useTransition } from "react";
import {
  aksiTambahLembaga,
  aksiEditLembaga,
  aksiHapusLembaga,
} from "@/modules/info-desa/handler";
import type { BarisLembaga } from "@/modules/info-desa";

export default function PanelLembaga({ daftarAwal }: { daftarAwal: BarisLembaga[] }) {
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  function tambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      await aksiTambahLembaga(fd);
      setPesan("Lembaga ditambahkan");
      (e.target as HTMLFormElement).reset();
    });
  }
  function edit(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", String(id));
    mulai(async () => {
      await aksiEditLembaga(fd);
      setPesan("Lembaga diperbarui");
      setEditId(null);
    });
  }
  function hapus(id: number) {
    if (!confirm("Hapus lembaga ini?")) return;
    mulai(async () => {
      await aksiHapusLembaga(id);
      setPesan("Lembaga dihapus");
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={tambah} className="border border-ink/15 bg-paper p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Nama Lembaga *</span>
            <input name="nama" type="text" required className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="PKK" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Singkatan</span>
            <input name="singkatan" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" placeholder="PKK" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Ketua</span>
            <input name="ketua" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Sekretaris</span>
            <input name="sekretaris" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Alamat / Sekretariat</span>
            <input name="alamat" type="text" className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Keterangan</span>
            <textarea name="keterangan" rows={2} className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <p className="meta text-2xs">{pesan ?? "Tambah lembaga desa baru."}</p>
          <button type="submit" disabled={sedang} className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60">
            {sedang ? "Menyimpan…" : "Tambah Lembaga"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-ink/15">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Ketua</th>
              <th className="px-3 py-2">Sekretaris</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {daftarAwal.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-ink-muted">
                  Belum ada lembaga.
                </td>
              </tr>
            )}
            {daftarAwal.map((l) => {
              const isEditing = editId === l.id;
              return (
                <tr key={l.id} className="border-t border-ink/10 align-top">
                  <td colSpan={isEditing ? 4 : 1} className="px-3 py-2">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => edit(e, l.id)}
                        className="space-y-3 border border-clay/40 bg-clay/5 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="meta mb-1 block">Nama Lembaga *</span>
                            <input
                              name="nama"
                              type="text"
                              required
                              defaultValue={l.nama}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="meta mb-1 block">Singkatan</span>
                            <input
                              name="singkatan"
                              type="text"
                              defaultValue={l.singkatan ?? ""}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="meta mb-1 block">Ketua</span>
                            <input
                              name="ketua"
                              type="text"
                              defaultValue={l.ketua ?? ""}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="meta mb-1 block">Sekretaris</span>
                            <input
                              name="sekretaris"
                              type="text"
                              defaultValue={l.sekretaris ?? ""}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="meta mb-1 block">Alamat / Sekretariat</span>
                            <input
                              name="alamat"
                              type="text"
                              defaultValue={l.alamat ?? ""}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="meta mb-1 block">Keterangan</span>
                            <textarea
                              name="keterangan"
                              rows={2}
                              defaultValue={l.keterangan ?? ""}
                              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                            />
                          </label>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-ink/10 pt-3">
                          <button
                            type="button"
                            onClick={() => setEditId(null)}
                            className="border border-ink/20 px-3 py-1 text-xs hover:border-ink"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={sedang}
                            className="border border-clay bg-clay px-4 py-1 font-serif text-xs text-paper hover:bg-clay/90 disabled:opacity-60"
                          >
                            Simpan
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <span className="block font-medium">{l.nama}</span>
                        {l.singkatan && (
                          <span className="meta block text-2xs">{l.singkatan}</span>
                        )}
                      </>
                    )}
                  </td>
                  {!isEditing && (
                    <>
                      <td className="px-3 py-2 text-ink-muted">{l.ketua ?? "—"}</td>
                      <td className="px-3 py-2 text-ink-muted">{l.sekretaris ?? "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditId(l.id)}
                            className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => hapus(l.id)}
                            className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-red-700 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}