// Client component untuk panel CRUD Template Surat + Referensi Syarat.
// Dua tab/grup: (1) daftar template dengan form tambah/edit/hapus,
// (2) referensi syarat (RefSyaratSurat).

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aksiTambahFormat,
  aksiUbahFormat,
  aksiHapusFormat,
  aksiTambahSyarat,
  aksiHapusSyarat,
} from "@/modules/surat/handler";

type Format = {
  id: number;
  nama: string;
  url_surat: string;
  kode_surat: string;
  kunci: number;
  favorit: number;
  jenis: number;
  mandiri: number;
  syarat_ids: number[];
};

type Syarat = { id: number; nama: string };

function labelJenis(j: number) {
  return (
    {
      1: "Surat Desa",
      2: "Surat Keterangan",
      3: "Surat Izin",
      4: "Layanan Mandiri",
    }[j] ?? `Jenis ${j}`
  );
}

export default function PanelFormat({
  format,
  syarat,
}: {
  format: Format[];
  syarat: Syarat[];
}) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="format-heading" className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h3 id="format-heading" className="font-serif text-xl">
            Daftar Template ({format.length})
          </h3>
        </div>
        <TabelFormat items={format} syarat={syarat} />
        <FormFormatBaru syarat={syarat} />
      </section>

      <section
        id="ref-syarat"
        aria-labelledby="syarat-heading"
        className="space-y-6"
      >
        <div className="flex items-baseline justify-between">
          <h3 id="syarat-heading" className="font-serif text-xl">
            Referensi Syarat ({syarat.length})
          </h3>
        </div>
        <TabelSyarat items={syarat} />
        <FormSyaratBaru />
      </section>
    </div>
  );
}

// ===================== FORMAT =====================

function TabelFormat({ items, syarat }: { items: Format[]; syarat: Syarat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="meta text-2xs">
        Belum ada template. Tambahkan template baru pada formulir di bawah.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-paper-dim">
          <tr>
            <th className="meta px-3 py-2 text-left">Nama</th>
            <th className="meta px-3 py-2 text-left">URL / Kode</th>
            <th className="meta px-3 py-2 text-left">Jenis</th>
            <th className="meta px-3 py-2 text-left">Syarat</th>
            <th className="meta px-3 py-2 text-left">Tanda</th>
            <th className="meta px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id} className="border-t border-ink/10 align-top">
              {editingId === f.id ? (
                <td colSpan={6} className="px-3 py-3">
                  <FormEditFormat
                    f={f}
                    syarat={syarat}
                    onSelesai={() => setEditingId(null)}
                  />
                </td>
              ) : (
                <>
                  <td className="px-3 py-2 font-medium">{f.nama}</td>
                  <td className="px-3 py-2 text-ink-muted">
                    <div>{f.url_surat || "—"}</div>
                    {f.kode_surat && (
                      <div className="meta text-2xs">{f.kode_surat}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">{labelJenis(f.jenis)}</td>
                  <td className="px-3 py-2">
                    {f.syarat_ids.length === 0
                      ? "—"
                      : f.syarat_ids
                          .map(
                            (id) =>
                              syarat.find((s) => s.id === id)?.nama ?? `#${id}`,
                          )
                          .join(", ")}
                  </td>
                  <td className="px-3 py-2">
                    {f.kunci === 1 && (
                      <span className="meta mr-2 border border-ink/20 px-1.5 py-0.5 text-2xs">
                        Kunci
                      </span>
                    )}
                    {f.favorit === 1 && (
                      <span className="meta mr-2 border border-ink/20 px-1.5 py-0.5 text-2xs">
                        Favorit
                      </span>
                    )}
                    {f.mandiri === 1 && (
                      <span className="meta border border-ink/20 px-1.5 py-0.5 text-2xs">
                        Mandiri
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-clay hover:underline"
                      onClick={() => setEditingId(f.id)}
                    >
                      Ubah
                    </button>
                    <form
                      action={(fd) => {
                        if (!confirm(`Hapus template "${f.nama}"?`)) return;
                        start(async () => {
                          await aksiHapusFormat(fd);
                          router.refresh();
                        });
                      }}
                      className="ml-3 inline"
                    >
                      <input type="hidden" name="id" value={f.id} />
                      <button
                        type="submit"
                        disabled={f.kunci === 1 || pending}
                        className="text-clay hover:underline disabled:opacity-40"
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormFormatBaru({ syarat }: { syarat: Syarat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahFormat(fd);
            setErr(null);
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="border border-ink/15 bg-paper p-6 space-y-4"
    >
      <h4 className="font-serif text-lg">Tambah Template Baru</h4>
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">
          {err}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="meta mb-1 block">Nama Template *</span>
          <input
            name="nama"
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">URL Surat</span>
          <input
            name="url_surat"
            placeholder="mis. surat_keterangan_domisili"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Kode Surat</span>
          <input
            name="kode_surat"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Jenis</span>
          <select
            name="jenis"
            defaultValue="2"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="1">Surat Desa</option>
            <option value="2">Surat Keterangan</option>
            <option value="3">Surat Izin</option>
            <option value="4">Layanan Mandiri</option>
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Masa Berlaku (angka)</span>
          <input
            name="masa_berlaku"
            type="number"
            min={0}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Satuan Masa Berlaku</span>
          <select
            name="satuan_masa_berlaku"
            defaultValue=""
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— Tidak ada —</option>
            <option value="hari">hari</option>
            <option value="bulan">bulan</option>
            <option value="tahun">tahun</option>
          </select>
        </label>
      </div>

      {syarat.length > 0 && (
        <fieldset>
          <legend className="meta mb-2">Syarat yang dibutuhkan</legend>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {syarat.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="syarat_ids[]" value={s.id} />
                <span>{s.nama}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="favorit" value="1" />
          <span>Favorit</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mandiri" value="1" />
          <span>Layanan Mandiri</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="kunci" value="1" />
          <span>Template dikunci</span>
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="bg-clay px-5 py-2 text-sm text-paper transition-opacity disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : "Simpan Template"}
      </button>
    </form>
  );
}

function FormEditFormat({
  f,
  syarat,
  onSelesai,
}: {
  f: Format;
  syarat: Syarat[];
  onSelesai: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const isLocked = f.kunci === 1;

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiUbahFormat(fd);
            setErr(null);
            onSelesai();
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-4 border border-ink/10 bg-paper-dim p-4"
    >
      <input type="hidden" name="id" value={f.id} />
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">
          {err}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="meta mb-1 block">Nama *</span>
          <input
            name="nama"
            defaultValue={f.nama}
            required
            disabled={isLocked}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm disabled:bg-paper-dim"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">URL Surat</span>
          <input
            name="url_surat"
            defaultValue={f.url_surat}
            disabled={isLocked}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm disabled:bg-paper-dim"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Kode Surat</span>
          <input
            name="kode_surat"
            defaultValue={f.kode_surat}
            disabled={isLocked}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm disabled:bg-paper-dim"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Jenis</span>
          <select
            name="jenis"
            defaultValue={String(f.jenis)}
            disabled={isLocked}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm disabled:bg-paper-dim"
          >
            <option value="1">Surat Desa</option>
            <option value="2">Surat Keterangan</option>
            <option value="3">Surat Izin</option>
            <option value="4">Layanan Mandiri</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="meta mb-2">Syarat</legend>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {syarat.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="syarat_ids[]"
                value={s.id}
                defaultChecked={f.syarat_ids.includes(s.id)}
                disabled={isLocked}
              />
              <span>{s.nama}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || isLocked}
          className="bg-clay px-4 py-2 text-sm text-paper disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={onSelesai}
          className="border border-ink/20 px-4 py-2 text-sm"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

// ===================== REF SYARAT =====================

function TabelSyarat({ items }: { items: Syarat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (items.length === 0) {
    return (
      <p className="meta text-2xs">
        Belum ada referensi syarat. Tambahkan pada formulir di bawah.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink/10 border border-ink/15">
      {items.map((s) => (
        <li key={s.id} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm">{s.nama}</span>
          <form
            action={(fd) => {
              if (!confirm(`Hapus syarat "${s.nama}"?`)) return;
              start(async () => {
                await aksiHapusSyarat(fd);
                router.refresh();
              });
            }}
          >
            <input type="hidden" name="id" value={s.id} />
            <button
              type="submit"
              disabled={pending}
              className="text-sm text-clay hover:underline disabled:opacity-40"
            >
              Hapus
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

function FormSyaratBaru() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahSyarat(fd);
            setErr(null);
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="flex items-end gap-3 border border-ink/15 bg-paper p-4"
    >
      <label className="flex-1">
        <span className="meta mb-1 block">Nama Syarat Baru</span>
        <input
          name="nama"
          required
          placeholder="mis. Fotokopi KTP"
          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-clay px-5 py-2 text-sm text-paper disabled:opacity-50"
      >
        {pending ? "…" : "Tambah"}
      </button>
      {err && <p className="text-sm text-clay">{err}</p>}
    </form>
  );
}