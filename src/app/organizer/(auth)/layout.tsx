import { SiteHeader } from "@/components/SiteHeader";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12 sm:py-16">{children}</main>
    </>
  );
}
