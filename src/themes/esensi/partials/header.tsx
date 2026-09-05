// Theme "esensi" — partial header.
// Re-export dari komponen default di src/components/frontend.
// Tema lain bisa membuat implementasi sendiri dengan nama file yang sama
// untuk melakukan override tanpa mengubah @/components.

import { SiteHeader as DefaultHeader } from "@/components/frontend/SiteHeader";

export const Header = DefaultHeader;
export default Header;