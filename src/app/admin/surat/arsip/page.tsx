// Halaman Arsip Cetak Surat (LogSurat).
// Menampilkan log surat yang pernah dicetak/dibuat (tidak soft-deleted).
// Mendukung ubah status, soft delete, dan tambah log manual untuk surat non-warga.

import { ambilDaftarFormat, ambilDaftarLogSurat } from "@/modules/surat";
import { ambilDaftarPenduduk } from "@/modules/kependudukan";
import { ambilDaftarPamong } from "@/modules/info-desa";
import PanelArsip from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminArsipPage() {
  const [logRaw, formatList, pendudukRes, pamong] = await Promise.all([
    ambilDaftarLogSurat(),
    ambilDaftarFormat(),
    ambilDaftarPenduduk({ perHalaman: 200 }).catch(() => ({ baris: [] as any[] })),
    ambilDaftarPamong().catch(() => []),
  ]);

  const log = logRaw.map((l) => ({
    id: l.id,
    nama_surat: l.nama_surat ?? l.formatSurat?.nama ?? "—",
    kode_surat: l.kode_surat ?? null,
    no_surat: l.no_surat ?? "",
    tanggal: (l.tanggal ?? new Date()).toISOString().slice(0, 10),
    nama_pamong: l.nama_pamong ?? "—",
    nama_penduduk: l.penduduk?.nama ?? l.pemohon ?? l.nama_non_warga ?? "—",
    status: l.status,
    id_format_surat: l.id_format_surat ?? 0,
    id_pend: l.id_pend,
    id_pamong: l.id_pamong,
    verifikasi_operator: l.verifikasi_operator,
    verifikasi_kades: l.verifikasi_kades,
    verifikasi_sekdes: l.verifikasi_sekdes,
  }));

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Surat Menyurat · Arsip Cetak</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Arsip Cetak Surat
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Riwayat surat yang dihasilkan sistem (cetak/konsep/tolak). Hanya log
          yang belum dihapus (deleted_at IS NULL) yang ditampilkan. Status:
          <em> 0=KONSEP, 1=CETAK, -1=TOLAK</em>.
        </p>
      </header>

      <PanelArsip
        items={log}
        format={formatList.map((f) => ({ id: f.id, nama: f.nama }))}
        penduduk={(pendudukRes.baris ?? []).map((p) => ({
          id: p.id,
          label: `${p.nama} · ${p.nik}`,
        }))}
        pamong={pamong.map((p) => ({ id: p.id, label: p.pamong_nama }))}
      />
    </div>
  );
}