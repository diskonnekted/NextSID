// Halaman Template Surat (SuratFormat) + RefSyaratSurat.
// Server component untuk ambil data, client component untuk form.

import { ambilDaftarFormat, ambilDaftarSyarat } from "@/modules/surat";
import PanelFormat from "./_panel";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminFormatPage() {
  const [format, syarat] = await Promise.all([
    ambilDaftarFormat(),
    ambilDaftarSyarat(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Surat Menyurat · Template</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Template Surat
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Daftar format surat desa. Setiap template dapat memiliki syarat
          (lampiran) yang harus dipenuhi warga. Referensi syarat dapat
          dikelola di bagian bawah halaman ini.
        </p>
      </header>

      <PanelFormat
        format={format.map((f) => ({
          id: f.id,
          nama: f.nama,
          url_surat: f.url_surat ?? "",
          kode_surat: f.kode_surat,
          lampiran: f.lampiran,
          kunci: f.kunci,
          favorit: f.favorit,
          jenis: f.jenis,
          mandiri: f.mandiri,
          masa_berlaku: f.masa_berlaku,
          satuan_masa_berlaku: f.satuan_masa_berlaku,
          qr_code: f.qr_code,
          logo_garuda: f.logo_garuda,
          kecamatan: f.kecamatan,
          header: f.header,
          footer: f.footer,
          orientasi: f.orientasi,
          ukuran: f.ukuran,
          margin: f.margin,
          format_nomor: f.format_nomor,
          template: f.template,
          form_isian: f.form_isian,
          kode_isian: f.kode_isian,
          syarat_ids: parseSyaratIds(f.syarat_surat),
        }))}
        syarat={syarat.map((s) => ({ id: s.id, nama: s.ref_syarat_nama }))}
      />
    </div>
  );
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
