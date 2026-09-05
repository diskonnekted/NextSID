// Panel CRUD untuk halaman detail KK.
// Client component: tombol Edit KK, Hapus KK, Tambah Anggota (inline),
// Edit/Hapus per-anggota.

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  aksiEditKK,
  aksiHapusKK,
  aksiTambahAnggota,
  aksiEditAnggota,
  aksiHapusAnggota,
} from "@/modules/kependudukan/handler-kk";

type Ref = { id: number; nama: string };

type Anggota = {
  id: number;
  nik: string;
  nama: string;
  sex: number | null;
  tempatlahir: string | null;
  tanggallahir: string | null;
  kk_level: number | null;
  hubungan_kk: string | null;
  agama: string | null;
  agama_id: number | null;
  pekerjaan: string | null;
  pekerjaan_id: number | null;
  pendidikan: string | null;
  pendidikan_kk_id: number | null;
  status_kawin_nama: string | null;
  status_kawin: number | null;
  warganegara: string | null;
  warganegara_id: number | null;
  golongan_darah: string | null;
  golongan_darah_id: number | null;
  ayah_nik: string | null;
  ibu_nik: string | null;
};

type KK = {
  no_kk: string;
  alamat: string | null;
  dusun: string | null;
  rw: string | null;
  rt: string | null;
};

type Props = {
  kk: KK;
  anggota: Anggota[];
  refData: {
    agama: Ref[];
    pekerjaan: Ref[];
    statusKawin: Ref[];
    pendidikan: Ref[];
    hubunganKK: Ref[];
    warganegara: Ref[];
    golonganDarah: Ref[];
  };
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateIso(v: string | null | undefined): string {
  if (!v) return "";
  // Normalisasi ke YYYY-MM-DD untuk input[type=date]
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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

export default function PanelDetailKK({ kk, anggota, refData: ref }: Props) {
  const router = useRouter();
  const [sedangSimpan, mulaiSimpan] = useTransition();

  // === state mode Edit KK ===
  const [modeEditKK, setModeEditKK] = useState(false);
  const [editKKAlamat, setEditKKAlamat] = useState(kk.alamat ?? "");
  const [editKKDusun, setEditKKDusun] = useState(kk.dusun ?? "");
  const [editKKRw, setEditKKRw] = useState(kk.rw ?? "");
  const [editKKRt, setEditKKRt] = useState(kk.rt ?? "");
  const [pesanKK, setPesanKK] = useState<{
    jenis: "sukses" | "gagal";
    teks: string;
  } | null>(null);

  // === state mode Tambah Anggota ===
  const [modeTambah, setModeTambah] = useState(false);
  const [pesanTambah, setPesanTambah] = useState<{
    jenis: "sukses" | "gagal";
    teks: string;
  } | null>(null);

  // === state mode Edit Anggota (by NIK) ===
  const [editNik, setEditNik] = useState<string | null>(null);
  const [pesanEdit, setPesanEdit] = useState<{
    jenis: "sukses" | "gagal";
    teks: string;
  } | null>(null);

  // === handlers ===

  function onSubmitEditKK(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesanKK(null);
    const fd = new FormData();
    fd.set("no_kk", kk.no_kk);
    fd.set("alamat", editKKAlamat);
    fd.set("dusun", editKKDusun);
    fd.set("rw", editKKRw);
    fd.set("rt", editKKRt);
    mulaiSimpan(async () => {
      try {
        const res = await aksiEditKK(fd);
        if (res?.ok) {
          setPesanKK({ jenis: "sukses", teks: "Data KK diperbarui." });
          setModeEditKK(false);
          router.refresh();
        } else {
          setPesanKK({ jenis: "gagal", teks: "Gagal memperbarui KK." });
        }
      } catch (err: any) {
        setPesanKK({
          jenis: "gagal",
          teks: String(err?.message ?? err ?? "Terjadi kesalahan."),
        });
      }
    });
  }

  function onHapusKK() {
    if (
      !window.confirm(
        `Hapus KK ${kk.no_kk} beserta seluruh anggotanya? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }
    mulaiSimpan(async () => {
      try {
        const res = await aksiHapusKK(kk.no_kk);
        if (res?.ok) {
          router.push("/admin/kk");
        }
      } catch (err: any) {
        alert(`Gagal menghapus KK: ${String(err?.message ?? err)}`);
      }
    });
  }

  function onSubmitTambah(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPesanTambah(null);
    const fd = new FormData(e.currentTarget);
    fd.set("no_kk", kk.no_kk);
    mulaiSimpan(async () => {
      try {
        const res = await aksiTambahAnggota(fd);
        if (res?.ok) {
          setPesanTambah({
            jenis: "sukses",
            teks: `Anggota NIK ${res.nik} berhasil ditambah.`,
          });
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } else {
          setPesanTambah({ jenis: "gagal", teks: "Gagal menambah anggota." });
        }
      } catch (err: any) {
        setPesanTambah({
          jenis: "gagal",
          teks: String(err?.message ?? err ?? "Terjadi kesalahan."),
        });
      }
    });
  }

  function onSubmitEditAnggota(
    e: React.FormEvent<HTMLFormElement>,
    nikAsal: string,
  ) {
    e.preventDefault();
    setPesanEdit(null);
    const fd = new FormData(e.currentTarget);
    fd.set("nikAsal", nikAsal);
    fd.set("no_kk", kk.no_kk);
    mulaiSimpan(async () => {
      try {
        const res = await aksiEditAnggota(fd);
        if (res?.ok) {
          setPesanEdit({ jenis: "sukses", teks: "Anggota diperbarui." });
          setEditNik(null);
          router.refresh();
        } else {
          setPesanEdit({ jenis: "gagal", teks: "Gagal memperbarui anggota." });
        }
      } catch (err: any) {
        setPesanEdit({
          jenis: "gagal",
          teks: String(err?.message ?? err ?? "Terjadi kesalahan."),
        });
      }
    });
  }

  function onHapusAnggota(nik: string, nama: string, isKepala: boolean) {
    if (isKepala) {
      alert("Kepala keluarga tidak dapat dihapus. Hapus KK saja.");
      return;
    }
    if (!window.confirm(`Hapus anggota ${nama} (NIK ${nik})?`)) return;
    const fd = new FormData();
    fd.set("no_kk", kk.no_kk);
    fd.set("nik", nik);
    mulaiSimpan(async () => {
      try {
        const res = await aksiHapusAnggota(fd);
        if (res?.ok) router.refresh();
      } catch (err: any) {
        alert(`Gagal menghapus: ${String(err?.message ?? err)}`);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* === AKSI KK === */}
      <div className="flex flex-col gap-2 border border-ink/15 bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="meta">Aksi Kartu Keluarga</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setModeEditKK((v) => !v);
              setPesanKK(null);
            }}
            className="meta border border-ink/20 bg-paper px-3 py-1.5 normal-case tracking-normal hover:border-ink"
          >
            {modeEditKK ? "Batal Edit" : "Edit KK"}
          </button>
          <button
            type="button"
            onClick={onHapusKK}
            className="meta border border-red-700/40 bg-paper px-3 py-1.5 normal-case tracking-normal text-red-800 hover:border-red-700"
          >
            Hapus KK
          </button>
        </div>
      </div>

      {modeEditKK && (
        <form
          onSubmit={onSubmitEditKK}
          className="space-y-4 border border-ink/15 bg-paper p-5"
        >
          <p className="meta">Edit informasi KK</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">Alamat</span>
              <textarea
                rows={2}
                value={editKKAlamat}
                onChange={(e) => setEditKKAlamat(e.target.value)}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">Dusun</span>
              <input
                type="text"
                value={editKKDusun}
                onChange={(e) => setEditKKDusun(e.target.value)}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="meta mb-1 block">RW</span>
                <input
                  type="text"
                  value={editKKRw}
                  onChange={(e) => setEditKKRw(e.target.value)}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="meta mb-1 block">RT</span>
                <input
                  type="text"
                  value={editKKRt}
                  onChange={(e) => setEditKKRt(e.target.value)}
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            </div>
          </div>
          {pesanKK && <Pesan jenis={pesanKK.jenis} teks={pesanKK.teks} />}
          <div className="flex justify-end">
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

      {/* === FORM TAMBAH ANGGOTA === */}
      <div className="flex flex-col gap-2 border-b border-ink/15 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="font-serif text-xl">Daftar Anggota</h3>
          <p className="meta mt-1">
            {anggota.length} orang terdaftar · diurut berdasarkan hubungan
            dalam KK
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setModeTambah((v) => !v);
            setPesanTambah(null);
          }}
          className="meta inline-flex items-center gap-2 self-start border border-ink bg-ink px-3 py-1.5 normal-case tracking-normal text-paper hover:bg-clay"
        >
          {modeTambah ? "Batal" : "+ Tambah Anggota"}
        </button>
      </div>

      {modeTambah && (
        <form
          onSubmit={onSubmitTambah}
          className="space-y-4 border border-ink/15 bg-paper p-5"
        >
          <p className="meta">Form tambah anggota KK</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">NIK *</span>
              <input
                name="nik"
                type="text"
                required
                minLength={16}
                maxLength={16}
                pattern="[0-9]{16}"
                placeholder="16 digit angka"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm tabular-nums focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="meta mb-1 block">Nama Lengkap *</span>
              <input
                name="nama"
                type="text"
                required
                placeholder="Nama lengkap"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">Hubungan dalam KK *</span>
              <select
                name="kk_level"
                required
                defaultValue="3"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              >
                {ref.hubunganKK.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
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
              <span className="meta mb-1 block">Pendidikan</span>
              <select
                name="pendidikan_id"
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
                <option value="">— Pilih —</option>
                {ref.golonganDarah.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {pesanTambah && (
            <Pesan jenis={pesanTambah.jenis} teks={pesanTambah.teks} />
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModeTambah(false)}
              className="meta border border-ink/20 bg-paper px-4 py-2 normal-case tracking-normal hover:border-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sedangSimpan}
              className="meta border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay disabled:opacity-50"
            >
              {sedangSimpan ? "Menyimpan…" : "Tambah Anggota"}
            </button>
          </div>
        </form>
      )}

      {/* === DAFTAR ANGGOTA + AKSI === */}
      {anggota.length === 0 ? (
        <p className="border border-ink/15 p-6 text-center text-ink-muted">
          Belum ada anggota terdaftar pada KK ini.
        </p>
      ) : (
        <ol className="divide-y divide-ink/10 border border-ink/15">
          {anggota.map((a) => {
            const isKepala = a.kk_level === 1;
            const isEditing = editNik === a.nik;
            return (
              <li key={a.id} className="px-4 py-4 lg:px-6 lg:py-5">
                <div className="grid grid-cols-12 gap-4">
                  {/* IDENTITAS RINGKAS */}
                  <div className="col-span-12 lg:col-span-10">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h4 className="font-serif text-xl">
                        {a.nama}
                        {isKepala && (
                          <span className="ml-2 align-middle inline-block border border-clay bg-clay px-1.5 py-0.5 text-2xs uppercase tracking-wider text-paper">
                            Kepala
                          </span>
                        )}
                      </h4>
                      <span className="meta">{a.hubungan_kk ?? "—"}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-ink-muted">
                      NIK {a.nik}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm lg:grid-cols-3">
                      <div>
                        <dt className="meta inline">Tempat, Tgl Lahir: </dt>
                        <dd className="inline">
                          {a.tempatlahir ?? "—"},{" "}
                          {a.tanggallahir
                            ? new Date(a.tanggallahir).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="meta inline">Agama: </dt>
                        <dd className="inline">{a.agama ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="meta inline">Pekerjaan: </dt>
                        <dd className="inline">{a.pekerjaan ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="meta inline">Pendidikan: </dt>
                        <dd className="inline">{a.pendidikan ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="meta inline">Status Kawin: </dt>
                        <dd className="inline">{a.status_kawin_nama ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="meta inline">JK: </dt>
                        <dd className="inline">
                          {a.sex === 1
                            ? "Laki-laki"
                            : a.sex === 2
                              ? "Perempuan"
                              : "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* AKSI */}
                  <div className="col-span-12 flex gap-2 lg:col-span-2 lg:flex-col lg:items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditNik(isEditing ? null : a.nik);
                        setPesanEdit(null);
                      }}
                      className="meta border border-ink/20 bg-paper px-3 py-1.5 normal-case tracking-normal hover:border-ink"
                    >
                      {isEditing ? "Batal" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onHapusAnggota(a.nik, a.nama, isKepala)}
                      className="meta border border-red-700/40 bg-paper px-3 py-1.5 normal-case tracking-normal text-red-800 hover:border-red-700 disabled:opacity-50"
                      disabled={isKepala}
                      title={
                        isKepala
                          ? "Kepala keluarga tidak dapat dihapus. Hapus KK saja."
                          : "Hapus anggota"
                      }
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* === FORM EDIT INLINE === */}
                {isEditing && (
                  <form
                    onSubmit={(e) => onSubmitEditAnggota(e, a.nik)}
                    className="mt-5 space-y-4 border border-ink/15 bg-paper p-5"
                  >
                    <p className="meta">Edit data {a.nama}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="meta mb-1 block">NIK (baru)</span>
                        <input
                          name="nik"
                          type="text"
                          minLength={16}
                          maxLength={16}
                          pattern="[0-9]{16}"
                          defaultValue={a.nik}
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
                          defaultValue={a.nama}
                          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="meta mb-1 block">Hubungan dalam KK</span>
                        <select
                          name="kk_level"
                          defaultValue={a.kk_level ?? ""}
                          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                        >
                          <option value="">— Pilih —</option>
                          {ref.hubunganKK.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.nama}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="meta mb-1 block">Jenis Kelamin</span>
                        <select
                          name="sex"
                          defaultValue={a.sex ?? ""}
                          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                        >
                          <option value="">— Pilih —</option>
                          <option value="1">Laki-laki</option>
                          <option value="2">Perempuan</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="meta mb-1 block">Tempat Lahir</span>
                        <input
                          name="tempatlahir"
                          type="text"
                          defaultValue={a.tempatlahir ?? ""}
                          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="meta mb-1 block">Tanggal Lahir</span>
                        <input
                          name="tanggallahir"
                          type="date"
                          max={todayIso()}
                          defaultValue={dateIso(a.tanggallahir)}
                          className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="meta mb-1 block">Agama</span>
                        <select
                          name="agama_id"
                          defaultValue={a.agama_id ?? ""}
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
                          defaultValue={a.status_kawin ?? ""}
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
                          name="pendidikan_id"
                          defaultValue={a.pendidikan_kk_id ?? ""}
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
                          defaultValue={a.pekerjaan_id ?? ""}
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
                          defaultValue={a.warganegara_id ?? ""}
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
                          defaultValue={a.golongan_darah_id ?? ""}
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
                    {pesanEdit && (
                      <Pesan jenis={pesanEdit.jenis} teks={pesanEdit.teks} />
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditNik(null)}
                        className="meta border border-ink/20 bg-paper px-4 py-2 normal-case tracking-normal hover:border-ink"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={sedangSimpan}
                        className="meta border border-ink bg-ink px-4 py-2 normal-case tracking-normal text-paper hover:bg-clay disabled:opacity-50"
                      >
                        {sedangSimpan ? "Menyimpan…" : "Simpan"}
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
