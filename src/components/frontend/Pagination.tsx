import Link from "next/link";

type PaginationProps = {
  halaman: number;
  total: number;
  perHalaman: number;
  basePath: string;
  queryParams?: Record<string, string | undefined>;
};

function buildHref(basePath: string, halaman: number, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) sp.set(k, v);
  });
  if (halaman > 1) sp.set("halaman", String(halaman));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ halaman, total, perHalaman, basePath, queryParams = {} }: PaginationProps) {
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  if (totalHalaman <= 1) return null;

  const prev = Math.max(1, halaman - 1);
  const next = Math.min(totalHalaman, halaman + 1);

  return (
    <nav aria-label="Halaman" className="mt-16 flex items-center justify-between border-t border-ink/15 pt-8">
      {halaman > 1 ? (
        <Link href={buildHref(basePath, prev, queryParams)} className="link-clay">
          ← Halaman sebelumnya
        </Link>
      ) : (
        <span className="text-ink-muted">← Halaman sebelumnya</span>
      )}

      <p className="meta">
        Halaman {halaman} dari {totalHalaman}
      </p>

      {halaman < totalHalaman ? (
        <Link href={buildHref(basePath, next, queryParams)} className="link-clay">
          Halaman berikutnya →
        </Link>
      ) : (
        <span className="text-ink-muted">Halaman berikutnya →</span>
      )}
    </nav>
  );
}