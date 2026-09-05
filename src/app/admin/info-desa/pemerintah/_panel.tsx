// Panel interaktif Pemerintah Desa: tab Jabatan + tab Pamong.

"use client";

import { useState, useTransition } from "react";
import {
  aksiTambahJabatan,
  aksiEditJabatan,
  aksiHapusJabatan,
  aksiTambahPamong,
  aksiEditPamong,
  aksiHapusPamong,
} from "@/modules/info-desa/handler";
import type { Jabatan, BarisPamong } from "@/modules/info-desa";

type Tab = "jabatan" | "pamong";

const JENIS_JABATAN: Array<[number, string]> = [
  [0, "Lainnya"],
  [1, "Kepala Desa"],
  [2, "Sekretaris Desa"],
];

const STATUS_PAMONG: Array<[number, string]> = [
  [1, "Aktif"],
  [2, "Tidak Aktif"],
];

// Serialized shape: Date → string ISO untuk dapat di-pass dari server ke client.
type BarisPamongClient = Omit<BarisPamong, "tanggallahir"> & {
  tanggallahir: string | null;
};

export default function PanelPemerintah({
  jabatan,
  pamong,
}: {
  jabatan: Jabatan[];
  pamong: BarisPamongClient[];
}) {
  const [tab, setTab] = useState<Tab>("jabatan");
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);
  const [editJabatanId, setEditJabatanId] = useState<number | null>(null);
  const [editPamongId, setEditPamongId] = useState<number | null>(null);

  function tambahJabatan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      try {
        await aksiTambahJabatan(fd);
        setPesan("Jabatan ditambahkan");
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setPesan(`Gagal: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  }
  function editJabatanSubmit(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", String(id));
    mulai(async () => {
      await aksiEditJabatan(fd);
      setPesan("Jabatan diperbarui");
      setEditJabatanId(null);
    });
  }
  function hapusJabatan(id: number) {
    if (!confirm("Hapus jabatan ini?")) return;
    mulai(async () => {
      await aksiHapusJabatan(id);
      setPesan("Jabatan dihapus");
    });
  }
  function tambahPamong(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      try {
        await aksiTambahPamong(fd);
        setPesan("Pamong ditambahkan");
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setPesan(`Gagal: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
  }
  function editPamongSubmit(e: React.FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", String(id));
    mulai(async () => {
      await aksiEditPamong(fd);
      setPesan("Pamong diperbarui");
      setEditPamongId(null);
    });
  }
  function hapusPamong(id: number) {
    if (!confirm("Hapus pamong ini?")) return;
    mulai(async () => {
      await aksiHapusPamong(id);
      setPesan("Pamong dihapus");
    });
  }

  return (
    <div className="space-y-6">
      <div role="tablist" className="flex border-b border-ink/15">
        {(
          [
            ["jabatan", `Jabatan (${jabatan.length})`],
            ["pamong", `Perangkat (${pamong.length})`],
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

      {tab === "jabatan" && (
        <div className="space-y-6">
          <form onSubmit={tambahJabatan} className="border border-ink/15 bg-paper p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-2">
                <span className="meta mb-1 block">Nama Jabatan</span>
                <input
                  name="nama"
                  type="text"
                  required
                  placeholder="Kepala Urusan Pembangunan"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Jenis</span>
                <select
                  name="jenis"
                  defaultValue="0"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  {JENIS_JABATAN.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-3">
                <span className="meta mb-1 block">Tupoksi (opsional)</span>
                <textarea
                  name="tupoksi"
                  rows={2}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
              <p className="meta text-2xs">{pesan ?? "Tambah jabatan baru."}</p>
              <button
                type="submit"
                disabled={sedang}
                className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
              >
                {sedang ? "Menyimpan…" : "Tambah Jabatan"}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto border border-ink/15">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">Jenis</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {jabatan.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-center text-ink-muted">
                      Belum ada jabatan.
                    </td>
                  </tr>
                )}
                {jabatan.map((j) => {
                  const isEditing = editJabatanId === j.id;
                  return (
                    <tr key={j.id} className="border-t border-ink/10 align-top">
                      <td colSpan={isEditing ? 3 : 1} className="px-3 py-2">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => editJabatanSubmit(e, j.id)}
                            className="space-y-3 border border-clay/40 bg-clay/5 p-4"
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <label className="block sm:col-span-2">
                                <span className="meta mb-1 block">Nama Jabatan</span>
                                <input
                                  name="nama"
                                  type="text"
                                  required
                                  defaultValue={j.nama}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Jenis</span>
                                <select
                                  name="jenis"
                                  defaultValue={String(j.jenis)}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                >
                                  {JENIS_JABATAN.map(([v, l]) => (
                                    <option key={v} value={v}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block sm:col-span-3">
                                <span className="meta mb-1 block">Tupoksi</span>
                                <textarea
                                  name="tupoksi"
                                  rows={2}
                                  defaultValue={j.tupoksi ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-ink/10 pt-3">
                              <button
                                type="button"
                                onClick={() => setEditJabatanId(null)}
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
                            <span className="block font-medium">{j.nama}</span>
                            {j.tupoksi && (
                              <span className="meta block text-2xs normal-case tracking-normal">
                                {j.tupoksi}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      {!isEditing && (
                        <>
                          <td className="px-3 py-2 text-ink-muted">
                            {JENIS_JABATAN.find((x) => x[0] === j.jenis)?.[1] ?? "Lainnya"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditJabatanId(j.id)}
                                className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => hapusJabatan(j.id)}
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
      )}

      {tab === "pamong" && (
        <div className="space-y-6">
          <form onSubmit={tambahPamong} className="border border-ink/15 bg-paper p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block sm:col-span-2">
                <span className="meta mb-1 block">Nama Lengkap (+ gelar)</span>
                <input
                  name="pamong_nama"
                  type="text"
                  required
                  placeholder="H. Ahmad Subagyo, S.IP"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">NIK</span>
                <input
                  name="pamong_nik"
                  type="text"
                  pattern="\d{16}"
                  placeholder="3201011234560001"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Jabatan</span>
                <select
                  name="jabatan_id"
                  required
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  <option value="">— Pilih jabatan —</option>
                  {jabatan.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Status</span>
                <select
                  name="pamong_status"
                  defaultValue="1"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  {STATUS_PAMONG.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Pejabat Penandatangan?</span>
                <select
                  name="status_pejabat"
                  defaultValue="0"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  <option value="0">Tidak</option>
                  <option value="1">Ya — bisa TTD</option>
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Gelar Depan</span>
                <input
                  name="gelar_depan"
                  type="text"
                  placeholder="H."
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Gelar Belakang</span>
                <input
                  name="gelar_belakang"
                  type="text"
                  placeholder="S.IP"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. HP</span>
                <input
                  name="no_hp"
                  type="text"
                  placeholder="0812-3456-7890"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Tempat Lahir</span>
                <input
                  name="tempatlahir"
                  type="text"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Tanggal Lahir</span>
                <input
                  name="tanggallahir"
                  type="date"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Jenis Kelamin</span>
                <select
                  name="sex"
                  defaultValue="1"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                >
                  <option value="1">Laki-laki</option>
                  <option value="2">Perempuan</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
              <p className="meta text-2xs">
                {pesan ?? "Tambah perangkat lalu pilih jabatannya."}
              </p>
              <button
                type="submit"
                disabled={sedang || jabatan.length === 0}
                className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
              >
                {sedang ? "Menyimpan…" : "Tambah Pamong"}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto border border-ink/15">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left">
                <tr>
                  <th className="px-3 py-2">Nama</th>
                  <th className="px-3 py-2">NIK</th>
                  <th className="px-3 py-2">Jabatan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pamong.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-ink-muted">
                      Belum ada pamong.
                    </td>
                  </tr>
                )}
                {pamong.map((p) => {
                  const isEditing = editPamongId === p.id;
                  return (
                    <tr key={p.id} className="border-t border-ink/10 align-top">
                      <td colSpan={isEditing ? 5 : 1} className="px-3 py-2">
                        {isEditing ? (
                          <form
                            onSubmit={(e) => editPamongSubmit(e, p.id)}
                            className="space-y-3 border border-clay/40 bg-clay/5 p-4"
                          >
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <label className="block sm:col-span-2">
                                <span className="meta mb-1 block">Nama Lengkap</span>
                                <input
                                  name="pamong_nama"
                                  type="text"
                                  required
                                  defaultValue={p.pamong_nama}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">NIK</span>
                                <input
                                  name="pamong_nik"
                                  type="text"
                                  pattern="\d{16}"
                                  defaultValue={p.pamong_nik ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Jabatan</span>
                                <select
                                  name="jabatan_id"
                                  defaultValue={p.jabatan_id ? String(p.jabatan_id) : ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                >
                                  <option value="">— Pilih jabatan —</option>
                                  {jabatan.map((j) => (
                                    <option key={j.id} value={j.id}>
                                      {j.nama}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Status</span>
                                <select
                                  name="pamong_status"
                                  defaultValue={String(p.pamong_status)}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                >
                                  {STATUS_PAMONG.map(([v, l]) => (
                                    <option key={v} value={v}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Pejabat TTD?</span>
                                <select
                                  name="status_pejabat"
                                  defaultValue={String(p.status_pejabat)}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                >
                                  <option value="0">Tidak</option>
                                  <option value="1">Ya — bisa TTD</option>
                                </select>
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Gelar Depan</span>
                                <input
                                  name="gelar_depan"
                                  type="text"
                                  defaultValue={p.gelar_depan ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Gelar Belakang</span>
                                <input
                                  name="gelar_belakang"
                                  type="text"
                                  defaultValue={p.gelar_belakang ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">No. HP</span>
                                <input
                                  name="no_hp"
                                  type="text"
                                  defaultValue={p.no_hp ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Tempat Lahir</span>
                                <input
                                  name="tempatlahir"
                                  type="text"
                                  defaultValue={p.tempatlahir ?? ""}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Tanggal Lahir</span>
                                <input
                                  name="tanggallahir"
                                  type="date"
                                  defaultValue={(p.tanggallahir ?? "").slice(0, 10)}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                />
                              </label>
                              <label className="block">
                                <span className="meta mb-1 block">Jenis Kelamin</span>
                                <select
                                  name="sex"
                                  defaultValue={p.sex ? String(p.sex) : "1"}
                                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                                >
                                  <option value="1">Laki-laki</option>
                                  <option value="2">Perempuan</option>
                                </select>
                              </label>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-ink/10 pt-3">
                              <button
                                type="button"
                                onClick={() => setEditPamongId(null)}
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
                          <span className="block font-medium">{p.pamong_nama}</span>
                        )}
                      </td>
                      {!isEditing && (
                        <>
                          <td className="px-3 py-2 text-ink-muted">{p.pamong_nik ?? "—"}</td>
                          <td className="px-3 py-2">{p.jabatan_nama ?? "—"}</td>
                          <td className="px-3 py-2 text-ink-muted">
                            {p.pamong_status === 1 ? "Aktif" : "Tidak Aktif"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditPamongId(p.id)}
                                className="meta border border-ink/20 px-2 py-1 text-2xs normal-case tracking-normal hover:border-clay hover:text-clay"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => hapusPamong(p.id)}
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
      )}
    </div>
  );
}