// src/components/Header.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type LinkItem = {
    label: string;
    href: string;
    desc?: string;
    external?: boolean;
    placeholder?: boolean; // ← 追加: ダミー埋め用
};

// 4枚にパディング（不足分はプレースホルダーで埋める）
function padToFour(list: LinkItem[]): LinkItem[] {
    const need = Math.max(0, 4 - list.length);
    return [
        ...list,
        ...Array.from({ length: need }, () => ({
            label: '',
            href: '#',
            placeholder: true,
        })),
    ];
}

const calcUS: LinkItem[] = [
    {
        label: 'Shopify BreakEven (US)',
        href: 'https://enyukari.capoo.jp/profit-calc/shopify-be/',
        desc: 'Shopify用の損益分岐点を簡単に計算できます。',
    },
    {
        label: '損益分岐点 (US)',
        href: 'https://enyukari.capoo.jp/profit-calc/be-us/',
        desc: 'US用の損益分岐点を簡単に計算できます。',
    },
    {
        label: '利益計算 (US)',
        href: 'https://enyukari.capoo.jp/profit-calc/us-calc/',
        desc: 'US用の利益計算を行い、詳細な数値を確認できます。',
    },
    {
        label: '売値逆算計算 (US)',
        href: 'https://enyukari.capoo.jp/profit-calc/reverse/',
        desc: 'コストから必要な売値を逆算します。',
    },
];

const calcUK: LinkItem[] = [
    {
        label: '利益計算 (UK)',
        href: 'https://enyukari.capoo.jp/profit-calc/calc-uk/',
        desc: 'UK用の利益計算をまとめています。',
    },
];

const mgmt: LinkItem[] = [
    {
        label: '発送情報管理',
        href: 'https://enyukari.capoo.jp/profit-calc/shipping-manager/',
        desc: '発送情報を一覧・検索・カテゴリ連携で管理します。',
    },
];

function useLockBodyScroll(locked: boolean) {
    useEffect(() => {
        if (!locked) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, [locked]);
}



export default function Header() {
    const [open, setOpen] = useState<'calc-us' | 'calc-uk' | 'mgmt' | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    useLockBodyScroll(!!open || mobileOpen);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!open) return;
            const t = e.target as Node;
            if (panelRef.current && !panelRef.current.contains(t)) setOpen(null);
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') setOpen(null);
        }
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('click', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const sections = useMemo(() => ({
        'calc-us': { title: 'Calc-US', links: calcUS },
        'calc-uk': { title: 'Calc-UK', links: calcUK },
        'mgmt': { title: '管理システム', links: mgmt },
    }), []);

    const MenuPanel = ({ which }: { which: NonNullable<typeof open> }) => {
        const items = padToFour(sections[which].links); // ← すべてのカテゴリを4枚に
        return (
            <div className="fixed inset-x-0 top-[64px] z-40" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-black/20" />
                <div
                    ref={panelRef}
                    className="relative mx-auto w-[80vw] max-w-[1200px] rounded-2xl border bg-white p-8 shadow-2xl min-h-[50vh] max-h-[80vh] overflow-auto"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-center w-full">{sections[which].title}</h2>
                        <button
                            className="absolute right-4 top-4 rounded-md border px-2 py-1 text-sm"
                            onClick={() => setOpen(null)}
                            aria-label="閉じる"
                        >✕</button>
                    </div>

                    {/* 2×2 固定グリッド / カード高さ統一 */}
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                        {items.map((l, i) => {
                            const base =
                                "block rounded-lg border p-6 min-h-[120px] " + // ← 高さそろえ
                                "hover:border-indigo-300 hover:bg-indigo-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-400";
                            if (l.placeholder) {
                                return (
                                    <div
                                        key={`ph-${i}`}
                                        className={`${base} opacity-0 pointer-events-none`}
                                        aria-hidden="true"
                                    />
                                );
                            }
                            return (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    className={base}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <div className="font-semibold">{l.label}</div>
                                    {l.desc && <p className="mt-2 text-sm text-zinc-500">{l.desc}</p>}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <header className="bg-white shadow sticky top-0 z-50">
                <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
                    <Link href="/" className="text-lg font-bold">muu-studio</Link>
                    <nav aria-label="メイン" className="hidden md:block">
                        <ul className="flex gap-8">
                            <li>
                                <Link
                                    href="https://enyukari.capoo.jp/profit-calc/"
                                    className="inline-flex item-center px-4 py-2 rounded-md font-medium transition-colors duration-200
                   hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none
                   focus:ring-2 focus:ring-indigo-400"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <button
                                    className="px-4 py-2 rounded-md cursor-pointer font-medium 
                                                transition-colors duration-200
                                                hover:bg-indigo-50 hover:text-indigo-700
                                                focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    aria-haspopup="dialog"
                                    aria-expanded={open === 'calc-us'}
                                    onClick={() => setOpen(open === 'calc-us' ? null : 'calc-us')}
                                >
                                    Calc-US
                                </button>
                            </li>
                            <li>
                                <button
                                    className="px-4 py-2 rounded-md cursor-pointer font-medium 
                                                transition-colors duration-200
                                                hover:bg-indigo-50 hover:text-indigo-700
                                                focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    aria-haspopup="dialog"
                                    aria-expanded={open === 'calc-uk'}
                                    onClick={() => setOpen(open === 'calc-uk' ? null : 'calc-uk')}
                                >
                                    Calc-UK
                                </button>
                            </li>
                            <li>
                                <button
                                    className="px-4 py-2 rounded-md cursor-pointer font-medium 
                                                transition-colors duration-200
                                                hover:bg-indigo-50 hover:text-indigo-700
                                                focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    aria-haspopup="dialog"
                                    aria-expanded={open === 'mgmt'}
                                    onClick={() => setOpen(open === 'mgmt' ? null : 'mgmt')}
                                >
                                    管理システム
                                </button>
                            </li>
                        </ul>
                    </nav>
                    {/* モバイル：ハンバーガー */}
                    <button
                        className="md:hidden inline-flex flex-col items-center justify-center space-y-1.5 size-10 rounded-md border"
                        aria-label="メニューを開く"
                        aria-haspopup="dialog"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen(true)}
                    >
                        {/* シンプルな三本線 */}
                        <span className="block w-6 h-0.5 bg-black rounded" />
                        <span className="block w-6 h-0.5 bg-black rounded" />
                        <span className="block w-6 h-0.5 bg-black rounded" />
                    </button>
                </div>
            </header>

            {open && <MenuPanel which={open} />}
            {/* モバイルの全画面メニュー  ← ここに貼る */}
            {mobileOpen && (
                <div className="fixed inset-0 z-60" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-x-0 bottom-0 h-[88vh] bg-white rounded-t-2xl shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <span className="font-semibold">メニュー</span>
                            <button
                                className="rounded-md border px-3 py-1 text-sm"
                                onClick={() => setMobileOpen(false)}
                                aria-label="閉じる"
                            >✕</button>
                        </div>

                        <div className="overflow-auto p-3 space-y-3">
                            {/* ← ここに Home を先頭追加 */}
                            <a
                                href="https://enyukari.capoo.jp/profit-calc/"
                                className="block rounded-md border p-3 hover:border-indigo-300 hover:bg-indigo-50/40"
                                onClick={() => setMobileOpen(false)}
                            >
                                <div className="font-semibold">Home</div>
                                <p className="text-sm text-zinc-500 mt-1">トップページへ戻る</p>
                            </a>

                            {(['calc-us', 'calc-uk', 'mgmt'] as const).map((key) => (
                                <details key={key} className="rounded-lg border">
                                    <summary className="cursor-pointer select-none px-4 py-3 font-medium">
                                        {sections[key].title}
                                    </summary>
                                    <div className="p-3 grid gap-3">
                                        {sections[key].links.map(l => (
                                            <a
                                                key={l.label}
                                                href={l.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block rounded-md border p-3 hover:border-indigo-300 hover:bg-indigo-50/40"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <div className="font-semibold">{l.label}</div>
                                                {l.desc && <p className="text-sm text-zinc-500 mt-1">{l.desc}</p>}
                                            </a>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
