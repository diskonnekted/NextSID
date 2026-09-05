"use client";

// Form tambah satu Penduduk (perorangan, tanpa terikat KK).
// Submit via server action `aksiBuatPenduduk`.
// Setelah sukses: redirect ke halaman detail penduduk.

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { aksiBuatPenduduk } from "@/modules/kependudukan/handler";

type Ref = { id: number; nama: string };
type KKOption = { no_kk: string; kepala: string | null };

type Props = {
  refData: {
    agama: Ref[];
    pekerjaan: Ref[];
    statusKawin: Ref[];
    pendidikan: Ref[];
    hubunganKK: Ref[];
    warganegara: Ref[];
    golonganDarah: Ref[];
  };
  kkList: KKOption[];
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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

export default function FormPendudukBaru({ refData: ref, kkList }: Props) {
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
    mulaiSimpan(async () => {
      try {
        const res = await aksiBuatPenduduk(fd);
        if (res?.ok && res.nik) {
          setPesan({
            jenis: "sukses",
            teks: `Penduduk NIK ${res.nik} berhasil ditambah. Mengalihkan…`,
          });
          router.push(`/admin/kependudukan/${res.nik}`);
        } else {
          setPesan({ jenis: "gagal", teks: "Gagal menambah penduduk." });
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
      {/* === IDENTITAS UTAMA === */}
      <Grup
        judul="Identitas Utama"
        deskripsi="Wajib diisi. NIK harus 16 digit angka dan unik."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">NIK *</span>
            <input
              name="nik"
              type="text"
              required
              minLength={16}
              maxLength={16}
              pattern="[0-9]{16}"
              placeholder="3201010101800001"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm tabular-nums focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Nama Lengkap *</span>
            <input
              name="nama"
              type="text"
              required
              placeholder="Budi Santoso"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Jenis Kelamin *</span>
            <select
              name="sex"
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
              name="tempatlahir"
              type="text"
              placeholder="Surabaya"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Tanggal Lahir</span>
            <input
              name="tanggallahir"
              type="date"
              max={todayIso()}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </Grup>

      {/* === HUBUNGAN KELUARGA === */}
      <Grup
        judul="Hubungan dalam Keluarga"
        deskripsi="Opsional. Kosongkan jika penduduk belum terikat KK."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nomor Kartu Keluarga</span>
            <select
              name="no_kk"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Tidak terikat KK —</option>
              {kkList.map((k) => (
                <option key={k.no_kk} value={k.no_kk}>
                  {k.no_kk}
                  {k.kepala ? ` · ${k.kepala}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Hubungan dalam KK</span>
            <select
              name="kk_level"
              defaultValue=""
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="">— Pilih —</option>
              {ref.hubunganKK.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama}
                </option>
              ))}
            </select>
            <span className="meta mt-1 block text-2xs text-ink-muted">
              Pilih &ldquo;Kepala Keluarga&rdquo; (id=1) jika ini adalah kepala KK baru.
            </span>
          </label>
        </div>
      </Grup>

      {/* === DATA DEMOGRAFI === */}
      <Grup
        judul="Data Demografi"
        deskripsi="Opsional. Bisa diisi sekarang atau belakangan."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Agama</span>
            <select
              name="agama_id"
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
              name="status_kawin"
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
              name="pendidikan_kk_id"
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
              name="pekerjaan_id"
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
              name="warganegara_id"
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
          <label className="block">
            <span className="meta mb-1 block">Golongan Darah</span>
            <select
              name="golongan_darah_id"
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
        </div>
      </Grup>

      {/* === PESAN === */}
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
          href="/admin/kependudukan"
          className="meta border border-ink/20 bg-paper px-4 py-2 text-center normal-case tracking-normal hover:border-ink"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={sedangSimpan}
          className="meta border border-ink bg-ink px-6 py-2 normal-case tracking-normal text-paper hover:bg-clay disabled:opacity-50"
        >
          {sedangSimpan ? "Menyimpan…" : "Simpan Penduduk"}
        </button>
      </div>
    </form>
  );
}