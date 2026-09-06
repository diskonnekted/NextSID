import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = 60;

async function ambilSemuaKategori() {
  return prisma.kategori.findMany({
    where: { enabled: 1 },
    orderBy: { urut: "asc" },
    select: { id: true, kategori: true, parent_id: true },
  });
}

export default async function BaruKategoriPage() {
  const [allKategori] = await Promise.all([
    ambilSemuaKategori(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-baseline border-b border-ink/15 pb-4">
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl">Tambah Kategori</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Buat kategori artikel baru untuk portal desa.
          </p>
        </div>
        <Link href="/admin/kategori" className="text-sm text-clay hover:text-ink">
          Kembali ke daftar
        </Link>
      </div>

      <form
        action={async (formData) => {
          "use server";
          const nama = formData.get("nama") as string;
          const parent_id = formData.get("parent_id") as string;
          const urut = parseInt(formData.get("urut") as string, 10) || 0;
          const enabled = formData.get("enabled") === "on" ? 1 : 0;

          if (!nama.trim()) return;

          const slug = nama
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .slice(0, 80);

          await prisma.kategori.create({
            data: {
              kategori: nama.trim(),
              slug,
              parent_id: parent_id && parent_id !== "" ? parseInt(parent_id, 10) : null,
              urut,
              enabled,
            },
          });
          revalidatePath("/admin/kategori");
          redirect("/admin/kategori");
        }}
        className="max-w-lg space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-ink">
            Nama Kategori <span className="text-red-600">*</span>
          </label>
          <input
            name="nama"
            type="text"
            required
            maxLength={100}
            className="mt-1 w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
            placeholder="Contoh: Pendidikan, Kesehatan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">
            Kategori Induk
          </label>
          <select
            name="parent_id"
            defaultValue=""
            className="mt-1 w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          >
            <option value="">— Tanpa induk (kategori utama) —</option>
            {allKategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kategori}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink">
            Urutan
          </label>
          <input
            name="urut"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full border border-ink/20 bg-paper px-3 py-2 text-sm focus:border-clay focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="enabled"
            name="enabled"
            type="checkbox"
            defaultValue="on"
            className="h-4 w-4 rounded border-ink/20 text-clay focus:ring-clay"
          />
          <label htmlFor="enabled" className="text-sm text-ink">
            Publikasikan (aktif)
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded bg-clay px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink"
          >
            Simpan
          </button>
          <Link
            href="/admin/kategori"
            className="inline-flex items-center rounded border border-ink/20 px-4 py-2 text-sm text-ink-muted hover:border-clay hover:text-clay"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
