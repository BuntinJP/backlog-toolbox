import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-meta";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark font-sans">
      <body>
        <TooltipProvider>
          <SidebarProvider defaultOpen>
            <Sidebar />
            <SidebarInset className="min-h-svh">
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
