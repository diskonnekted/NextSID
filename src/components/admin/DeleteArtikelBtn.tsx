"use client";

export default function DeleteArtikelBtn({ id }: { id: number }) {
  return (
    <button
      type="button"
      className="text-xs text-ink-muted hover:text-clay"
      onClick={async () => {
        if (window.confirm("Hapus artikel ini?")) {
          await fetch(`/api/admin/artikel/${id}`, { method: "DELETE" });
          window.location.reload();
        }
      }}
    >
      Hapus
    </button>
  );
}
