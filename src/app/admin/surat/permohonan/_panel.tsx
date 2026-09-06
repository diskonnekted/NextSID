// Client component panel Permohonan Surat.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aksiTambahPermohonan,
  aksiUbahPermohonan,
  aksiSetStatusPermohonan,
  aksiHapusPermohonan,
  aksiCetakDariPermohonan,
} from "@/modules/surat/handler";

type Permohonan = {
  id: number;
  no_antrian: string;
  id_pemohon: number;
  nama_pemohon: string;
  nik_pemohon: string;
  id_surat: number;
  nama_surat: string;
  status: number;
  status_label: string;
  alasan: string;
  keterangan: string;
  no_hp_aktif: string;
  created_at: string;
};

function badgeStatus(s: number) {
  const cls =
    s === 4
      ? "border-emerald-700/40 text-emerald-700"
      : s === 5
        ? "border-clay text-clay"
        : s === 3
          ? "border-amber-700/40 text-amber-700"
          : "border-ink/30 text-ink-muted";
  return `meta mr-2 border px-1.5 py-0.5 text-2xs ${cls}`;
}

export default function PanelPermohonan({
  items,
  format,
  penduduk,
  statusMap,
}: {
  items: Permohonan[];
  format: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  statusMap: Record<number, string>;
}) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="perm-heading" className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h3 id="perm-heading" className="font-serif text-xl">
            Permohonan ({items.length} entri)
          </h3>
        </div>
        <Tabel items={items} />
        <FormBaru format={format} penduduk={penduduk} statusMap={statusMap} />
      </section>
    </div>
  );
}

function Tabel({ items }: { items: Permohonan[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="meta text-2xs">
        Belum ada permohonan. Tambahkan pada formulir di bawah (atau warga
        akan mengajukannya lewat Layanan Mandiri).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-paper-dim">
          <tr>
            <th className="meta px-3 py-2 text-left">Antrian / Tanggal</th>
            <th className="meta px-3 py-2 text-left">Pemohon</th>
            <th className="meta px-3 py-2 text-left">Jenis Surat</th>
            <th className="meta px-3 py-2 text-left">Status</th>
            <th className="meta px-3 py-2 text-left">HP</th>
            <th className="meta px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-ink/10 align-top">
              {editingId === p.id ? (
                <td colSpan={6} className="px-3 py-3">
                  <FormEdit p={p} onSelesai={() => setEditingId(null)} />
                </td>
              ) : (
                <>
                  <td className="px-3 py-2 font-mono text-xs">
                    <div>#{p.no_antrian}</div>
                    <div className="text-ink-muted">
                      {new Date(p.created_at).toLocaleDateString("id-ID")}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.nama_pemohon}</div>
                    <div className="meta text-2xs">{p.nik_pemohon}</div>
                  </td>
                  <td className="px-3 py-2">{p.nama_surat}</td>
                  <td className="px-3 py-2">
                    <span className={badgeStatus(p.status)}>{p.status_label}</span>
                    <form
                      action={(fd) => {
                        start(async () => {
                          await aksiSetStatusPermohonan(fd);
                          router.refresh();
                        });
                      }}
                      className="mt-1 inline-block"
                    >
                      <input type="hidden" name="id" value={p.id} />
                      <select
                        name="status"
                        defaultValue={String(p.status)}
                        onChange={(e) =>
                          (e.currentTarget.form as HTMLFormElement).requestSubmit()
                        }
                        className="border border-ink/20 bg-paper px-1 py-0.5 text-xs"
                      >
                        {Object.entries({
                          0: "Belum Lengkap",
                          1: "Sedang Diperiksa",
                          2: "Menunggu TTD",
                          3: "Siap Diambil",
                          4: "Sudah Diambil",
                          5: "Dibatalkan",
                        }).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </form>
                    {p.alasan && (
                      <div className="meta mt-1 text-2xs italic">
                        “{p.alasan}”
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">{p.no_hp_aktif || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <a
                      href={`/admin/surat/cetak/${p.id}`}
                      className="text-clay hover:underline"
                    >
                      Cetak
                    </a>
                    <button
                      type="button"
                      className="ml-3 text-clay hover:underline"
                      onClick={() => setEditingId(p.id)}
                    >
                      Ubah
                    </button>
                    <form
                      action={(fd) => {
                        if (!confirm(`Hapus permohonan #${p.no_antrian}?`)) return;
                        start(async () => {
                          await aksiHapusPermohonan(fd);
                          router.refresh();
                        });
                      }}
                      className="ml-3 inline"
                    >
                      <input type="hidden" name="id" value={p.id} />
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
  format,
  penduduk,
  statusMap,
}: {
  format: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  statusMap: Record<number, string>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahPermohonan(fd);
            setErr(null);
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-4 border border-ink/15 bg-paper p-6"
    >
      <h4 className="font-serif text-lg">Tambah Permohonan (Manual)</h4>
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="meta mb-1 block">Pemohon *</span>
          <select
            name="id_pemohon"
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— pilih penduduk —</option>
            {penduduk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Jenis Surat *</span>
          <select
            name="id_surat"
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— pilih template —</option>
            {format.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Status</span>
          <select
            name="status"
            defaultValue="0"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            {Object.entries(statusMap).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">No. HP Aktif</span>
          <input
            name="no_hp_aktif"
            placeholder="08..."
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Keterangan</span>
          <input
            name="keterangan"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Alasan (jika ditolak)</span>
          <input
            name="alasan"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-clay px-5 py-2 text-sm text-paper disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : "Simpan Permohonan"}
      </button>
    </form>
  );
}

function FormEdit({ p, onSelesai }: { p: Permohonan; onSelesai: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiUbahPermohonan(fd);
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
      <input type="hidden" name="id" value={p.id} />
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="meta mb-1 block">No. HP Aktif</span>
          <input
            name="no_hp_aktif"
            defaultValue={p.no_hp_aktif}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">No. Antrian</span>
          <input
            name="no_antrian"
            defaultValue={p.no_antrian}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Keterangan</span>
          <input
            name="keterangan"
            defaultValue={p.keterangan}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Alasan</span>
          <input
            name="alasan"
            defaultValue={p.alasan}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
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