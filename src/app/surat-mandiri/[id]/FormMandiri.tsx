"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitPermohonan } from "./actions";

type ActionState = { error?: string; success?: boolean };

export default function FormMandiri({
  suratId,
  isIndividuForm,
  penduduk,
  kodeIsian,
}: {
  suratId: number;
  isIndividuForm: boolean;
  penduduk: Array<{ id: number; nik: string; nama: string }>;
  kodeIsian: Array<{
    kode: string;
    nama: string;
    tipe: string;
    required?: string;
    deskripsi?: string;
    pilihan?: any;
  }>;
}) {
  const router = useRouter();
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await submitPermohonan({}, formData, suratId);
      setState(result);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {state.error && (
        <div className="rounded border border-clay bg-clay/10 px-4 py-3 text-sm text-clay">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded border border-green-600 bg-green-600/10 px-4 py-3 text-sm text-green-700">
          Permohonan surat berhasil diajukan. Silakan tunggu verifikasi dari
          petugas desa.
        </div>
      )}

      {/* Pilih Pemohon */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl">Data Pemohon</h2>
        {isIndividuForm && penduduk.length > 0 ? (
          <>
            <label className="block">
              <span className="meta mb-1 block">
                Pilih dari Data Penduduk <span className="text-clay">*</span>
              </span>
              <select
                name="id_pemohon"
                required
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
              >
                <option value="">— Pilih Penduduk —</option>
                {penduduk.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — {p.nik}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded border border-ink/10 bg-paper-dim p-4 text-sm text-ink-muted">
              <p>Pilih penduduk dari dropdown di atas.</p>
            </div>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="meta mb-1 block">Nama Lengkap</span>
              <input
                name="form_nama"
                type="text"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">NIK</span>
              <input
                name="form_nik"
                type="text"
                maxLength={16}
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">Alamat</span>
              <input
                name="form_alamat"
                type="text"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="meta mb-1 block">No HP Aktif</span>
              <input
                name="no_hp_aktif"
                type="tel"
                placeholder="08xxxxxxxxxx"
                className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </section>

      {/* Dynamic form fields from kode_isian */}
      {kodeIsian.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-xl">Isi Formulir</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {kodeIsian.map((field) => {
              const inputName = field.kode
                .replace("[", "")
                .replace("]", "")
                .toLowerCase();
              if (field.tipe === "textarea") {
                return (
                  <label key={field.kode} className="block sm:col-span-2">
                    <span className="meta mb-1 block">
                      {field.nama}
                      {field.required === "1" && (
                        <span className="text-clay"> *</span>
                      )}
                    </span>
                    <textarea
                      name={inputName}
                      rows={4}
                      required={field.required === "1"}
                      placeholder={field.deskripsi}
                      className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                    />
                  </label>
                );
              }
              if (field.tipe === "select-otomatis") {
                return (
                  <label key={field.kode} className="block">
                    <span className="meta mb-1 block">{field.nama}</span>
                    <select
                      name={inputName}
                      className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                    >
                      <option value="">— Pilih —</option>
                      {(field.pilihan || []).map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              // Default: text input
              return (
                <label key={field.kode} className="block">
                  <span className="meta mb-1 block">
                    {field.nama}
                    {field.required === "1" && (
                      <span className="text-clay"> *</span>
                    )}
                  </span>
                  <input
                    name={inputName}
                    type={field.tipe === "number" ? "number" : "text"}
                    required={field.required === "1"}
                    placeholder={field.deskripsi}
                    className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm"
                  />
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 border-t border-ink/15 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="bg-clay px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-50"
        >
          {pending ? "Mengajukan…" : "Ajukan Surat"}
        </button>
        <Link
          href="/surat-mandiri"
          className="text-sm text-ink-muted hover:text-clay"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
