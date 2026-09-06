// Kop surat otomatis untuk halaman preview & cetak.
// Menampilkan logo desa + nama pemerintah kabupaten/kota,
// kecamatan, desa, dan alamat sesuai Config.
//
// Dipakai sebagai wrapper di dalam #surat-preview agar styling
// konsisten dengan template (warna hitam pekat, layout A4).

type Props = {
  logoUrl?: string | null;
  namaDesa: string;
  namaKecamatan: string;
  namaKabupaten: string;
  namaPropinsi: string;
  alamatDesa?: string | null;
  alamatKantor?: string | null;
  kodePos?: string | null;
  telepon?: string | null;
  hpKontak?: string | null;
  email?: string | null;
  website?: string | null;
};

export default function KopSurat({
  logoUrl,
  namaDesa,
  namaKecamatan,
  namaKabupaten,
  namaPropinsi,
  alamatDesa,
  alamatKantor,
  kodePos,
  telepon,
  hpKontak,
  email,
  website,
}: Props) {
  const barisAlamat = [
    alamatKantor ? `Kantor: ${alamatKantor}` : null,
    alamatDesa,
    kodePos ? `Kode Pos ${kodePos}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  const barisKontak = [
    telepon ? `Telp. ${telepon}` : null,
    hpKontak ? `HP ${hpKontak}` : null,
    email ? `Email: ${email}` : null,
    website ? `Website: ${website}` : null,
  ]
    .filter(Boolean)
    .join("  •  ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        paddingBottom: 14,
        marginBottom: 18,
        borderBottom: "3px solid #000",
        borderBottomStyle: "double",
      }}
    >
      {/* Logo */}
      <div
        style={{
          flex: "0 0 auto",
          width: 86,
          height: 86,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`Logo ${namaDesa}`}
            width={86}
            height={86}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              width: 86,
              height: 86,
              border: "1px dashed #888",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#888",
              textAlign: "center",
            }}
          >
            Logo Desa
          </div>
        )}
      </div>

      {/* Teks kop */}
      <div style={{ flex: 1, textAlign: "center", lineHeight: 1.25 }}>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: 1 }}>
          PEMERINTAH {namaPropinsi.toUpperCase()}
        </p>
        <p style={{ margin: 0, fontSize: 12, letterSpacing: 1 }}>
          {namaKabupaten.toUpperCase()} · KECAMATAN {namaKecamatan.toUpperCase()}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          KEPALA DESA {namaDesa.toUpperCase()}
        </p>
        {barisAlamat ? (
          <p style={{ margin: "4px 0 0", fontSize: 10 }}>
            {barisAlamat}
          </p>
        ) : null}
        {barisKontak ? (
          <p style={{ margin: "2px 0 0", fontSize: 10 }}>
            {barisKontak}
          </p>
        ) : null}
      </div>
    </div>
  );
}
