// Halaman preview & cetak surat dari permohonan.
// Menampilkan template HTML dengan placeholder yang sudah di-substitusi data
// penduduk, desa, dan isian form.

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ambilConfig } from "@/lib/queries";
import CetakButton from "./CetakButton";
import KopSurat from "./KopSurat";

export const dynamic = "force-static"
export const revalidate = 60;

type Params = { id: string };

// Ganti placeholder [Nama_field] / [field] di template dengan nilai
// dari gabungan data penduduk, config desa, dan isian form.
// Case-insensitive: template OpenSID kadang campur case (e.g. [JUdul_surat])
function substitusiTemplate(
  template: string,
  data: Record<string, string | null | undefined>,
): string {
  if (!template) return "";
  // Bangun lookup lower-case
  const lowerMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v == null || v === "") continue;
    lowerMap[k.toLowerCase()] = String(v);
  }
  // Placeholder opsional yang boleh kosong (QR code, akta, paspor, dsb.)
  // Jika nilai tidak ada di data, placeholder dihapus sepenuhnya
  // (tidak menampilkan teks "[qr_bsre]" atau "[Gol_darah]" kosong dll.)
  //
  // Nama key HARUS MATCH dengan placeholder template (case-insensitive).
  // Template OpenSID kadang pakai camelCase tanpa underscore (e.g. [TaNggalperkawinan])
  // dan punya nama berbeda dari dictionary (e.g. [CaCat] vs catatan).
  const optionalKeys = new Set([
    // QR & NIP
    "qr_bsre", "qr_code", "nip_pamong",
    // Data individu — exact template placeholder names (lowercased)
    "alamat_sebelumnya", "dokumen_pasport", "tanggal_akhir_paspor",
    "akta_lahir", "gol_darah", "akta_perkawinan",
    "taangalperkawinan", "taangalperceraian",
    "hubungan_kk", "cacat",
    // Data orang tua
    "pekerjaan_ayah", "pendidikan_ayah", "pekerjaan_ibu", "pendidikan_ibu",
    "nik_ibu", "nik_ayah",
    // Data spouse
    "nama_suami", "nama_istri", "pekerjaan_suami", "pekerjaan_istri",
    // Lainnya
    "alamat_surat", "tempat_dokumen", "tanggal_dokumen",
    // Identitas desa & kontak
    "website", "nama_kontak", "jabatan_kontak", "kantor_desa",
    "nomor_operator", "kode_desa_bps", "kode_kecamatan",
    "kode_kabupaten", "kode_propinsi",
  ]);
  return template.replace(/\[([^\]]+)\]/g, (_, key) => {
    const k = key.trim();
    const hit = lowerMap[k.toLowerCase()];
    if (hit) return hit;
    if (optionalKeys.has(k.toLowerCase())) return "";
    return `[${k}]`;
  });
}

// Susun dictionary dari banyak sumber data + alias agar case-insensitive
async function susunDataSurat(args: {
  perm: any;
  config: any;
  kades?: any;
  isian: Record<string, string>;
}) {
  const { perm, config, kades, isian } = args;
  const p = perm.pemohon ?? {};
  const kk = p.keluarga ?? {};
  const today = new Date();
  const tglIndo = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // TTL: tempat + tanggal lahir gabung
  const ttl =
    p.tempatlahir && p.tanggallahir
      ? `${p.tempatlahir} / ${tglIndo(new Date(p.tanggallahir))}`
      : p.tanggallahir
        ? tglIndo(new Date(p.tanggallahir))
        : p.tempatlahir ?? "";

  // Alamat lengkap: alamat_sekarang + dusun + RT/RW
  const alamat = [
    p.alamat_sekarang,
    kk.alamat,
    kk.dusun,
    kk.rt ? `RT ${kk.rt}` : null,
    kk.rw ? `RW ${kk.rw}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  // Jenis kelamin: 1=Laki-laki, 2=Perempuan
  const jkLabel =
    p.sex === 1
      ? "Laki-laki"
      : p.sex === 2
        ? "Perempuan"
        : "";

  // Status kawin: 1=Belum Kawin, 2=Kawin, 3= Cerai Hidup, 4=Cerai Mati
  const statusKawinMap: Record<number, string> = {
    1: "Belum Kawin",
    2: "Kawin",
    3: "Cerai Hidup",
    4: "Cerai Mati",
  };

  // Pendidikan dari relasi pendidikan_kk
  const pendidikan = p.pendidikan_kk?.nama ?? "";

  // Status kawin
  const status = statusKawinMap[p.status_kawin ?? 0] ?? "";

  const noSurat = `${String(today.getDate()).padStart(2, "0")}/${
    perm.surat?.kode_surat ?? "SK"
  }/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}/${perm.no_antrian}`;

  return {
    // --- Nama & Identitas Pemohon ---
    nama: p.nama ?? "",
    nik: p.nik ?? "",
    no_kk: p.no_kk ?? "",
    nomor_kk: p.no_kk ?? "",
    kk: p.no_kk ?? "",
    tempat_lahir: p.tempatlahir ?? "",
    tempatlahir: p.tempatlahir ?? "",
    tanggal_lahir: p.tanggallahir ? tglIndo(new Date(p.tanggallahir)) : "",
    tanggallahir: p.tanggallahir ? tglIndo(new Date(p.tanggallahir)) : "",
    tempat_tanggallahir: ttl,
    tempat_tanggal_lahir: ttl,
    ttl: ttl,
    jenis_kelamin: jkLabel,
    jenis_kelamain: jkLabel,
    jk: jkLabel,
    sex: jkLabel,
    agama: p.agama?.nama ?? "",
    status: status,
    status_kawin: status,
    pekerjaan: p.pekerjaan?.nama ?? "",
    pendidikan: pendidikan,
    pendidikan_kk: pendidikan,
    alamat: alamat,
    alamat_tinggal: alamat,
    alamat_lengkap: alamat,
    alamat_sekarang: p.alamat_sekarang ?? "",
    rt: kk.rt ?? "",
    rw: kk.rw ?? "",
    dusun: kk.dusun ?? "",
    desa: kk.desa ?? config.nama_desa ?? "",
    kecamatan: kk.kecamatan ?? config.nama_kecamatan ?? "",
    kabupaten: kk.kabupaten ?? config.nama_kabupaten ?? "",
    provinsi: kk.provinsi ?? config.nama_propinsi ?? "",
    kewarganegaraan: p.warganegara?.nama ?? "",
    warganegara: p.warganegara?.nama ?? "",
    warga_negara: p.warganegara?.nama ?? "",

    // --- Keluarga ---
    kepala_kk: p.nama_ayah ?? p.nama ?? "",
    nama_kepalakeluarga: p.nama_ayah ?? p.nama ?? "",
    nama_ayah: p.nama_ayah ?? "",
    ayah: p.nama_ayah ?? "",
    nama_ibu: p.nama_ibu ?? "",
    ibu: p.nama_ibu ?? "",

    // --- Permohonan ---
    no_antrian: String(perm.no_antrian ?? ""),
    keperluan: perm.keperluan ?? "",
    keterangan: perm.keterangan ?? "",

    // --- Tanggal ---
    tanggal: tglIndo(today),
    tanggal_surat: tglIndo(today),
    hari: today.toLocaleDateString("id-ID", { weekday: "long" }),

    // --- Identitas Desa ---
    nama_desa: config.nama_desa ?? "",
    judul_surat: perm.surat?.nama ?? "",
    JUdul_surat: perm.surat?.nama ?? "",
    kode_desa: config.kode_desa ?? "",
    kode_desa_bps: config.kode_desa_bps ?? "",
    kode_kecamatan: config.kode_kecamatan ?? "",
    kode_kabupaten: config.kode_kabupaten ?? "",
    kode_propinsi: config.kode_propinsi ?? "",
    nama_kecamatan: config.nama_kecamatan ?? "",
    kecamatan_desa: config.nama_kecamatan ?? "",
    nama_kabupaten: config.nama_kabupaten ?? "",
    kabupaten_desa: config.nama_kabupaten ?? "",
    nama_propinsi: config.nama_propinsi ?? "",
    nama_provinsi: config.nama_propinsi ?? "",
    provinsi_desa: config.nama_propinsi ?? "",
    // FIX: db field = alamat (bukan alamat_desa)
    alamat_desa: config.alamat ?? "",
    alamat_kantor: config.alamat_kantor ?? "",
    kode_pos: config.kode_pos ?? "",
    telepon_desa: config.telepon ?? "",
    // FIX: db field = email (bukan email_desa)
    email_desa: config.email ?? "",
    website: config.website ?? "",
    nama_kepala_desa: config.nama_kepala_desa ?? "",
    nama_kades: config.nama_kepala_desa ?? "",
    nama_kepala_camat: config.nama_kepala_camat ?? "",
    nama_camat: config.nama_kepala_camat ?? "",
    nip_camat: config.nip_kepala_camat ?? "",
    sebutan_kabupaten: config.nama_kabupaten ?? "",
    sebutan_kecamatan: "Kecamatan",
    sebutan_desa: config.nama_desa ?? "",
    sebutan_desa_label: "Desa",
    kantor_desa: config.kantor_desa ?? "",
    // Kontak desa
    nama_kontak: config.nama_kontak ?? "",
    hp_kontak: config.hp_kontak ?? "",
    jabatan_kontak: config.jabatan_kontak ?? "",
    nomor_operator: config.nomor_operator ?? "",

    // --- Jabatan (dari pamong yang terkait) ---
    jabatan: kades?.jabatan?.nama ?? perm.jabatan ?? "Kepala Desa",
    atasan: "Kepala Desa",
    // Gelar Kepala Desa
    gelar_depan: kades?.gelar_depan ?? "",
    gelar_belakang: kades?.gelar_belakang ?? "",
    atasan_nama: [kades?.gelar_depan, kades?.pamong_nama, kades?.gelar_belakang].filter(Boolean).join(" ").trim(),
    // [Atas_namA] = label "a.n" (Atas Nama), BUKAN nama orang
    atas_nama: "a.n",
    atas_namA: "a.n",
    nama_pamong: [kades?.gelar_depan, kades?.pamong_nama, kades?.gelar_belakang].filter(Boolean).join(" ").trim(),
    nip_pamong: kades?.pamong_niap ?? "",
    sebutan_nip_desa: "NIP",
    sebutan_nip: "NIP",

    // --- Form isian spesifik template SKCK, dll ---
    form_keterangan:
      isian["form_keterangan"] ??
      isian["keterangan"] ??
      perm.keterangan ??
      perm.keperluan ??
      "",
    keterangan_lain:
      isian["keterangan_lain"] ?? isian["keterangan"] ?? perm.keterangan ?? "",
    berlaku_mulai: isian["berlaku_mulai"] ?? "",
    berlaku_sampai: isian["berlaku_sampai"] ?? "",
    digunakan_untuk: isian["digunakan_untuk"] ?? "",

    // --- Field tambahan template OpenSID ( KTP / Rekor Kepolisian / dll) ---
    // Data individu
    alamat_sebelumnya: "",
    dokumen_pasport: "",
    tanggal_akhir_paspor: "",
    akta_lahir: "",
    gol_darah: "",
    akta_perkawinan: "",
    tanggal_perkawinan: "",
    akta_perceraian: "",
    tanggal_perceraian: "",
    hubungan_kk: "",
    catatan: "",
    // Data orang tua
    nama_ibu: p.nama_ibu ?? "",
    nama_ayah: p.nama_ayah ?? "",
    nik_ibu: p.nik_ibu ?? "",
    nik_ayah: p.nik_ayah ?? "",
    pekerjaan_ayah: "",
    pendidikan_ayah: "",
    pekerjaan_ibu: "",
    pendidikan_ibu: "",
    // Data spouse
    nama_suami: "",
    nama_istri: "",
    pekerjaan_suami: "",
    pekerjaan_istri: "",
    // Lainnya
    alamat_surat: "",
    tempat_dokumen: "",
    tanggal_dokumen: "",

    // --- Nomor Surat ---
    nomor_surat: noSurat,
    no_surat: noSurat,
    format_nomor_surat: noSurat,
    kode_surat: perm.surat?.kode_surat ?? "",
    tgl_surat: tglIndo(today),
    tgL_surat: tglIndo(today),

    // --- QR placeholder (template OpenSID) ---
    qr_bsre: "",

    // --- Isian form user (fallback) ---
    ...Object.fromEntries(
      Object.entries(isian).map(([k, v]) => [k.toLowerCase(), String(v ?? "")]),
    ),
  };
}

export default async function CetakSuratPage({ params }: { params: Params }) {
  const permId = parseInt(params.id, 10);
  if (isNaN(permId)) notFound();

  const perm = await prisma.permohonanSurat.findUnique({
    where: { id: permId },
    include: {
      pemohon: {
        include: {
          agama: { select: { nama: true } },
          pekerjaan: { select: { nama: true } },
          pendidikan_kk: { select: { nama: true } },
          warganegara: { select: { nama: true } },
          keluarga: { select: { dusun: true, rt: true, rw: true, alamat: true } },
        },
      },
      surat: { select: { id: true, nama: true, kode_surat: true, template: true } },
    },
  });

  if (!perm || !perm.surat?.template) notFound();

  const config = await ambilConfig();

  // Cari pamong kepala desa untuk tanda tangan
  const kades = await prisma.pamong.findFirst({
    where: {
      config_id: config.id,
      jabatan: { nama: { contains: "Kepala Desa" } },
      pamong_status: 1,
    },
    select: {
      pamong_nama: true,
      pamong_niap: true,
      gelar_depan: true,
      gelar_belakang: true,
      jabatan: { select: { nama: true } },
    },
  });

  let isian: Record<string, string> = {};
  try {
    isian = perm.isian_form ? JSON.parse(perm.isian_form) : {};
  } catch {
    // ignore
  }

  const data = await susunDataSurat({ perm, config, kades, isian });
  let template = substitusiTemplate(perm.surat.template, data);

  // Post-process: ganti koma + spasi di dalam cell tabel tanda tangan
  // dengan koma + non-breaking space agar "Desa, dd Month yyyy" tidak
  // ter-wrap ke baris baru di kolom sempit OpenSID.
  template = template.replace(
    /(<td[^>]*text-align:\s*center[^>]*>)([^<]{20,})(\s*,\s*)([^<]+)(<\/td>)/g,
    (_m, open, a, sep, b, close) =>
      `${open}<span style="white-space:nowrap">${a}${sep.replace(" ", "&nbsp;")}${b}</span>${close}`,
  );

  const noSurat = data["nomor_surat"];

  return (
    <div className="container-page py-8 lg:py-12">
      <nav aria-label="Navigasi butir" className="mb-6 text-sm">
        <Link href="/admin/surat/permohonan" className="link-clay">
          ← Kembali ke Permohonan
        </Link>
      </nav>

      {/* Toolbar */}
      <div className="mb-8 flex items-center justify-between border-b border-ink/15 pb-4">
        <div>
          <h1 className="font-serif text-2xl">Cetak Surat</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {perm.surat.nama} — {perm.pemohon?.nama ?? "—"}
          </p>
        </div>
        <CetakButton />
      </div>

      {/* Info ringkas */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 text-sm">
        <div>
          <span className="text-ink-muted">No. Antrian:</span> #
          {perm.no_antrian}
        </div>
        <div>
          <span className="text-ink-muted">Tanggal Pengajuan:</span>{" "}
          {new Date(perm.created_at).toLocaleDateString("id-ID")}
        </div>
        <div>
          <span className="text-ink-muted">No. Surat:</span> {noSurat}
        </div>
      </div>

      {/* Template rendered */}
      <div
        id="surat-preview"
        className="mx-auto max-w-[21cm] rounded border border-ink/15 bg-white p-8 shadow-sm"
      >
        {/* Kop surat otomatis (logo + nama pemerintah + kecamatan + desa + alamat).
            Ditempatkan di paling atas, di atas template, mengikuti format OpenSID. */}
        <KopSurat
          logoUrl={config.logo ?? null}
          namaDesa={config.nama_desa ?? ""}
          namaKecamatan={config.nama_kecamatan ?? ""}
          namaKabupaten={config.nama_kabupaten ?? ""}
          namaPropinsi={config.nama_propinsi ?? ""}
          // FIX: db field = alamat (bukan alamat_desa)
          alamatDesa={config.alamat ?? null}
          alamatKantor={config.alamat_kantor ?? null}
          kodePos={config.kode_pos ?? null}
          telepon={config.telepon ?? null}
          hpKontak={config.hp_kontak ?? null}
          email={config.email ?? null}
          website={config.website ?? null}
        />
        <div dangerouslySetInnerHTML={{ __html: template }} />
      </div>

      {Object.keys(isian).length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-ink-muted">
            Data isian form
          </summary>
          <div className="mt-2 rounded border border-ink/10 bg-paper-dim p-3 text-xs font-mono">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(isian, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
