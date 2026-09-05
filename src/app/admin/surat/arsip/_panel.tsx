// Client component panel Arsip Cetak (LogSurat).

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aksiTambahLogSurat,
  aksiUbahLogSurat,
  aksiSetStatusLogSurat,
  aksiSoftHapusLogSurat,
  aksiTambahLogTolak,
} from "@/modules/surat/handler";

type Log = {
  id: number;
  nama_surat: string;
  kode_surat: string | null;
  no_surat: string;
  tanggal: string;
  nama_pamong: string;
  nama_penduduk: string;
  status: number;
  id_format_surat: number;
  id_pend: number | null;
  id_pamong: number | null;
  verifikasi_operator: number;
  verifikasi_kades: number;
  verifikasi_sekdes: number;
};

function labelStatus(s: number) {
  if (s === 1) return "CETAK";
  if (s === -1) return "TOLAK";
  return "KONSEP";
}

function badgeStatus(s: number) {
  const cls =
    s === 1
      ? "border-emerald-700/40 text-emerald-700"
      : s === -1
        ? "border-clay text-clay"
        : "border-ink/30 text-ink-muted";
  return `meta mr-2 border px-1.5 py-0.5 text-2xs ${cls}`;
}

function verifikasi(v: number) {
  return v === 1 ? "✓" : "—";
}

export default function PanelArsip({
  items,
  format,
  penduduk,
  pamong,
}: {
  items: Log[];
  format: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  pamong: { id: number; label: string }[];
}) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="arsip-heading" className="space-y-6">
        <div className="flex items-baseline justify-between">
          <h3 id="arsip-heading" className="font-serif text-xl">
            Arsip ({items.length} entri)
          </h3>
        </div>
        <TabelLog items={items} pamong={pamong} />
        <FormLogBaru format={format} penduduk={penduduk} pamong={pamong} />
      </section>
    </div>
  );
}

function TabelLog({ items, pamong }: { items: Log[]; pamong: { id: number; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tolakId, setTolakId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="meta text-2xs">
        Belum ada arsip cetak. Buat log baru pada formulir di bawah.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-ink/15">
      <table className="w-full text-sm">
        <thead className="bg-paper-dim">
          <tr>
            <th className="meta px-3 py-2 text-left">Tanggal / No</th>
            <th className="meta px-3 py-2 text-left">Surat</th>
            <th className="meta px-3 py-2 text-left">Pemohon</th>
            <th className="meta px-3 py-2 text-left">Pamong</th>
            <th className="meta px-3 py-2 text-left">Status</th>
            <th className="meta px-3 py-2 text-left">Verifikasi</th>
            <th className="meta px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} className="border-t border-ink/10 align-top">
              {editingId === l.id ? (
                <td colSpan={7} className="px-3 py-3">
                  <FormEditLog l={l} pamong={pamong} onSelesai={() => setEditingId(null)} />
                </td>
              ) : tolakId === l.id ? (
                <td colSpan={7} className="px-3 py-3">
                  <FormTolak idSurat={l.id} onSelesai={() => setTolakId(null)} />
                </td>
              ) : (
                <>
                  <td className="px-3 py-2 font-mono text-xs">
                    <div>{l.tanggal}</div>
                    {l.no_surat && (
                      <div className="text-ink-muted">{l.no_surat}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.nama_surat}</div>
                    {l.kode_surat && (
                      <div className="meta text-2xs">{l.kode_surat}</div>
                    )}
                  </td>
                  <td className="px-3 py-2">{l.nama_penduduk}</td>
                  <td className="px-3 py-2">{l.nama_pamong}</td>
                  <td className="px-3 py-2">
                    <span className={badgeStatus(l.status)}>{labelStatus(l.status)}</span>
                    <form
                      action={(fd) => {
                        start(async () => {
                          await aksiSetStatusLogSurat(fd);
                          router.refresh();
                        });
                      }}
                      className="mt-1 inline-block"
                    >
                      <input type="hidden" name="id" value={l.id} />
                      <select
                        name="status"
                        defaultValue={String(l.status)}
                        onChange={(e) => {
                          (e.currentTarget.form as HTMLFormElement).requestSubmit();
                        }}
                        className="border border-ink/20 bg-paper px-1 py-0.5 text-xs"
                      >
                        <option value="-1">TOLAK</option>
                        <option value="0">KONSEP</option>
                        <option value="1">CETAK</option>
                      </select>
                    </form>
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted">
                    OP:{verifikasi(l.verifikasi_operator)} ·
                    Sekdes:{verifikasi(l.verifikasi_sekdes)} ·
                    Kades:{verifikasi(l.verifikasi_kades)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-clay hover:underline"
                      onClick={() => setEditingId(l.id)}
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      className="ml-3 text-clay hover:underline"
                      onClick={() => setTolakId(l.id)}
                    >
                      Tolak
                    </button>
                    <form
                      action={(fd) => {
                        if (!confirm("Hapus (soft) arsip ini?")) return;
                        start(async () => {
                          await aksiSoftHapusLogSurat(fd);
                          router.refresh();
                        });
                      }}
                      className="ml-3 inline"
                    >
                      <input type="hidden" name="id" value={l.id} />
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

function FormLogBaru({
  format,
  penduduk,
  pamong,
}: {
  format: { id: number; nama: string }[];
  penduduk: { id: number; label: string }[];
  pamong: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahLogSurat(fd);
            setErr(null);
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-4 border border-ink/15 bg-paper p-6"
    >
      <h4 className="font-serif text-lg">Tambah Arsip Manual</h4>
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="meta mb-1 block">Template *</span>
          <select
            name="id_format_surat"
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
          <span className="meta mb-1 block">Tanggal</span>
          <input
            type="date"
            name="tanggal"
            defaultValue={today}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Penduduk</span>
          <select
            name="id_pend"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— bukan penduduk / pilih nanti —</option>
            {penduduk.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">Pamong Penandatangan</span>
          <select
            name="id_pamong"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">— belum ditentukan —</option>
            {pamong.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="meta mb-1 block">No Surat</span>
          <input
            name="no_surat"
            placeholder="mis. 470/001/2026"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Status</span>
          <select
            name="status"
            defaultValue="1"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="0">KONSEP</option>
            <option value="1">CETAK</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="meta mb-1 block">Keterangan</span>
          <input
            name="keterangan"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-clay px-5 py-2 text-sm text-paper disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : "Simpan Arsip"}
      </button>
    </form>
  );
}

function FormEditLog({
  l,
  pamong,
  onSelesai,
}: {
  l: Log;
  pamong: { id: number; label: string }[];
  onSelesai: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiUbahLogSurat(fd);
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
      <input type="hidden" name="id" value={l.id} />
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="meta mb-1 block">No Surat</span>
          <input
            name="no_surat"
            defaultValue={l.no_surat}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Tanggal</span>
          <input
            type="date"
            name="tanggal"
            defaultValue={l.tanggal}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="meta mb-1 block">Pamong</span>
          <select
            name="id_pamong"
            defaultValue={String(l.id_pamong ?? "")}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {pamong.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
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

function FormTolak({
  idSurat,
  onSelesai,
}: {
  idSurat: number;
  onSelesai: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        start(async () => {
          try {
            await aksiTambahLogTolak(fd);
            await fd2SetStatus(fd, idSurat, -1);
            setErr(null);
            onSelesai();
            router.refresh();
          } catch (e) {
            setErr((e as Error).message);
          }
        });
      }}
      className="space-y-3 border border-ink/10 bg-paper-dim p-4"
    >
      <input type="hidden" name="id_surat" value={idSurat} />
      <p className="font-serif text-lg">Tolak / Catat Penolakan</p>
      {err && (
        <p className="border border-clay bg-clay/10 px-3 py-2 text-sm text-clay">{err}</p>
      )}
      <label className="block">
        <span className="meta mb-1 block">Alasan *</span>
        <input
          name="alasan"
          required
          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-clay px-4 py-2 text-sm text-paper disabled:opacity-50"
        >
          {pending ? "…" : "Simpan Penolakan"}
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

// helper kecil: panggil setStatus dengan fd tiruan
async function fd2SetStatus(_fd: FormData, id: number, status: number) {
  const fd = new FormData();
  fd.append("id", String(id));
  fd.append("status", String(status));
  await aksiSetStatusLogSurat(fd);
}