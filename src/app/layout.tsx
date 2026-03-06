import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

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
    <html lang="ja">
      <body className={inter.variable}>
        <div className="app-layout">
          <Sidebar />
          <div className="main-area">{children}</div>
        </div>
      </body>
    </html>
  );
}
