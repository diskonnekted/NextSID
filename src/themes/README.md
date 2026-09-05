# Theme System

Port 1:1 dari konsep `storage/app/themes/{nama}/` di OpenSID.

## Struktur

```
src/themes/
└── esensi/                    ← folder tema
    ├── index.ts               ← exports `theme` (partials + layouts + config + tokens)
    ├── theme.config.ts        ← opsi tema untuk dasbor admin
    ├── tokens.ts              ← design tokens (override Tailwind)
    ├── partials/              ← potong UI spesifik tema
    │   ├── header.tsx
    │   ├── footer.tsx
    │   ├── slider.tsx
    │   ├── headline.tsx
    │   ├── article.tsx
    │   ├── sidebar.tsx
    │   ├── search.tsx
    │   └── pagination.tsx
    ├── layouts/               ← wrapper grid halaman
    │   ├── right-sidebar.tsx  ← 8/4 (default)
    │   ├── left-sidebar.tsx   ← 4/8
    │   └── full-content.tsx   ← max-w-3xl, tanpa sidebar
    └── widgets/               ← blok sidebar yang bisa ditambahkan
        └── agenda.tsx
```

## Cara Pakai di Halaman

```tsx
import { ambilThemeAktif } from "@/lib/theme";

export default async function Halaman() {
  const theme = await ambilThemeAktif();
  const Layout = theme.layouts["right-sidebar"];
  const Article = theme.partials.Article;

  return (
    <Layout main={
      <>
        <h1>Judul Halaman</h1>
        {artikelList.map(a => <Article key={a.id} artikel={a} />)}
      </>
    } />
  );
}
```

## Cara Tambah Theme Baru

1. Buat folder `src/themes/{nama}/` dengan struktur sama
2. Buat `index.ts` yang export objek `theme` (lihat `src/themes/esensi/index.ts`)
3. Daftarkan di `src/lib/theme.ts`:

   ```ts
   import themeBaru from "@themes/{nama}";
   const themesTersedia: Record<string, ModulTheme> = {
     esensi: themeEsensi,
     "{nama}": themeBaru,
   };
   ```

4. Pilih dari dasbor admin (akan dipasang di langkah berikutnya) atau set manual:

   ```sql
   UPDATE setting SET value = '{nama}' WHERE key = 'default_theme';
   ```

## Override Partial

Untuk override salah satu partial tanpa menulis ulang seluruh tema:

1. Di folder tema baru, buat file yang sama di `partials/` misalnya `partials/header.tsx`
2. Export implementasi baru dari `partials/header.tsx`
3. Partial lain yang tidak di-override akan tetap memakai default

## Setting yang Dibaca

| Key                          | Tipe    | Default            | Efek                                  |
|------------------------------|---------|--------------------|---------------------------------------|
| `default_theme`              | text    | `esensi`           | Pilih theme aktif                     |
| `jumlah_slider`              | number  | `4`                | Slide hero yang tampil                |
| `jumlah_artikel_pilihan`     | number  | `3`                | Artikel featured di halaman depan     |
| `jumlah_artikel_perhalaman`  | number  | `9`                | Pagination default                    |
| `tampilkan_sidebar`          | boolean | `true`             | Tampilkan/sembunyikan sidebar         |
| `layout_halaman_depan`       | select  | `right-sidebar`    | Layout halaman depan                  |