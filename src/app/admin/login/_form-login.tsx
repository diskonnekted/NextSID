"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function FormLogin() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/admin";

  const [surel, setSurel] = useState("admin@desa.id");
  const [sandi, setSandi] = useState("");
  const [sedangMengirim, setSedangMengirim] = useState(false);
  const [kesalahan, setKesalahan] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setKesalahan(null);
    setSedangMengirim(true);
    try {
      const hasil = await signIn("credentials", {
        email: surel,
        password: sandi,
        redirect: false,
      });
      if (!hasil || hasil.error) {
        setKesalahan("Surel atau kata sandi salah.");
        setSedangMengirim(false);
        return;
      }
      // Sukses → arahkan ke tujuan asal (default /admin).
      router.push(from);
      router.refresh();
    } catch {
      setKesalahan("Terjadi galat saat masuk. Coba lagi.");
      setSedangMengirim(false);
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="surel"
          className="meta mb-1.5 block"
        >
          Surel
        </label>
        <input
          id="surel"
          name="surel"
          type="email"
          required
          autoComplete="email"
          value={surel}
          onChange={(e) => setSurel(e.target.value)}
          className="w-full border border-ink/20 bg-paper px-3 py-2 font-mono text-sm focus:border-clay focus:outline-none"
          placeholder="admin@desa.id"
        />
      </div>

      <div>
        <label
          htmlFor="sandi"
          className="meta mb-1.5 block"
        >
          Kata Sandi
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          required
          autoComplete="current-password"
          value={sandi}
          onChange={(e) => setSandi(e.target.value)}
          className="w-full border border-ink/20 bg-paper px-3 py-2 font-mono text-sm focus:border-clay focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {kesalahan && (
        <p
          role="alert"
          className="border border-clay/40 bg-clay/5 px-3 py-2 text-sm text-clay"
        >
          {kesalahan}
        </p>
      )}

      <button
        type="submit"
        disabled={sedangMengirim}
        className="w-full border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-clay hover:border-clay disabled:opacity-60"
      >
        {sedangMengirim ? "Memeriksa…" : "Masuk Dasbor"}
      </button>
    </form>
  );
}