// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  title: "US-BE",
  description: "計算アプリ＆管理アプリの共通メニュー",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col">
        {/* 高さ固定でブレさせない */}
        <div className="h-16 shrink-0">
          <Header />
        </div>

        {/* ★ 幅はここだけで管理（page では container/max-w を使わない） */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-6 w-full">
            {children}
          </div>
        </main>

        {/* 高さ固定でブレさせない */}
        <div className="h-12 shrink-0">
          <Footer />
        </div>
      </body>
    </html>
  );
}
