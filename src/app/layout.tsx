import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className={inter.variable}>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="ml-[var(--sidebar-width)] flex-1 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
