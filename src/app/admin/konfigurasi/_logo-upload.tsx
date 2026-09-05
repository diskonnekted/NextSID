// Komponen upload logo desa & foto kantor desa.
// Preview file sebelum upload, validasi tipe client-side, submit via server action.

"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  aksiUploadLogo,
  aksiHapusLogo,
  aksiUploadFotoKantor,
  aksiUploadHeroBanner,
  aksiHapusHeroBanner,
} from "@/modules/konfigurasi/handler";

type Props = {
  logo: string;
  kantor: string;
  hero: string;
};

const UKURAN_MAKS = 2 * 1024 * 1024;
const TIPE_DIIZINKAN = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function UploadLogo({ logo, kantor, hero }: Props) {
  return (
    <div className="space-y-6">
      <fieldset className="border border-ink/15 bg-paper p-6">
        <legend className="px-2 font-serif text-lg">Logo Desa</legend>
        <p className="mb-5 text-sm text-ink-muted">
          Logo ditampilkan di header situs, favicon, dan kop surat. Format:
          JPG/PNG/WebP/SVG. Maks 2 MB. Disarankan rasio 1:1 (persegi).
        </p>
        <UploadBox
          label="Logo Utama"
          pathSaatIni={logo}
          fieldName="logo"
          fieldLama="logo_lama"
          aksiUpload={aksiUploadLogo}
          aksiHapus={aksiHapusLogo}
          previewWidth={128}
          previewHeight={128}
        />
      </fieldset>

      <fieldset className="border border-ink/15 bg-paper p-6">
        <legend className="px-2 font-serif text-lg">Hero Banner Landing Page</legend>
        <p className="mb-5 text-sm text-ink-muted">
          Gambar latar belakang untuk header hero / judul nama desa di landing
          page. Format JPG/PNG/WebP. Maks 2 MB. Disarankan ukuran landscape
          minimal 1600×600 agar tampil proporsional di layar lebar.
        </p>
        <UploadBox
          label="Hero Banner"
          pathSaatIni={hero}
          fieldName="hero"
          fieldLama="hero_lama"
          aksiUpload={aksiUploadHeroBanner}
          aksiHapus={aksiHapusHeroBanner}
          previewWidth={320}
          previewHeight={120}
        />
      </fieldset>

      <fieldset className="border border-ink/15 bg-paper p-6">
        <legend className="px-2 font-serif text-lg">Foto Kantor Desa</legend>
        <p className="mb-5 text-sm text-ink-muted">
          Foto gedung kantor desa untuk halaman profil & kop surat. Format dan
          ukuran sama seperti logo.
        </p>
        <UploadBox
          label="Foto Kantor"
          pathSaatIni={kantor}
          fieldName="kantor"
          fieldLama="kantor_lama"
          aksiUpload={aksiUploadFotoKantor}
          aksiHapus={null}
          previewWidth={192}
          previewHeight={128}
        />
      </fieldset>
    </div>
  );
}

// =====================================================================
// UploadBox generik
// =====================================================================

type UploadBoxProps = {
  label: string;
  pathSaatIni: string;
  fieldName: string;
  fieldLama: string;
  // Kita pakai any supaya kedua signature (FormData) dan () konsisten.
  aksiUpload: (fd: FormData) => Promise<{ ok: boolean; pesan?: string; path?: string }>;
  aksiHapus: (() => Promise<{ ok: boolean }>) | null;
  previewWidth: number;
  previewHeight: number;
};

function UploadBox({
  label,
  pathSaatIni,
  fieldName,
  fieldLama,
  aksiUpload,
  aksiHapus,
  previewWidth,
  previewHeight,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sedang, mulai] = useTransition();

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileInfo(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function pilihFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setSuccess(null);
    if (!file) {
      reset();
      return;
    }
    if (!TIPE_DIIZINKAN.includes(file.type)) {
      setError(`Tipe ${file.type || "unknown"} tidak didukung`);
      reset();
      return;
    }
    if (file.size > UKURAN_MAKS) {
      setError(`File ${formatBytes(file.size)} melebihi batas 2 MB`);
      reset();
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFileInfo({ name: file.name, size: file.size, type: file.type });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      const res = await aksiUpload(fd);
      if (res.ok) {
        setSuccess(`Berhasil upload${res.path ? `: ${res.path.split("/").pop()}` : ""}`);
        reset();
      } else {
        setError(res.pesan ?? "Gagal upload");
      }
    });
  }

  function hapus() {
    if (!aksiHapus) return;
    if (!pathSaatIni) return;
    mulai(async () => {
      await aksiHapus();
      setSuccess("Logo dihapus");
    });
  }

  const previewSrc = previewUrl || pathSaatIni;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
        {/* Preview */}
        <div
          className="relative flex shrink-0 items-center justify-center border border-dashed border-ink/30 bg-paper-dim"
          style={{
            width: previewWidth,
            height: previewHeight,
          }}
        >
          {previewSrc ? (
            <Image
              src={previewSrc}
              alt={`Pratinjau ${label}`}
              fill
              unoptimized
              className="object-contain"
              sizes={`${previewWidth}px`}
            />
          ) : (
            <span className="meta text-2xs">Belum ada {label.toLowerCase()}</span>
          )}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input type="hidden" name={fieldLama} value={pathSaatIni} />

          <label className="block">
            <span className="meta mb-1 block">Pilih File</span>
            <input
              ref={inputRef}
              name={fieldName}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={pilihFile}
              className="block w-full text-sm file:mr-3 file:cursor-pointer file:border file:border-clay file:bg-clay file:px-3 file:py-1.5 file:font-serif file:text-sm file:text-paper hover:file:bg-clay/90"
            />
          </label>

          {fileInfo && (
            <div className="border border-ink/15 bg-paper-dim px-3 py-2 text-xs">
              <p className="break-all">
                <span className="meta">File:</span> {fileInfo.name}
              </p>
              <p>
                <span className="meta">Ukuran:</span> {formatBytes(fileInfo.size)} ·{" "}
                <span className="meta">Tipe:</span> {fileInfo.type}
              </p>
            </div>
          )}

          {error && (
            <p className="border border-clay/40 bg-clay/10 px-3 py-2 text-xs text-clay">
              {error}
            </p>
          )}
          {success && (
            <p className="border border-ink/15 bg-paper-dim px-3 py-2 text-xs">
              {success}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={sedang || !fileInfo}
              className="border border-clay bg-clay px-4 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
            >
              {sedang ? "Mengunggah…" : `Upload ${label}`}
            </button>
            {fileInfo && (
              <button
                type="button"
                onClick={reset}
                className="border border-ink/30 px-4 py-2 text-sm hover:border-clay hover:text-clay"
              >
                Batal
              </button>
            )}
            {aksiHapus && pathSaatIni && (
              <button
                type="button"
                onClick={hapus}
                disabled={sedang}
                className="border border-ink/30 px-4 py-2 text-sm text-ink-muted hover:border-clay hover:text-clay disabled:opacity-60"
              >
                Hapus Logo
              </button>
            )}
          </div>

          {pathSaatIni && (
            <p className="meta mt-1 break-all text-2xs">
              Saat ini: {pathSaatIni}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}