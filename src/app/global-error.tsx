"use client";

// Global error boundary untuk root layout.
// Di-render saat error terjadi DI root layout itu sendiri
// (mis. gagal load font, gagal resolve Provider, dsb).
// File ini HARUS menyertakan <html> dan <body> sendiri karena
// membungkus root layout yang gagal render.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NextSID] Global error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#fafaf7",
          color: "#1a1a1a",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            maxWidth: "36rem",
            margin: "0 auto",
            padding: "6rem 1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7a6f63",
              marginBottom: "0.5rem",
            }}
          >
            Galat Sistem
          </p>
          <h1
            style={{
              fontFamily:
                "Georgia, 'Times New Roman', ui-serif, serif",
              fontSize: "2.25rem",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Aplikasi Mengalami Galat
          </h1>
          <p
            style={{
              color: "#4a4339",
              marginTop: "1rem",
              lineHeight: 1.6,
            }}
          >
            Sistem tidak dapat memuat tampilan utama. Coba muat ulang. Jika
            masalah berlanjut, hubungi administrator.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#7a6f63",
                marginTop: "1.5rem",
                borderTop: "1px solid rgba(26,26,26,0.1)",
                paddingTop: "0.75rem",
              }}
            >
              Kode galat: <code>{error.digest}</code>
            </p>
          )}

          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              background: "#1a1a1a",
              color: "#fafaf7",
              border: "1px solid #1a1a1a",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}