// Client component panel Dokumen.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aksiTambahDokumen,
  aksiUbahDokumen,
  aksiSoftHapusDokumen,
} from "@/modules/surat/handler";

type Dokumen = {
  id: number;
  nama: string;
  kategori: number;
  kategori_label: string;
  id_pend: number | null;
  id_syarat: number | null;
  enabled: number;
  satuan: string;
  lokasi_arsip: string;
  tipe: string;
  url: string;
  tahun: string;
  tgl_upload: string;
  dok_warga: number;
};

export default function PanelDokumen({
  items,
  syarat,
  penduduk,
  kategoriMap,
}: {
  items: Dokumen[];
  syarat: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  kategoriMap: Record<number, string>;
}) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="dok-heading" className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h3 id="dok-heading" className="font-serif text-xl">
            Daftar Dokumen ({items.length})
          </h3>
        </div>
        <Tabel items={items} />
        <FormBaru syarat={syarat} penduduk={penduduk} kategoriMap={kategoriMap} />
      </section>
    </div>
  );
}

function Tabel({ items }: { items: Dokumen[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="meta text-2xs">
        Belum ada dokumen. Tambahkan pada formulir di bawah.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-paper-dim">
          <tr>
            <th className="meta px-3 py-2 text-left">Nama</th>
            <th className="meta px-3 py-2 text-left">Kategori</th>
            <th className="meta px-3 py-2 text-left">Tipe/Satuan</th>
            <th className="meta px-3 py-2 text-left">Tahun</th>
            <th className="meta px-3 py-2 text-left">Status</th>
            <th className="meta px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-t border-ink/10 align-top">
              {editingId === d.id ? (
                <td colSpan={6} className="px-3 py-3">
                  <FormEdit d={d} onSelesai={() => setEditingId(null)} />
                </td>
              ) : (
                <>
                  <td className="px-3 py-2">
                    <div className="font-medium">{d.nama}</div>
                    {d.lokasi_arsip && (
                      <div className="meta text-2xs">{d.lokasi_arsip}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">{d.kategori_label}</td>
                  <td className="px-3 py-2 text-ink-muted">
                    <div>{d.tipe || "—"}</div>
                    {d.satuan && <div className="meta text-2xs">{d.satuan}</div>}
                  </td>
                  <td className="px-3 py-2">{d.tahun || "—"}</td>
                  <td className="px-3 py-2">
                    {d.enabled === 1 ? (
                      <span className="meta border border-emerald-700/40 px-1.5 py-0.5 text-2xs text-emerald-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="meta border border-ink/30 px-1.5 py-0.5 text-2xs text-ink-muted">
                        Nonaktif
                      </span>
                    )}
                    {d.dok_warga === 1 && (
                      <span className="meta ml-1 border border-ink/20 px-1.5 py-0.5 text-2xs">
                        Warga
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-clay hover:underline"
                      onClick={() => setEditingId(d.id)}
                    >
                      Ubah
                    </button>
                    <form
                      action={(fd) => {
                        if (!confirm(`Soft-hapus dokumen "${d.nama}"?`)) return;
                        start(async () => {
                          await aksiSoftHapusDokumen(fd);
                          router.refresh();
                        });
                      }}
                      className="ml-3 inline"
                    >
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        disabled={pending}
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

function FormBaru({
  syarat,
  penduduk,
  kategoriMap,
}: {
  syarat: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  kategoriMap: Record<number, string>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahDokumen(fd);
            setErr(null);
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-4 border border-ink/15 bg-paper p-6"
    >
      <h4 className="font-serif text-lg">Tambah Dokumen</h4>
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Nama *</span>
          <input
            name="nama"
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Kategori</span>
          <select
            name="kategori"
            defaultValue="1"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            {Object.entries(kategoriMap).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Tipe</span>
          <input
            name="tipe"
            placeholder="mis. pdf, jpg"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Satuan</span>
          <input
            name="satuan"
            placeholder="lembar, bundel"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Tahun</span>
          <input
            name="tahun"
            type="number"
            placeholder="2026"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Lokasi Arsip</span>
          <input
            name="lokasi_arsip"
            placeholder="mis. Lemari A / Rak 2"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">URL File</span>
          <input
            name="url"
            placeholder="/upload/..."
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Penduduk (jika dok. warga)</span>
          <select
            name="id_pend"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— bukan per-penduduk —</option>
            {penduduk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Syarat terkait</span>
          <select
            name="id_syarat"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— tidak terkait —</option>
            {syarat.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" value="1" defaultChecked />
          <span>Aktif</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="dok_warga" value="1" />
          <span>Dokumen warga</span>
        </label>
      </fieldset>
      <button
        type="submit"
        disabled={pending}
        className="bg-clay px-5 py-2 text-sm text-paper disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : "Simpan Dokumen"}
      </button>
    </form>
  );
}

function FormEdit({ d, onSelesai }: { d: Dokumen; onSelesai: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiUbahDokumen(fd);
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
      <input type="hidden" name="id" value={d.id} />
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Nama</span>
          <input
            name="nama"
            defaultValue={d.nama}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Tipe</span>
          <input
            name="tipe"
            defaultValue={d.tipe}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Tahun</span>
          <input
            name="tahun"
            defaultValue={d.tahun}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Lokasi Arsip</span>
          <input
            name="lokasi_arsip"
            defaultValue={d.lokasi_arsip}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">URL</span>
          <input
            name="url"
            defaultValue={d.url}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            value="1"
            defaultChecked={d.enabled === 1}
          />
          <span>Aktif</span>
        </label>
      </fieldset>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
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