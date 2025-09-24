// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: '',
  description: 'Calc-US / Calc-UK / 管理システムの共通メニュー',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-zinc-100 text-zinc-900 flex min-h-screen flex-col">
        {/* 共通ヘッダー（中央展開メニュー付き） */}
        <Header />

        {/* 各ページが入るメイン領域 */}
        <main className="flex-1 mx-auto max-w-7xl p-6">
          {children}
        </main>

        {/* 共通フッター */}
        <Footer />
      </body>
    </html>
  );
}
