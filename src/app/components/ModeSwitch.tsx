"use client";
import { useMemo } from "react";

type Mode = "breakEven" | "tariff" | "insurance";

export default function ModeSwitch({
  mode,
  onChange,
}: { mode: Mode; onChange: (m: Mode) => void }) {
  const options: { label: string; value: Mode }[] = [
    { label: "損益分岐点", value: "breakEven" },
    { label: "関税込み", value: "tariff" },
    { label: "保険(+30%)", value: "insurance" },
  ];
  const idx = useMemo(() => options.findIndex(o => o.value === mode), [mode]);
  return (
    <div className="relative w-full max-w-md">
      <div className="grid grid-cols-3 bg-gray-200 rounded-full p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-2 text-sm rounded-full transition-colors ${
              mode === opt.value ? "text-white" : "text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* スライダー（下地の上で横移動） */}
      <div
        className="pointer-events-none absolute top-1 h-[calc(100%-0.5rem)] w-1/3 rounded-full bg-blue-500 transition-transform"
        style={{ transform: `translateX(${idx * 100}%)` }}
      />
    </div>
  );
}
