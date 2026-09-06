// Halaman detail satu Penduduk (route /admin/kependudukan/{nik}).
//
// Implementasi sebenarnya berada di /admin/kepopulation/[nik]/page.tsx.
// Halaman ini melakukan re-export agar semua link internal
// (/admin/kepopulation/{nik}, /admin/kependudukan/{nik}, dll.) konsisten
// dan Next.js App Router dapat menemukan handler-nya.

import DetailPendudukPage from "../../kepopulation/[nik]/page";

export const dynamic = "force-static"
export const revalidate = 60;

type Params = { nik: string };

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  return DetailPendudukPage({ params });
}