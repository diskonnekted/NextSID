"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = {
  id: number;
  judul: string;
  gambar: string;
  slug: string | null;
  tgl_upload: Date | string;
};

const AUTO_PLAY_MS = 6000;

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [indexAktif, setIndexAktif] = useState(0);
  const [diJeda, setDiJeda] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || diJeda) return;
    const id = window.setInterval(() => {
      setIndexAktif((i) => (i + 1) % slides.length);
    }, AUTO_PLAY_MS);
    return () => window.clearInterval(id);
  }, [slides.length, diJeda]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label="Sorotan utama"
      className="relative overflow-hidden bg-ink text-paper"
      onMouseEnter={() => setDiJeda(true)}
      onMouseLeave={() => setDiJeda(false)}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[16/8]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === indexAktif ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== indexAktif}
          >
            <Image
              src={s.gambar}
              alt={s.judul}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 100vw"
              className="object-cover"
              style={{ width: "100%", height: "100%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
          <p className="meta mb-3 text-paper/80">Sorotan · {indexAktif + 1} / {slides.length}</p>
          <Link href={`/artikel/${slides[indexAktif].slug ?? slides[indexAktif].id}`}>
            <h2 className="max-w-3xl font-serif text-display-sm leading-tight sm:text-display-md lg:text-display-lg">
              {slides[indexAktif].judul}
            </h2>
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-6 right-6 flex gap-2 sm:bottom-10 sm:right-10 lg:right-14">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Lihat sorotan ${i + 1}`}
              onClick={() => setIndexAktif(i)}
              className={`h-1.5 w-8 transition-colors ${
                i === indexAktif ? "bg-paper" : "bg-paper/30 hover:bg-paper/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}