// Form Konfigurasi Desa — tema (warna, border, app_key) & setting key-value.
// Dua form terpisah: (1) tema/app, (2) setting key-value list.

"use client";

import { useState, useTransition } from "react";
import {
  aksiSimpanKonfigurasi,
  aksiSimpanSetting,
  aksiHapusSettingItem,
} from "@/modules/konfigurasi/handler";

type NilaiAwal = {
  warna: string;
  border: string;
  app_key: string;
};

type Item = { id: number; key: string; value: string };

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

export default function FormKonfigurasi({
  nilaiAwal,
  settings,
}: {
  nilaiAwal: NilaiAwal;
  settings: Item[];
}) {
  return (
    <div className="space-y-8">
      <FormTema nilaiAwal={nilaiAwal} />
      <FormSetting settings={settings} />
    </div>
  );
}

// =====================================================================
// Tema & App
// =====================================================================

function FormTema({ nilaiAwal }: { nilaiAwal: NilaiAwal }) {
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    mulai(async () => {
      const res = await aksiSimpanKonfigurasi(fd);
      setPesan(res.ok ? "Tersimpan" : "Gagal menyimpan");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Grup
        judul="Tema & Tampilan"
        deskripsi="Warna aksen dan border utama situs publik. Isi hex color (#rrggbb)."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="meta mb-1 block">Warna Aksen</span>
            <div className="flex items-center gap-2">
              <input
                name="warna"
                type="color"
                defaultValue={nilaiAwal.warna || "#9a3a2a"}
                className="h-10 w-14 cursor-pointer border border-ink/20 bg-paper"
                aria-label="Pemilih warna"
              />
              <input
                type="text"
                value={nilaiAwal.warna || ""}
                readOnly
                placeholder="#9a3a2a"
                className="flex-1 border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </div>
            <span className="meta mt-1 block text-2xs">
              Dipakai untuk tombol, link aktif, dan sorotan.
            </span>
          </label>
          <label className="block">
            <span className="meta mb-1 block">Warna Border</span>
            <div className="flex items-center gap-2">
              <input
                name="border"
                type="color"
                defaultValue={nilaiAwal.border || "#1f1c19"}
                className="h-10 w-14 cursor-pointer border border-ink/20 bg-paper"
                aria-label="Pemilih warna border"
              />
              <input
                type="text"
                value={nilaiAwal.border || ""}
                readOnly
                placeholder="#1f1c19"
                className="flex-1 border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
            </div>
            <span className="meta mt-1 block text-2xs">
              Dipakai untuk garis batas & frame kartu.
            </span>
          </label>
        </div>
      </Grup>

      <Grup judul="Identitas Aplikasi" deskripsi="Kunci internal aplikasi.">
        <label className="block">
          <span className="meta mb-1 block">App Key</span>
          <input
            name="app_key"
            type="text"
            defaultValue={nilaiAwal.app_key}
            placeholder="nama-aplikasi-desa"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          />
          <span className="meta mt-1 block text-2xs">
            Identifier unik untuk instance desa (slug, lowercase, tanpa spasi).
          </span>
        </label>
      </Grup>

      <div className="flex items-center justify-between border-t border-ink/15 pt-6">
        <p className="meta text-2xs">
          {pesan
            ? `${pesan} · ${new Date().toLocaleString("id-ID")}`
            : "Tema berlaku untuk halaman publik."}
        </p>
        <button
          type="submit"
          disabled={sedang}
          className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
        >
          {sedang ? "Menyimpan…" : "Simpan Tema"}
        </button>
      </div>
    </form>
  );
}

// =====================================================================
// Setting key-value
// =====================================================================

function FormSetting({ settings }: { settings: Item[] }) {
  const [items, setItems] = useState<Item[]>(settings);
  const [draftKey, setItemKey] = useState("");
  const [draftValue, setItemValue] = useState("");
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  function tambah() {
    const k = draftKey.trim();
    if (!k) return;
    if (items.some((it) => it.key === k)) {
      setPesan(`Key "${k}" sudah ada`);
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: -Date.now(), key: k, value: draftValue },
    ]);
    setItemKey("");
    setItemValue("");
    setPesan(null);
  }

  function hapus(key: string) {
    mulai(async () => {
      await aksiHapusSettingItem(key);
      setItems((prev) => prev.filter((it) => it.key !== key));
    });
  }

  function ubah(key: string, value: string) {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, value } : it)),
    );
  }

  function simpan() {
    const fd = new FormData();
    for (const it of items) {
      fd.append(`setting_${it.key}`, it.value);
    }
    mulai(async () => {
      const res = await aksiSimpanSetting(fd);
      if (res.ok) setPesan(`${res.jumlah ?? items.length} setting tersimpan`);
    });
  }

  return (
    <div className="space-y-6">
      <Grup
        judul="Pengaturan Key-Value"
        deskripsi="Parameter global aplikasi. Tambah, ubah nilai, atau hapus key."
      >
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-ink-muted">
              Belum ada setting. Tambahkan key baru di bawah.
            </p>
          )}
          {items.map((it) => (
            <div
              key={it.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr_auto] sm:items-center"
            >
              <span className="meta break-all font-mono text-xs">
                {it.key}
              </span>
              <input
                type="text"
                value={it.value}
                onChange={(e) => ubah(it.key, e.target.value)}
                placeholder="Nilai"
                className="border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
              />
              <button
                type="button"
                onClick={() => hapus(it.key)}
                className="border border-ink/20 px-3 py-2 text-xs text-ink-muted hover:border-clay hover:text-clay"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-ink/15 pt-4">
          <p className="meta mb-2">Tambah Setting Baru</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[12rem_1fr_auto] sm:items-center">
            <input
              type="text"
              value={draftKey}
              onChange={(e) => setItemKey(e.target.value)}
              placeholder="mis. versi_aplikasi"
              className="border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
            <input
              type="text"
              value={draftValue}
              onChange={(e) => setItemValue(e.target.value)}
              placeholder="Nilai awal"
              className="border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            />
            <button
              type="button"
              onClick={tambah}
              className="border border-ink/30 px-3 py-2 text-sm hover:border-clay hover:text-clay"
            >
              + Tambah
            </button>
          </div>
          <p className="meta mt-2 text-2xs">
            Key tidak bisa diubah setelah ditambah. Hapus dan buat ulang jika
            perlu ganti nama.
          </p>
        </div>
      </Grup>

      <div className="flex items-center justify-between border-t border-ink/15 pt-6">
        <p className="meta text-2xs">
          {pesan ?? `${items.length} key · klik Simpan untuk menerapkan perubahan.`}
        </p>
        <button
          type="button"
          onClick={simpan}
          disabled={sedang || items.length === 0}
          className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
        >
          {sedang ? "Menyimpan…" : "Simpan Setting"}
        </button>
      </div>
    </div>
  );
}