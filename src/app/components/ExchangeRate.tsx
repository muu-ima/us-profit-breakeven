'use client';
import { useEffect, useState } from "react";

export default function ExchangeRate({
    onRateChange,
}: {
    onRateChange?: (rate: number | null) => void;
}) {
    const [rawRate, setRawRate] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://enyukari.capoo.jp/profit-calc/exchangeRate.json')
            .then(res => res.json())
            .then(data => {
                const usdRate = data.rates?.USD ?? null;
                setRawRate(usdRate);
                if (onRateChange) onRateChange(usdRate);
            })
            .catch(err => {
                console.error('為替取得エラー', err);
                setRawRate(null);
                if (onRateChange) onRateChange(null);
            });
    }, [onRateChange]);

    return (
        <div className="bg-blue-100 border border-blue-400 rounded-md p-4 mb-4">
            <h2 className="text-xl font-bold">現在の為替レート</h2>
            <p>
                USD → JPY（生レート）: {rawRate !== null ? rawRate.toFixed(3) : '取得中...'}
            </p>
        </div>
    );
}
