import { PropsWithChildren } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-background text-foreground">
      <SiteHeader />
      <main className="container py-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
