"use client";

// Tombol cetak surat — Client Component untuk handle onClick.
export default function CetakButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-clay px-5 py-2 text-sm font-semibold text-paper hover:bg-ink"
    >
      🖨️ Cetak / PDF
    </button>
  );
}
