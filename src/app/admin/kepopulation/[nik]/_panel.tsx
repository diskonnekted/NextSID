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
  foto: string | null;
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
  pendidikan_sedang: string | null;
  pendidikan_sedang_id: number | null;
  warganegara: string | null;
  warganegara_id: number | null;
  golongan_darah: string | null;
  golongan_darah_id: number | null;
  cacat: string | null;
  cacat_id: number | null;
  cara_kb: string | null;
  cara_kb_id: number | null;
  hamil: number | null;
  ktp_el: number | null;
  status_rekam: number | null;
  status_dasar: number | null;
  status_dasar_ref: string | null;
  id_asuransi: number | null;
  asuransi: string | null;
  ayah_nik: string | null;
  nama_ayah: string | null;
  ibu_nik: string | null;
  nama_ibu: string | null;
  akta_lahir: string | null;
  dokumen_pasport: string | null;
  tanggal_akhir_paspor: Date | string | null;
  dokumen_kitas: string | null;
  akta_perkawinan: string | null;
  tanggalperkawinan: Date | string | null;
  akta_perceraian: string | null;
  tanggalperceraian: Date | string | null;
  alamat_sekarang: string | null;
  suku: string | null;
  tag_id_card: string | null;
  no_asuransi: string | null;
  lat: string | null;
  lng: string | null;
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
    cacat: Ref[];
    caraKB: Ref[];
    statusDasar: Ref[];
    asuransi: Ref[];
  };
  kkList: KKOption[];
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateIso(v: Date | string | null | undefined): string {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatTanggalIndo(d: Date | string | null | undefined): string {
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
          Identitas
        </h2>
        <div className="flex items-center gap-4 sm:hidden">
          {/* Foto — tampil hanya di mobile */}
          {detail.foto && (
            <img
              src={`/${detail.foto}`}
              alt={detail.nama}
              className="h-24 w-24 shrink-0 rounded-sm border border-ink/10 object-cover bg-paper-dim"
            />
          )}
          <div className="min-w-0">
            <p className="font-serif text-lg leading-tight">{detail.nama}</p>
            <p className="mt-1 font-mono text-sm tabular-nums text-ink-muted">{detail.nik}</p>
          </div>
        </div>
        <dl className="hidden grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid sm:contents">
          <div>
            <dt className="meta">Foto</dt>
            <dd>
              {detail.foto ? (
                <img
                  src={`/${detail.foto}`}
                  alt={detail.nama}
                  className="h-16 w-16 rounded-sm border border-ink/10 object-cover bg-paper-dim"
                />
              ) : (
                <span className="text-ink-muted">—</span>
              )}
            </dd>
          </div>
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
            <dt className="meta">Suku</dt>
            <dd>{detail.suku ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Agama</dt>
            <dd>{detail.agama ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Status Kawin</dt>
            <dd>{detail.status_kawin_nama ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Pendidikan KK</dt>
            <dd>{detail.pendidikan ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Pendidikan Sedang</dt>
            <dd>{detail.pendidikan_sedang ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Pekerjaan</dt>
            <dd>{detail.pekerjaan ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Kewarganegaraan</dt>
            <dd>{detail.warganegara ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Golongan Darah</dt>
            <dd>{detail.golongan_darah ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Kategori Cacat</dt>
            <dd>{detail.cacat ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Cara KB</dt>
            <dd>{detail.cara_kb ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Status Dasar</dt>
            <dd>{detail.status_dasar_ref ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Asuransi</dt>
            <dd>{detail.asuransi ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Hamil</dt>
            <dd>{detail.hamil === 1 ? "Ya" : detail.hamil === 0 ? "Tidak" : "—"}</dd>
          </div>
          <div>
            <dt className="meta">KTP Elektronik</dt>
            <dd>{detail.ktp_el === 1 ? "Ya" : detail.ktp_el === 0 ? "Tidak" : "—"}</dd>
          </div>
          <div>
            <dt className="meta">Status Rekam</dt>
            <dd>{detail.status_rekam ?? "—"}</dd>
          </div>
        </dl>

        <h2 id="kk-heading" className="meta mb-4 mt-8">
          Kartu Keluarga & Wilayah
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
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
            <dt className="meta">Alamat</dt>
            <dd>{detail.keluarga?.alamat ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Dusun</dt>
            <dd>{detail.keluarga?.dusun ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">RW</dt>
            <dd>{detail.keluarga?.rw ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">RT</dt>
            <dd>{detail.keluarga?.rt ?? "—"}</dd>
          </div>
        </dl>

        <h2 id="keluarga-heading" className="meta mb-4 mt-8">
          Data Keluarga
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
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
                detail.nama_ayah ? detail.nama_ayah : "—"
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
                detail.nama_ibu ? detail.nama_ibu : "—"
              )}
            </dd>
          </div>
        </dl>

        <h2 id="dokumen-heading" className="meta mb-4 mt-8">
          Dokumen
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="meta">No. Akta Lahir</dt>
            <dd>{detail.akta_lahir ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">No. Paspor</dt>
            <dd>{detail.dokumen_pasport ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Akhir Paspor</dt>
            <dd>{formatTanggalIndo(detail.tanggal_akhir_paspor)}</dd>
          </div>
          <div>
            <dt className="meta">No. KITAP</dt>
            <dd>{detail.dokumen_kitas ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">No. Akta Perkawinan</dt>
            <dd>{detail.akta_perkawinan ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Tanggal Perkawinan</dt>
            <dd>{formatTanggalIndo(detail.tanggalperkawinan)}</dd>
          </div>
          <div>
            <dt className="meta">No. Akta Perceraian</dt>
            <dd>{detail.akta_perceraian ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Tanggal Perceraian</dt>
            <dd>{formatTanggalIndo(detail.tanggalperceraian)}</dd>
          </div>
          <div>
            <dt className="meta">No. Kartu BP/KB</dt>
            <dd>{detail.tag_id_card ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">No. Asuransi</dt>
            <dd>{detail.no_asuransi ?? "—"}</dd>
          </div>
        </dl>

        <h2 id="alamat-sekarang-heading" className="meta mb-4 mt-8">
          Alamat Sekarang
        </h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="meta">Alamat Sekarang</dt>
            <dd>{detail.alamat_sekarang ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Latitude</dt>
            <dd>{detail.lat ?? "—"}</dd>
          </div>
          <div>
            <dt className="meta">Longitude</dt>
            <dd>{detail.lng ?? "—"}</dd>
          </div>
        </dl>

        <p className="meta mt-8 border-t border-ink/10 pt-4">
          Dicatat {formatTanggalIndo(detail.created_at)} · Diperbarui{" "}
          {formatTanggalIndo(detail.updated_at)}
        </p>
      </section>

      {/* === FORM EDIT === */}
      {modeEdit && (
        <form
          onSubmit={onSubmitEdit}
          className="space-y-6 border border-ink/15 bg-paper p-5"
        >
          <p className="meta">Edit data {detail.nama}</p>
          
          {/* === Identitas === */}
          <div>
            <h3 className="meta mb-3 text-base">Identitas</h3>
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
              <label className="block sm:col-span-2">
                <span className="meta mb-1 block">URL Foto</span>
                <input
                  name="foto"
                  type="text"
                  defaultValue={detail.foto ?? ""}
                  placeholder="perangkat/foto-nik.png atau kosongkan untuk hapus"
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
                <span className="meta mt-1 block text-2xs text-ink-muted">
                  Letakkan file di folder public/ (mis. public/perangkat/foto.png)
                </span>
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
              <label className="block">
                <span className="meta mb-1 block">Suku</span>
                <input
                  name="suku"
                  type="text"
                  defaultValue={detail.suku ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* === KK & Wilayah === */}
          <div>
            <h3 className="meta mb-3 text-base">Kartu Keluarga & Wilayah</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </div>

          {/* === Demografi === */}
          <div>
            <h3 className="meta mb-3 text-base">Demografi</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <span className="meta mb-1 block">Pendidikan KK</span>
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
                <span className="meta mb-1 block">Pendidikan Sedang</span>
                <select
                  name="pendidikan_sedang_id"
                  defaultValue={detail.pendidikan_sedang_id ?? ""}
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
              <label className="block">
                <span className="meta mb-1 block">Kategori Cacat</span>
                <select
                  name="cacat_id"
                  defaultValue={detail.cacat_id ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  {ref.cacat.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Cara KB</span>
                <select
                  name="cara_kb_id"
                  defaultValue={detail.cara_kb_id ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  {ref.caraKB.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Status Dasar</span>
                <select
                  name="status_dasar"
                  defaultValue={detail.status_dasar ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  {ref.statusDasar.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Asuransi</span>
                <select
                  name="id_asuransi"
                  defaultValue={detail.id_asuransi ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  {ref.asuransi.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Hamil</span>
                <select
                  name="hamil"
                  defaultValue={detail.hamil ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">KTP Elektronik</span>
                <select
                  name="ktp_el"
                  defaultValue={detail.ktp_el ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  <option value="1">Ya</option>
                  <option value="0">Tidak</option>
                </select>
              </label>
              <label className="block">
                <span className="meta mb-1 block">Status Rekam</span>
                <select
                  name="status_rekam"
                  defaultValue={detail.status_rekam ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                >
                  <option value="">— Tidak diubah —</option>
                  {ref.statusDasar.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* === Keluarga === */}
          <div>
            <h3 className="meta mb-3 text-base">Data Keluarga</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="meta mb-1 block">NIK Ayah</span>
                <input
                  name="ayah_nik"
                  type="text"
                  defaultValue={detail.ayah_nik ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Nama Ayah</span>
                <input
                  name="nama_ayah"
                  type="text"
                  defaultValue={detail.nama_ayah ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">NIK Ibu</span>
                <input
                  name="ibu_nik"
                  type="text"
                  defaultValue={detail.ibu_nik ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Nama Ibu</span>
                <input
                  name="nama_ibu"
                  type="text"
                  defaultValue={detail.nama_ibu ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* === Dokumen === */}
          <div>
            <h3 className="meta mb-3 text-base">Dokumen</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="meta mb-1 block">No. Akta Lahir</span>
                <input
                  name="akta_lahir"
                  type="text"
                  defaultValue={detail.akta_lahir ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. Paspor</span>
                <input
                  name="dokumen_pasport"
                  type="text"
                  defaultValue={detail.dokumen_pasport ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Akhir Paspor</span>
                <input
                  name="tanggal_akhir_paspor"
                  type="date"
                  defaultValue={dateIso(detail.tanggal_akhir_paspor)}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. KITAP</span>
                <input
                  name="dokumen_kitas"
                  type="text"
                  defaultValue={detail.dokumen_kitas ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. Akta Perkawinan</span>
                <input
                  name="akta_perkawinan"
                  type="text"
                  defaultValue={detail.akta_perkawinan ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Tanggal Perkawinan</span>
                <input
                  name="tanggalperkawinan"
                  type="date"
                  defaultValue={dateIso(detail.tanggalperkawinan)}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. Akta Perceraian</span>
                <input
                  name="akta_perceraian"
                  type="text"
                  defaultValue={detail.akta_perceraian ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Tanggal Perceraian</span>
                <input
                  name="tanggalperceraian"
                  type="date"
                  defaultValue={dateIso(detail.tanggalperceraian)}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. Kartu BP/KB</span>
                <input
                  name="tag_id_card"
                  type="text"
                  defaultValue={detail.tag_id_card ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">No. Asuransi</span>
                <input
                  name="no_asuransi"
                  type="text"
                  defaultValue={detail.no_asuransi ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* === Alamat Sekarang === */}
          <div>
            <h3 className="meta mb-3 text-base">Alamat Sekarang</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="meta mb-1 block">Alamat Sekarang</span>
                <input
                  name="alamat_sekarang"
                  type="text"
                  defaultValue={detail.alamat_sekarang ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Latitude</span>
                <input
                  name="lat"
                  type="text"
                  defaultValue={detail.lat ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">Longitude</span>
                <input
                  name="lng"
                  type="text"
                  defaultValue={detail.lng ?? ""}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            </div>
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