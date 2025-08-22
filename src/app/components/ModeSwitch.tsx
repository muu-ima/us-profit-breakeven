"use client";

import { useMemo, KeyboardEvent } from "react";

export type Mode = "breakEven" | "tariff" | "insurance";

const OPTIONS: { label: string; value: Mode }[] = [
    { label: "損益分岐点", value: "breakEven" },
    { label: "関税込み", value: "tariff" },
    { label: "保険(+30%)", value: "insurance" },
];

export default function ModeSwitch({
    mode,
    onChange,
}: {
    mode: Mode;
    onChange: (m: Mode) => void;
}) {
    // 見つからない時は 0 にフォールバック
    const idx = useMemo(() => Math.max(0, OPTIONS.findIndex(o => o.value === mode)), [mode]);

    // 矢印キーで左右移動 (A11y)
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = (idx + dir + OPTIONS.length) % OPTIONS.length;
        onChange(OPTIONS[next].value);
    };

    return (
        <div
            className="w-full max-w-md"
            role="tablist"
            aria-label="価格表示モード"
            onKeyDown={onKeyDown}
            tabIndex={0} // コンテナ自体をフォーカス可能に
        >
            {/* relative をここに付けてスライダーの基準にする */}
            <div className="relative grid grid-cols-3 bg-gray-200 rounded-full p-1">
                {/* スライダー：下層・パディングに合わせて inset */}
                <div
                    aria-hidden
                    className="absolute inset-y-1 left-1 w-1/3 rounded-full bg-white shadow transition-transform duration-200"
                    style={{ transform: `translateX(${idx * 100}%)` }}
                />

                {/* 各オプション */}
                {OPTIONS.map((opt, i) => {
                    const selected = i === idx;
                    return (
                        <button
                            key={opt.value}
                            role="tab"
                            aria-selected={selected}
                            tabIndex={selected ? 0 : -1}
                            className={
                                "relative z-10 text-center text-sm rounded-full py-2 font-medium " +
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 " +
                                (selected ? "text-gray-900" : "text-gray-600")
                            }
                            onClick={() => onChange(opt.value)}
                            type="button"
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>

    );
}