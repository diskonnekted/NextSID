// Form tambah KK + Kepala Keluarga (client component).
// Submit via server action `aksiBuatKK`.
// Setelah sukses: redirect ke /admin/kependudukan/kk/{no_kk}.

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { aksiBuatKK } from "@/modules/kependudukan/handler-kk";

type Ref = { id: number; nama: string };

type Props = {
  refData: {
    agama: Ref[];
    pekerjaan: Ref[];
    statusKawin: Ref[];
    pendidikan: Ref[];
    warganegara: Ref[];
    golonganDarah: Ref[];
  };
  configId: number;
};

function Grup({
  judul,
  deskripsi,
  children,
}: {
  judul: string;
  deskripsi?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-ink/15 bg-paper p-6">
      <legend className="px-2 font-serif text-lg">{judul}</legend>
      {deskripsi && <p className="mb-5 text-sm text-ink-muted">{deskripsi}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FormKKBaru({ refData: ref, configId }: Props) {
  const router = useRouter();
  const [sedangSimpan, mulaiSimpan] = useTransition();
  const [pesan, setPesan] = useState<{
    jenis: "sukses" | "gagal";
    teks: string;
  } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan(null);
    const fd = new FormData(e.currentTarget);
    // Tambah configId agar server action tidak perlu mencarinya.
    fd.set("_configId", String(configId));
    mulaiSimpan(async () => {
      try {
        const res = await aksiBuatKK(fd);
        if (res?.ok && res.no_kk) {
          setPesan({
            jenis: "sukses",
            teks: `KK ${res.no_kk} berhasil dibuat. Mengalihkan…`,
          });
          // Redirect ke halaman detail KK
          router.push(`/admin/kependudukan/kk/${res.no_kk}`);
        } else {
          setPesan({ jenis: "gagal", teks: "Gagal membuat KK." });
        }
      } catch (err: any) {
        setPesan({
          jenis: "gagal",
          teks: String(err?.message ?? err ?? "Terjadi kesalahan."),
        });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* === IDENTITAS KK === */}
      <Grup
        judul="Identitas Kartu Keluarga"
        deskripsi="Nomor KK dan lokasi tempat tinggal."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nomor KK *</span>
            <input
              name="no_kk"
              type="text"
              required
              minLength={16}
              maxLength={16}
              pattern="[0-9]{16}"
              placeholder="16 digit angka, contoh: 3201010101010001"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm tabular-nums focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Alamat</span>
            <textarea
              name="alamat"
              rows={2}
              placeholder="Jl. Raya Desa No. 1"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Dusun</span>
            <input
              name="dusun"
              type="text"
              placeholder="Mawar"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="meta mb-1 block">RW</span>
              <input
                name="rw"
                type="text"
                maxLength={3}
                placeholder="001"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">RT</span>
              <input
                name="rt"
                type="text"
                maxLength={3}
                placeholder="002"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
          </div>
        </div>
      </Grup>

      {/* === KEPALA KELUARGA === */}
      <Grup
        judul="Kepala Keluarga"
        deskripsi="Data kepala keluarga. NIK harus unik dan 16 digit."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nama Lengkap *</span>
            <input
              name="kepala_nama"
              type="text"
              required
              placeholder="Budi Santoso"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">NIK *</span>
            <input
              name="kepala_nik"
              type="text"
              required
              minLength={16}
              maxLength={16}
              pattern="[0-9]{16}"
              placeholder="16 digit angka, contoh: 3201010101800001"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm tabular-nums focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Jenis Kelamin *</span>
            <select
              name="kepala_sex"
              required
              defaultValue="1"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="1">Laki-laki</option>
              <option value="2">Perempuan</option>
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Tempat Lahir</span>
            <input
              name="kepala_tempatlahir"
              type="text"
              placeholder="Surabaya"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Tanggal Lahir</span>
            <input
              name="kepala_tanggallahir"
              type="date"
              max={todayIso()}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Golongan Darah</span>
            <select
              name="kepala_golongan_darah_id"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Tidak diketahui —</option>
              {ref.golonganDarah.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Agama</span>
            <select
              name="kepala_agama_id"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.agama.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Status Kawin</span>
            <select
              name="kepala_status_kawin"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.statusKawin.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Pendidikan</span>
            <select
              name="kepala_pendidikan_id"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.pendidikan.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Pekerjaan</span>
            <select
              name="kepala_pekerjaan_id"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.pekerjaan.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kewarganegaraan</span>
            <select
              name="kepala_warganegara_id"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.warganegara.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Grup>

      {/* === STATUS & PESAN === */}
      {pesan && (
        <div
          role="status"
          className={`border px-4 py-3 text-sm ${
            pesan.jenis === "sukses"
              ? "border-green-700/30 bg-green-50 text-green-900"
              : "border-red-700/30 bg-red-50 text-red-900"
          }`}
        >
          {pesan.teks}
        </div>
      )}

      {/* === ACTIONS === */}
      <div className="flex flex-col gap-2 border-t border-ink/15 pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/admin/kk"
          className="meta border border-ink/20 bg-paper px-4 py-2 text-center normal-case tracking-normal hover:border-ink"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={sedangSimpan}
          className="meta border border-ink bg-ink px-6 py-2 normal-case tracking-normal text-paper hover:bg-clay disabled:opacity-50"
        >
          {sedangSimpan ? "Menyimpan…" : "Simpan KK"}
        </button>
      </div>
    </form>
  );
}
