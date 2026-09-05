// Halaman login admin — form email + kata sandi.
//
// Server component: tidak baca session (middleware sudah whitelist
// path ini). Render client component FormLogin untuk interaksi.

import type { Metadata } from "next";
import { Suspense } from "react";
import { Provider } from "@/lib/auth";
import { FormLogin } from "./_form-login";

export const metadata: Metadata = {
  title: "Masuk Dasbor — Admin Desa",
  description: "Halaman masuk untuk administrator desa.",
};

export default function LoginPage() {
  return (
    <Provider>
      <main className="container-page flex min-h-[80vh] items-center py-16">
        <div className="w-full max-w-md border border-ink/15 bg-paper p-8 lg:p-10">
          <p className="meta">Dasbor</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight">
            Masuk Administrator
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Gunakan kredensial yang diberikan oleh admin desa. Akses ke halaman
            ini hanya untuk pengelola sistem.
          </p>

          <Suspense fallback={null}>
            <FormLogin />
          </Suspense>

          <p className="mt-8 border-t border-ink/10 pt-4 text-2xs text-ink-muted">
            Kredensial demo:{" "}
            <span className="font-mono text-ink">admin@desa.id</span> /{" "}
            <span className="font-mono text-ink">admin</span>
          </p>
        </div>
      </main>
    </Provider>
  );
}