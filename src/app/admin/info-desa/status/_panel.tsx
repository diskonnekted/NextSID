// Panel interaktif Status Desa — grouped by kategori.

"use client";

import { useMemo, useState, useTransition } from "react";
import { aksiSimpanProfil } from "@/modules/info-desa/handler";

type Item = { key: string; judul: string; kategori: string; value: string };

const KATEGORI_LABEL: Record<string, string> = {
  ekologi: "Ekologi & Lingkungan",
  internet: "Infrastruktur Internet",
  adat: "Adat & Kearifan Lokal",
  lain: "Lainnya",
};
const URUTAN: Array<keyof typeof KATEGORI_LABEL> = ["ekologi", "internet", "adat", "lain"];

export default function PanelStatus({ items }: { items: Item[] }) {
  const [nilai, setNilai] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const it of items) init[it.key] = it.value;
    return init;
  });
  const [sedang, mulai] = useTransition();
  const [pesan, setPesan] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, Item[]> = {};
    for (const it of items) {
      const kat = (KATEGORI_LABEL[it.kategori] ? it.kategori : "lain") as string;
      if (!g[kat]) g[kat] = [];
      g[kat].push(it);
    }
    return g;
  }, [items]);

  function simpan() {
    const itemsPayload = items.map((it) => ({
      key: it.key,
      judul: it.judul,
      kategori: it.kategori,
      value: nilai[it.key] ?? "",
    }));
    mulai(async () => {
      await aksiSimpanProfil(itemsPayload);
      setPesan("Profil desa tersimpan");
    });
  }

  return (
    <div className="space-y-8">
      {URUTAN.filter((k) => grouped[k]?.length).map((kat) => (
        <fieldset key={kat} className="border border-ink/15 bg-paper p-6">
          <legend className="px-2 font-serif text-lg">{KATEGORI_LABEL[kat]}</legend>
          <div className="space-y-4">
            {grouped[kat].map((it) => (
              <label key={it.key} className="block">
                <span className="meta mb-1 block">{it.judul}</span>
                <textarea
                  rows={2}
                  value={nilai[it.key] ?? ""}
                  onChange={(e) =>
                    setNilai((prev) => ({ ...prev, [it.key]: e.target.value }))
                  }
                  className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="flex items-center justify-between border-t border-ink/15 pt-6">
        <p className="meta text-2xs">
          {pesan ?? "Profil desa akan dipakai modul lain (halaman profil publik)."}
        </p>
        <button
          type="button"
          onClick={simpan}
          disabled={sedang}
          className="border border-clay bg-clay px-5 py-2 font-serif text-sm text-paper hover:bg-clay/90 disabled:opacity-60"
        >
          {sedang ? "Menyimpan…" : "Simpan Profil"}
        </button>
      </div>
    </div>
  );
}
