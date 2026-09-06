"use client";

export default function DeleteKategoriBtn({ id }: { id: number }) {
  return (
    <button
      type="button"
      className="text-xs text-ink-muted hover:text-clay"
      onClick={async () => {
        if (window.confirm("Hapus kategori ini?")) {
          await fetch(`/api/admin/kategori/${id}`, { method: "DELETE" });
          window.location.reload();
        }
      }}
    >
      Hapus
    </button>
  );
}
