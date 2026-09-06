// Halaman Identitas Desa.
// Form lengkap mengikuti model OpenSID asli (Config) dengan server action.
// Server component untuk ambil data; client component untuk form interaktif.

import { ambilIdentitas } from "@/modules/info-desa";
import FormIdentitas from "./_form";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function AdminIdentitasPage() {
  const identitas = await ambilIdentitas();

  return (
    <div className="space-y-8">
      <header>
        <p className="meta mb-2">Info Desa · Identitas</p>
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
          Identitas Desa
        </h2>
        <p className="mt-3 max-w-2xl text-ink-muted">
          Isi nama desa, kode wilayah (BPS, kemendagri), alamat kantor,
          kontak operator, dan posisi peta. Perubahan langsung tersimpan ke
          basis data dan dipakai oleh modul lain (Cetak Surat, Profil Publik).
        </p>
      </header>

      <FormIdentitas
        nilaiAwal={{
          nama_desa: identitas?.nama_desa ?? "",
          kode_desa: identitas?.kode_desa ?? "",
          kode_desa_bps: identitas?.kode_desa_bps ?? "",
          kode_pos: identitas?.kode_pos ?? "",
          alamat: identitas?.alamat ?? "",
          alamat_kantor: identitas?.alamat_kantor ?? "",
          email: identitas?.email ?? "",
          telepon: identitas?.telepon ?? "",
          nomor_operator: identitas?.nomor_operator ?? "",
          website: identitas?.website ?? "",
          nama_kecamatan: identitas?.nama_kecamatan ?? "",
          kode_kecamatan: identitas?.kode_kecamatan ?? "",
          nama_kepala_camat: identitas?.nama_kepala_camat ?? "",
          nip_kepala_camat: identitas?.nip_kepala_camat ?? "",
          nama_kabupaten: identitas?.nama_kabupaten ?? "",
          kode_kabupaten: identitas?.kode_kabupaten ?? "",
          nama_propinsi: identitas?.nama_propinsi ?? "",
          kode_propinsi: identitas?.kode_propinsi ?? "",
          nama_kontak: identitas?.nama_kontak ?? "",
          hp_kontak: identitas?.hp_kontak ?? "",
          jabatan_kontak: identitas?.jabatan_kontak ?? "",
          lat: identitas?.lat ?? "",
          lng: identitas?.lng ?? "",
          zoom: identitas?.zoom ?? 12,
          map_tipe: identitas?.map_tipe ?? "roadmap",
        }}
      />
    </div>
  );
}
