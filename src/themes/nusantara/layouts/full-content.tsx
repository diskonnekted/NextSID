// Layout konten penuh untuk tema "nusantara".

export default function FullContentLayout({
  main,
}: {
  main: React.ReactNode;
}) {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">{main}</div>
    </div>
  );
}