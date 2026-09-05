"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

export function CariForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [kataKunci, setKataKunci] = useState(params.get("cari") ?? "");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = kataKunci.trim();
    if (!trimmed) return;
    router.push(`/artikel?cari=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Pencarian artikel"
      className="flex w-full max-w-sm items-end gap-3"
    >
      <label className="flex-1">
        <span className="meta block">Telusuri</span>
        <input
          type="search"
          name="cari"
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
          placeholder="Kata kunci artikel"
          className="mt-1 w-full border-b border-ink/30 bg-transparent py-1 text-sm text-ink placeholder:text-ink-muted focus:border-clay focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="border-b border-ink pb-1 text-sm text-ink hover:text-clay"
      >
        Cari
      </button>
    </form>
  );
}