// Halaman detail permohonan surat mandiri per jenis.
// Menampilkan form dinamis berdasarkan kode_isian template.

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormMandiri from "./FormMandiri";

export const dynamic = "force-dynamic";

type SearchParams = { nik?: string };
type Params = { id: string };

async function ambilFormat(id: number) {
  const format = await prisma.suratFormat.findUnique({
    where: { id },
  });
  if (!format) return null;

  const syaratIds = parseSyaratIds(format.syarat_surat);
  const refSyaratSurat =
    syaratIds.length > 0
      ? await prisma.refSyaratSurat.findMany({
          where: { id: { in: syaratIds } },
          select: { id: true, nama: true },
        })
      : [];

  return { ...format, refSyaratSurat };
}

function parseSyaratIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

async function parseKodeIsian(raw: string | null) {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Array<{
      kode: string;
      nama: string;
      tipe: string;
      required?: string;
      deskripsi?: string;
      pilihan?: any;
    }>;
  } catch {
    return [];
  }
}

async function parseFormIsian(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function ambilPenduduk() {
  const configId = await prisma.config.findFirst();
  if (!configId) return [];
  return prisma.penduduk.findMany({
    where: { config_id: configId.id, status_dasar: 1 },
    select: { id: true, nik: true, nama: true },
    orderBy: { nama: "asc" },
    take: 500,
  });
}

export default async function SuratMandiriDetailPage({
  params,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const suratId = parseInt(params.id, 10);
  if (isNaN(suratId)) notFound();

  const format = await ambilFormat(suratId);
  if (!format || format.mandiri !== 1) notFound();

  const kodeIsian = await parseKodeIsian(format.kode_isian);
  const formIsian = await parseFormIsian(format.form_isian);
  const penduduk = await ambilPenduduk();

  const isIndividuForm = !!formIsian?.individu;

  return (
    <div className="container-page py-12 lg:py-20">
      <nav aria-label="Navigasi butir" className="mb-8 text-sm">
        <Link href="/surat-mandiri" className="link-clay">
          Surat Mandiri
        </Link>
        <span aria-hidden> · </span>
        <span className="text-ink-muted">{format.nama}</span>
      </nav>

      <header className="mb-10 border-b border-ink/15 pb-6">
        {format.kode_surat && (
          <p className="meta mb-2">Kode {format.kode_surat}</p>
        )}
        <h1 className="font-serif text-display-md leading-tight">
          {format.nama}
        </h1>
        {format.lampiran && (
          <p className="mt-2 text-sm text-ink-muted">
            Lampiran: {format.lampiran}
          </p>
        )}
      </header>

      {/* Dynamic form */}
      <FormMandiri
        suratId={suratId}
        isIndividuForm={isIndividuForm}
        penduduk={penduduk}
        kodeIsian={kodeIsian}
      />

      {/* Syarat */}
      {format.refSyaratSurat && format.refSyaratSurat.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="font-serif text-xl">Syarat yang Dibutuhkan</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink-soft">
            {format.refSyaratSurat.map((s) => (
              <li key={s.id}>{s.nama}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Template preview */}
      {format.template && (
        <section className="mt-12 space-y-4 border-t border-ink/15 pt-8">
          <h2 className="font-serif text-xl">Pratinjau Template</h2>
          <div
            className="prose mx-auto max-w-prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: format.template }}
          />
        </section>
      )}
    </div>
  );
}
