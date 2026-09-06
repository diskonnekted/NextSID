// Halaman form — tambah artikel baru.

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";
export const revalidate = 60;

async function ambilSemuaKategori() {
  return prisma.kategori.findMany({
    where: { enabled: 1 },
    orderBy: { kategori: "asc" },
    select: { id: true, kategori: true },
  });
}

async function ambilSemuaPenulis() {
  return prisma.user.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
    take: 100,
  });
}

export default async function ArtikelBaruPage() {
  const [kategoriList, penulisList] = await Promise.all([
    ambilSemuaKategori(),
    ambilSemuaPenulis(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl">Tambah Artikel</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Tulis berita atau pengumuman baru untuk desa.
          </p>
        </div>
        <Link
          href="/admin/artikel"
          className="text-sm text-clay hover:text-ink"
        >
          Kembali ke daftar
        </Link>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const judul = formData.get("judul") as string;
          const isi = formData.get("isi") as string;
          const idKategori = formData.get("id_kategori") as string;
          const idPenulis = formData.get("id_penulis") as string;
          const gambar = formData.get("gambar") as string || null;
          const enabled = parseInt(formData.get("enabled") as string, 10) || 1;
          const headline = parseInt(formData.get("headline") as string, 10) || 0;
          const tglUpload = formData.get("tgl_upload") as string;

          const slug = judul
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .slice(0, 80);

          await prisma.artikel.create({
            data: {
              judul,
              slug,
              isi,
              id_kategori: idKategori ? parseInt(idKategori, 10) : null,
              id_user: idPenulis ? parseInt(idPenulis, 10) : null,
              enabled,
              headline,
              tgl_upload: tglUpload ? new Date(tglUpload) : new Date(),
              gambar,
            },
          });
        }}
        className="space-y-6"
      >
        {/* Judul */}
        <div>
          <label htmlFor="judul" className="meta mb-2 block text-sm font-medium">
            Judul <span className="text-clay">*</span>
          </label>
          <input
            type="text"
            id="judul"
            name="judul"
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            placeholder="Masukkan judul artikel..."
          />
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="id_kategori" className="meta mb-2 block text-sm font-medium">
            Kategori
          </label>
          <select
            id="id_kategori"
            name="id_kategori"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          >
            <option value="">— Tanpa Kategori —</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kategori}
              </option>
            ))}
          </select>
        </div>

        {/* Penulis */}
        <div>
          <label htmlFor="id_penulis" className="meta mb-2 block text-sm font-medium">
            Penulis
          </label>
          <select
            id="id_penulis"
            name="id_penulis"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          >
            <option value="">— Pilih Penulis —</option>
            {penulisList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Isi */}
        <div>
          <label htmlFor="isi" className="meta mb-2 block text-sm font-medium">
            Isi Artikel <span className="text-clay">*</span>
          </label>
          <textarea
            id="isi"
            name="isi"
            rows={15}
            required
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            placeholder="Tulis isi artikel di sini..."
          />
        </div>

        {/* Gambar URL */}
        <div>
          <label htmlFor="gambar" className="meta mb-2 block text-sm font-medium">
            URL Gambar (opsional)
          </label>
          <input
            type="url"
            id="gambar"
            name="gambar"
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            placeholder="https://contoh.com/gambar.jpg"
          />
        </div>

        {/* Tanggal Upload */}
        <div>
          <label htmlFor="tgl_upload" className="meta mb-2 block text-sm font-medium">
            Tanggal Upload
          </label>
          <input
            type="date"
            id="tgl_upload"
            name="tgl_upload"
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          />
        </div>

        {/* Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              value="1"
              defaultChecked
              className="h-4 w-4 border-ink/20 text-clay focus:ring-clay"
            />
            <label htmlFor="enabled" className="text-sm">
              Publikasikan (aktif)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="headline"
              name="headline"
              value="1"
              className="h-4 w-4 border-ink/20 text-clay focus:ring-clay"
            />
            <label htmlFor="headline" className="text-sm">
              Tampilkan sebagai headline
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/artikel"
            className="inline-flex items-center rounded border border-ink/20 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="inline-flex items-center rounded bg-clay px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink"
          >
            Simpan Artikel
          </button>
        </div>
      </form>
    </div>
  );
}
