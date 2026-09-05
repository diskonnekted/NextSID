// Layout khusus /admin/* — SessionProvider + sidebar profesional.
//
// Middleware sudah memastikan session ada sebelum layout ini di-render.
//
// TATA LETAK:
// ┌─────────────────────────────────────────────────────┐
// │ [ data-admin-scope ]                                │
// │ ┌──────────────┬──────────────────────────────────┐ │
// │ │   Sidebar    │  Topbar (breadcrumb + aksi)      │ │
// │ │   (sticky)   ├──────────────────────────────────┤ │
// │ │              │                                  │ │
// │ │              │  Konten halaman                  │ │
// │ │              │                                  │ │
// │ └──────────────┴──────────────────────────────────┘ │
// └─────────────────────────────────────────────────────┘
//
// Catatan: root layout (app/layout.tsx) tetap membungkus kita dengan
// <SiteHeader> & <SiteFooter>. CSS global menyembunyikan keduanya
// ketika [data-admin-scope] hadir di body (lihat globals.css).

import type { ReactNode } from "react";
import { Provider } from "@/lib/auth";
import { Sidebar } from "./_sidebar";
import { TopbarAdmin } from "./_topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <div data-admin-scope className="min-h-screen bg-paper">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopbarAdmin />
            <main className="flex-1 px-5 py-8 lg:px-10 lg:py-12">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </Provider>
  );
}