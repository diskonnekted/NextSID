"use client";

// Panel CRUD untuk halaman detail Penduduk.
// Menampilkan info ringkas + form edit inline + tombol hapus.

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  aksiEditPenduduk,
  aksiHapusPenduduk,
} from "@/modules/kependudukan/handler";

type Ref = { id: number; nama: string };
type KKOption = { no_kk: string; kepala: string | null };

type Detail = {
  id: number;
  nik: string;
  nama: string;
  no_kk: string | null;
  sex: number | null;
  tempatlahir: string | null;
  tanggallahir: string | null;
  kk_level: number | null;
  hubungan_kk: string | null;
  status_kawin: number | null;
  status_kawin_nama: string | null;
  agama: string | null;
  agama_id: number | null;
  pekerjaan: string | null;
  pekerjaan_id: number | null;
  pendidikan: string | null;
  pendidikan_kk_id: number | null;
  warganegara: string | null;
  warganegara_id: number | null;
  golongan_darah: string | null;
  golongan_darah_id: number | null;
  keluarga: {
    no_kk: string;
    alamat: string | null;
    dusun: string | null;
    rw: string | null;
    rt: string | null;
  } | null;
  ayah: { nik: string; nama: string } | null;
  ibu: { nik: string; nama: string } | null;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  detail: Detail;
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

function dateIso(v: string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatTanggalIndo(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function Pesan({
  jenis,
  teks,
}: {
  jenis: "sukses" | "gagal";
  teks: string;
}) {
  return (
    <div
      role="status"
      className={`border px-3 py-2 text-sm ${
        jenis === "sukses"
          ? "border-green-700/30 bg-green-50 text-green-900"
          : "border-red-700/30 bg-red-50 text-red-900"
      }`}
    >
      {teks}
    </div>
  );
}

export default function PanelDetailPenduduk({
  detail,
  refData: ref,
  kkList,
}: Props) {
  const router = useRouter();
  const [sedangSimpan, mulaiSimpan] = useTransition();
  const [modeEdit, setModeEdit] = useState(false);
  const [pesan, setPesan] = useState<{
    jenis: "sukses" | "gagal";
    teks: string;
  } | null>(null);

  const isKepala = detail.kk_level === 1;

  function onSubmitEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesan(null);
    const fd = new FormData(e.currentTarget);
    fd.set("nikAsal", detail.nik);
    mulaiSimpan(async () => {
      try {
        const res = await aksiEditPenduduk(fd);
        if (res?.ok) {
          setPesan({ jenis: "sukses", teks: "Data penduduk diperbarui." });
          setModeEdit(false);
          router.refresh();
        } else {
          setPesan({ jenis: "gagal", teks: "Gagal memperbarui." });
        }
      } catch (err: any) {
        setPesan({
          jenis: "gagal",
          teks: String(err?.message ?? err ?? "Terjadi kesalahan."),
        });
      }
    });
  }

  function onHapus() {
    if (isKepala) {
      alert(
        "Penduduk ini adalah kepala keluarga. Hapus KK seluruhnya dari halaman detail KK.",
      );
      return;
    }
    if (
      !window.confirm(
        `Hapus penduduk ${detail.nama} (NIK ${detail.nik})? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }
    mulaiSimpan(async () => {
      try {
        const res = await aksiHapusPenduduk(detail.nik);
        if (res?.ok) {
          router.push("/admin/kependudukan");
        }
      } catch (err: any) {
        alert(`Gagal menghapus: ${String(err?.message ?? err)}`);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* === AKSI === */}
      <div className="flex flex-col gap-2 border border-ink/15 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="meta">Aksi Penduduk</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setModeEdit((v) => !v);
              setPesan(null);
            }}
            className="meta border border-ink/20 bg-paper px-3 py-1.5 normal-case tracking-normal hover:border-ink"
          >
            {modeEdit ? "Batal Edit" : "Edit"}
          </button>
          <button
            type="button"
            onClick={onHapus}
            disabled={isKepala}
            className="meta border border-red-700/40 bg-paper px-3 py-1.5 normal-case tracking-normal text-red-800 hover:border-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            title={
              isKepala
                ? "Kepala keluarga tidak dapat dihapus dari sini. Hapus KK saja."
                : "Hapus penduduk"
            }
          >
            Hapus
          </button>
        </div>
      </div>

      {/* === RINGKASAN === */}
      <section
        aria-labelledby="ringkasan-heading"
        className="border border-ink/15 bg-paper p-6"
      >
        <h2 id="ringkasan-heading" className="meta mb-4">
          Ringkasan
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="meta">NIK</dt>
            <dd className="font-mono text-base tabular-nums">{detail.nik}</dd>
          </div>
          <div>
            <dt className="meta">Nama</dt>
            <dd className="font-serif text-lg">{detail.nama}</dd>
          </div>
          <div>
            <dt className="meta">Jenis Kelamin</dt>
            <dd>
              {detail.sex === 1
                ? "Laki-laki"
                : detail.sex === 2
                  ? "Perempuan"
                  : "—"}
            </dd>
          </div>
          <div>
            <dt className="meta">Tempat, Tgl Lahir</dt>
            <dd>
              {detail.tempatlahir ?? "—"}, {formatTanggalIndo(detail.tanggallahir)}
            </dd>
          </div>
          <div>
            <dt className="meta">Agama</dt>
            <dd>{detail.agama ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Pekerjaan</dt>
            <dd>{detail.pekerjaan ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Pendidikan</dt>
            <dd>{detail.pendidikan ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Status Kawin</dt>
            <dd>{detail.status_kawin_nama ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Kewarganegaraan</dt>
            <dd>{detail.warganegara ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Golongan Darah</dt>
            <dd>{detail.golongan_darah ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="meta">Kartu Keluarga</dt>
            <dd>
              {detail.keluarga ? (
                <Link
                  href={`/admin/kependudukan/kk/${detail.keluarga.no_kk}`}
                  className="font-mono text-sm underline decoration-ink/20 underline-offset-2 hover:text-clay hover:decoration-clay"
                >
                  {detail.keluarga.no_kk}
                  {detail.hubungan_kk ? ` · ${detail.hubungan_kk}` : ""}
                </Link>
              ) : (
                <span>— (belum terikat KK)</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="meta">Ayah</dt>
            <dd>
              {detail.ayah ? (
                <>
                  <Link
                    href={`/admin/kependudukan/${detail.ayah.nik}`}
                    className="hover:text-clay"
                  >
                    {detail.ayah.nama}
                  </Link>
                  <span className="meta ml-2 text-2xs">NIK {detail.ayah.nik}</span>
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="meta">Ibu</dt>
            <dd>
              {detail.ibu ? (
                <>
                  <Link
                    href={`/admin/kependudukan/${detail.ibu.nik}`}
                    className="hover:text-clay"
                  >
                    {detail.ibu.nama}
                  </Link>
                  <span className="meta ml-2 text-2xs">NIK {detail.ibu.nik}</span>
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
        <p className="meta mt-6 border-t border-ink/10 pt-4">
          Dicatat {formatTanggalIndo(detail.created_at)} · Diperbarui{" "}
          {formatTanggalIndo(detail.updated_at)}
        </p>
      </section>

      {/* === FORM EDIT === */}
      {modeEdit && (
        <form
          onSubmit={onSubmitEdit}
          className="space-y-4 border border-ink/15 bg-paper p-5"
        >
          <p className="meta">Edit data {detail.nama}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">NIK (baru)</span>
              <input
                name="nik"
                type="text"
                minLength={16}
                maxLength={16}
                pattern="[0-9]{16}"
                defaultValue={detail.nik}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm tabular-nums focus:border-clay focus:outline-none"
              />
              <span className="meta mt-1 block text-2xs text-ink-muted">
                Kosongkan jika tidak ingin mengubah NIK.
              </span>
            </label>
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">Nama *</span>
              <input
                name="nama"
                type="text"
                required
                defaultValue={detail.nama}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">Jenis Kelamin</span>
              <select
                name="sex"
                defaultValue={detail.sex ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
                <option value="1">Laki-laki</option>
                <option value="2">Perempuan</option>
              </select>
            </label>
            <label className="block">
              <span className="meta mb-1 block">Tempat Lahir</span>
              <input
                name="tempatlahir"
                type="text"
                defaultValue={detail.tempatlahir ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">Tanggal Lahir</span>
              <input
                name="tanggallahir"
                type="date"
                max={todayIso()}
                defaultValue={dateIso(detail.tanggallahir)}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">Kartu Keluarga</span>
              <select
                name="no_kk"
                defaultValue={detail.no_kk ?? ""}
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
                defaultValue={detail.kk_level ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
                {ref.hubunganKK.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="meta mb-1 block">Agama</span>
              <select
                name="agama_id"
                defaultValue={detail.agama_id ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
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
                defaultValue={detail.status_kawin ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
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
                defaultValue={detail.pendidikan_kk_id ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
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
                defaultValue={detail.pekerjaan_id ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
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
                defaultValue={detail.warganegara_id ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
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
                defaultValue={detail.golongan_darah_id ?? ""}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                <option value="">— Tidak diubah —</option>
                {ref.golonganDarah.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {pesan && <Pesan jenis={pesan.jenis} teks={pesan.teks} />}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setModeEdit(false);
                setPesan(null);
              }}
              className="meta border border-ink/20 bg-paper px-4 py-2 normal-case tracking-normal hover:border-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sedangSimpan}
              className="meta border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay disabled:opacity-50"
            >
              {sedangSimpan ? "Menyimpan…" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}