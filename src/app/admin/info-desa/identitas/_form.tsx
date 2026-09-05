// Form Identitas Desa — client component.
// Submit via server action `aksiSimpanIdentitas`.

"use client";

import { useState, useTransition } from "react";
import { aksiSimpanIdentitas } from "@/modules/info-desa/handler";

type NilaiAwal = {
  nama_desa: string;
  kode_desa: string;
  kode_desa_bps: string;
  kode_pos: string;
  alamat: string;
  alamat_kantor: string;
  email: string;
  telepon: string;
  nomor_operator: string;
  website: string;
  nama_kecamatan: string;
  kode_kecamatan: string;
  nama_kepala_camat: string;
  nip_kepala_camat: string;
  nama_kabupaten: string;
  kode_kabupaten: string;
  nama_propinsi: string;
  kode_propinsi: string;
  nama_kontak: string;
  hp_kontak: string;
  jabatan_kontak: string;
  lat: string;
  lng: string;
  zoom: number;
  map_tipe: string;
};

type Field = {
  key: keyof NilaiAwal;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "url" | "number";
  lebar?: "kecil" | "sedang" | "penuh";
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
      {deskripsi && (
        <p className="mb-5 text-sm text-ink-muted">{deskripsi}</p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function Input({ field }: { field: Field }) {
  const lebar =
    field.lebar === "penuh"
      ? "sm:col-span-2"
      : field.lebar === "kecil"
        ? "sm:col-span-1"
        : "sm:col-span-1";
  return (
    <label className={`block ${lebar}`}>
      <span className="meta mb-1 block">{field.label}</span>
      <input
        name={field.key}
        type={field.type ?? "text"}
        defaultValue={(field as any).value}
        placeholder={field.placeholder}
        className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
      />
    </label>
  );
}

export default function FormIdentitas({ nilaiAwal }: { nilaiAwal: NilaiAwal }) {
  const [sedangSimpan, mulaiSimpan] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulaiSimpan(async () => {
      const res = await aksiSimpanIdentitas(fd);
      setPesan(res.ok ? "Tersimpan" : "Gagal menyimpan");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Identitas utama */}
      <Grup
        judul="Identitas Utama"
        deskripsi="Nama, kode, dan alamat inti desa."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Nama Desa *</span>
            <input
              name="nama_desa"
              type="text"
              required
              defaultValue={nilaiAwal.nama_desa}
              placeholder="Desa Sukamaju"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Desa (Kemendagri)</span>
            <input
              name="kode_desa"
              type="text"
              defaultValue={nilaiAwal.kode_desa}
              placeholder="32.01.01.2001"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Desa (BPS)</span>
            <input
              name="kode_desa_bps"
              type="text"
              defaultValue={nilaiAwal.kode_desa_bps}
              placeholder="3201012001"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Pos</span>
            <input
              name="kode_pos"
              type="text"
              defaultValue={nilaiAwal.kode_pos}
              placeholder="12345"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Alamat (Surat Menyurat)</span>
            <textarea
              name="alamat"
              rows={2}
              defaultValue={nilaiAwal.alamat}
              placeholder="Jl. Raya Desa No. 1"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Alamat Kantor Desa</span>
            <textarea
              name="alamat_kantor"
              rows={2}
              defaultValue={nilaiAwal.alamat_kantor}
              placeholder="Kantor Kepala Desa Sukamaju"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </Grup>

      {/* Wilayah administratif */}
      <Grup
        judul="Wilayah Administratif"
        deskripsi="Kecamatan, kabupaten, dan provinsi tempat desa ini berada."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Nama Kecamatan</span>
            <input
              name="nama_kecamatan"
              type="text"
              defaultValue={nilaiAwal.nama_kecamatan}
              placeholder="Cibitung"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Kecamatan</span>
            <input
              name="kode_kecamatan"
              type="text"
              defaultValue={nilaiAwal.kode_kecamatan}
              placeholder="32.01.01"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Nama Kabupaten / Kota</span>
            <input
              name="nama_kabupaten"
              type="text"
              defaultValue={nilaiAwal.nama_kabupaten}
              placeholder="Kabupaten Bogor"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Kabupaten</span>
            <input
              name="kode_kabupaten"
              type="text"
              defaultValue={nilaiAwal.kode_kabupaten}
              placeholder="32.01"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Nama Provinsi</span>
            <input
              name="nama_propinsi"
              type="text"
              defaultValue={nilaiAwal.nama_propinsi}
              placeholder="Jawa Barat"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Kode Provinsi</span>
            <input
              name="kode_propinsi"
              type="text"
              defaultValue={nilaiAwal.kode_propinsi}
              placeholder="32"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Nama Kepala Camat</span>
            <input
              name="nama_kepala_camat"
              type="text"
              defaultValue={nilaiAwal.nama_kepala_camat}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">NIP Kepala Camat</span>
            <input
              name="nip_kepala_camat"
              type="text"
              defaultValue={nilaiAwal.nip_kepala_camat}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </Grup>

      {/* Kontak & website */}
      <Grup judul="Kontak & Website" deskripsi="Kanal resmi untuk warga & media.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Email Desa</span>
            <input
              name="email"
              type="email"
              defaultValue={nilaiAwal.email}
              placeholder="desa@example.id"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Telepon Kantor</span>
            <input
              name="telepon"
              type="text"
              defaultValue={nilaiAwal.telepon}
              placeholder="(0251) 123456"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Nomor Operator (WhatsApp)</span>
            <input
              name="nomor_operator"
              type="text"
              defaultValue={nilaiAwal.nomor_operator}
              placeholder="0812-3456-7890"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Website</span>
            <input
              name="website"
              type="url"
              defaultValue={nilaiAwal.website}
              placeholder="https://sukamaju.desa.id"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </Grup>

      {/* Kontak person */}
      <Grup judul="Kontak Person" deskripsi="Petugas yang bisa dihubungi warga.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Nama Kontak</span>
            <input
              name="nama_kontak"
              type="text"
              defaultValue={nilaiAwal.nama_kontak}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">HP Kontak</span>
            <input
              name="hp_kontak"
              type="text"
              defaultValue={nilaiAwal.hp_kontak}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="meta mb-1 block">Jabatan Kontak</span>
            <input
              name="jabatan_kontak"
              type="text"
              defaultValue={nilaiAwal.jabatan_kontak}
              placeholder="Sekretaris Desa"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
        </div>
      </Grup>

      {/* Peta */}
      <Grup judul="Peta Lokasi" deskripsi="Koordinat & tampilan default peta desa.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="meta mb-1 block">Latitude</span>
            <input
              name="lat"
              type="text"
              defaultValue={nilaiAwal.lat}
              placeholder="-6.123456"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Longitude</span>
            <input
              name="lng"
              type="text"
              defaultValue={nilaiAwal.lng}
              placeholder="106.123456"
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="meta mb-1 block">Zoom Default</span>
            <input
              name="zoom"
              type="number"
              min={1}
              max={20}
              defaultValue={nilaiAwal.zoom}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
          </label>
          <label className="block sm:col-span-3">
            <span className="meta mb-1 block">Tipe Peta</span>
            <select
              name="map_tipe"
              defaultValue={nilaiAwal.map_tipe}
              className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            >
              <option value="roadmap">Roadmap</option>
              <option value="satellite">Satellite</option>
              <option value="hybrid">Hybrid</option>
              <option value="terrain">Terrain</option>
            </select>
          </label>
        </div>
      </Grup>

      {/* Aksi */}
      <div className="flex items-center justify-between border-t border-ink/15 pt-6">
        <p className="meta text-2xs">
          {pesan ? `${pesan} · ${new Date().toLocaleString("id-ID")}` : "Belum ada perubahan disimpan."}
        </p>
        <button
          type="submit"
          disabled={sedangSimpan}
          className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
        >
          {sedangSimpan ? "Menyimpan…" : "Simpan Identitas"}
        </button>
      </div>
    </form>
  );
}
