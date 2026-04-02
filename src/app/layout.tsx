import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Backlog Toolbox",
  description: "個人用ユーティリティWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark font-sans">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="ml-[var(--sidebar-width)] flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
