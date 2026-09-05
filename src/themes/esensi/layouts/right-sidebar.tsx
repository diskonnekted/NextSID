import { Sidebar } from "../partials/sidebar";

export default async function RightSidebarLayout({
  main,
  sticky = true,
}: {
  main: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <div className="container-page py-12 lg:py-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-8">{main}</div>
        <div
          className={`min-w-0 lg:col-span-4 ${
            sticky ? "lg:sticky lg:top-8 lg:self-start" : ""
          }`}
        >
          <Sidebar />
        </div>
      </div>
    </div>
  );
}