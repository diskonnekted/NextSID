// Halaman Permohonan Surat (Layanan Mandiri).
// Daftar permohonan masuk yang diajukan warga melalui Layanan Mandiri.
// Status mengikuti konstanta OpenSID:
//   0=Belum Lengkap, 1=Sedang Diperiksa, 2=Menunggu TTD, 3=Siap Diambil,
//   4=Sudah Diambil, 5=Dibatalkan.

import { ambilDaftarFormat, ambilDaftarPermohonan } from "@/modules/surat";
import { ambilDaftarPenduduk } from "@/modules/kependudukan";
import PanelPermohonan from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

const STATUS = {
  0: "Belum Lengkap",
  1: "Sedang Diperiksa",
  2: "Menunggu TTD",
  3: "Siap Diambil",
  4: "Sudah Diambil",
  5: "Dibatalkan",
};

export default async function AdminPermohonanPage() {
  const [permRaw, formatList, pendudukRes] = await Promise.all([
    ambilDaftarPermohonan(),
    ambilDaftarFormat(),
    ambilDaftarPenduduk({ perHalaman: 200 }).catch(() => ({ baris: [] as any[] })),
  ]);

  const items = permRaw.map((p) => ({
    id: p.id,
    no_antrian: p.no_antrian ?? "",
    id_pemohon: p.id_pemohon ?? 0,
    nama_pemohon: p.pemohon?.nama ?? "—",
    nik_pemohon: p.pemohon?.nik ?? "",
    id_surat: p.id_surat ?? 0,
    nama_surat: p.surat?.nama ?? "—",
    status: p.status,
    status_label: STATUS[p.status as keyof typeof STATUS] ?? String(p.status),
    alasan: p.alasan ?? "",
    keterangan: p.keterangan ?? "",
    no_hp_aktif: p.no_hp_aktif ?? "",
    created_at: (p.created_at ?? new Date()).toISOString(),
  }));

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Surat Menyurat · Permohonan</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Permohonan Layanan Mandiri
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar permohonan yang diajukan warga melalui Layanan Mandiri
          (anjungan/web). Status permohonan mengikuti siklus:
          <em> Belum Lengkap → Sedang Diperiksa → Menunggu TTD → Siap Diambil
          → Sudah Diambil</em>, atau <em>Dibatalkan</em>.
        </p>
      </header>

      <PanelPermohonan
        items={items}
        format={formatList.map((f) => ({ id: f.id, nama: f.nama }))}
        penduduk={(pendudukRes.baris ?? []).map((p) => ({
          id: p.id,
          label: `${p.nama} · ${p.nik}`,
        }))}
        statusMap={STATUS}
      />
    </div>
  );
}