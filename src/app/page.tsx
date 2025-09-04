"use client";

import React, { useMemo } from "react";
import ChatIcon from "./components/ChatIcon";
import { useEffect, useState } from "react";
import { getCheapestShipping, ShippingData } from "lib/shipping";
import ExchangeRate from "./components/ExchangeRate";
import Result from "./components/Result";
import {
  calculateFinalProfitDetailUS,
  calculateCategoryFeeUS,
  calculateActualCost,
  calculateGrossProfit,
  calculateProfitMargin,
} from "lib/profitCalc";
import type { BreakEvenResult } from "lib/profitCalc";
import FinalResultModal from './components/FinalResultModal';
import { calcBreakEvenUSD } from "lib/profitCalc";
import ModeSwitch, { type Mode } from "./components/ModeSwitch";
import { AnimatePresence, motion } from "framer-motion";


// ここから型定義を追加
type ShippingResult = {
  method: string;
  price: number | null;
};

type CategoryFeeType = {
  label: string;
  value: number;
  categories: string[];
};

type ShippingMode = 'auto' | 'manual';

type CalcResult = {
  shippingJPY: number,
  categoryFeeJPY: number;
  actualCost: number; // 総コスト（円）
  grossProfit: number; // 粗利益（円）
  profitMargin: number;// 利益率(%)
  method: string; //選択配送方法
  rate: number; // 為替レート
  sellingPriceJPY: number; //売値(円換算)
}


export default function Page() {
  // State管理
  const [shippingRates, setShippingRates] = useState<ShippingData | null>(null);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [weight, setWeight] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [rate, setRate] = useState<number | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryFeeType[]>([]);
  const [selectedCategoryFee, setSelectedCategoryFee] = useState<number | "">(
    ""
  );

  const [shippingMode, setShippingMode] = useState<ShippingMode>('auto');
  const [manualShipping, setManualShipping] = useState<number | ''>('');
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("breakEven");
  const [be, setBe] = useState<BreakEvenResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 自動/手動の送料を一元化
  const selectedShippingJPY: number | null =
    shippingMode === 'manual'
      ? (manualShipping === '' ? null : Number(manualShipping))
      : (result?.price ?? null);


  // 配送料データ読み込み
  useEffect(() => {
    fetch("/data/shipping.json")
      .then((res) => res.json())
      .then((data) => setShippingRates(data));
  }, []);

  // カテゴリ手数料のマスタ読み込み
  useEffect(() => {
    fetch("/data/categoryFees.json")
      .then((res) => res.json())
      .then((data) => setCategoryOptions(data));
  }, []);

  // レートのログ
  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  // 自動計算は auto の時だけ
  useEffect(() => {
    if (shippingMode !== 'auto') return;
    if (shippingRates && weight !== null && weight > 0) {
      const cheapest = getCheapestShipping(shippingRates, weight, dimensions);
      setResult(cheapest);
    } else {
      setResult(null);
    }
  }, [shippingRates, weight, dimensions, shippingMode]);

  // BE用のuseEffect（calcBreakEvenUSD と同期）
  useEffect(() => {
    const ready =
      rate !== null &&
      costPrice !== "" &&
      selectedShippingJPY !== null &&
      selectedCategoryFee !== "";

    if (!ready) {
      setBe(null); // 計算結果をリセットして終了
      return;      // ready === trueの時だけ、後続の計算ロジックに進む
    }

    const out = calcBreakEvenUSD({
      costJPY: Number(costPrice),
      shippingJPY: selectedShippingJPY,
      rateJPYperUSD: rate!,
      categoryFeePercent: Number(selectedCategoryFee),
      exchangeFeeJPYPerUSD: 3.3,
    });

    // 有限かチェック
    if (
      !Number.isFinite(out.breakEvenUSD) ||
      !Number.isFinite(out.dutyTotalUSD) ||
      !Number.isFinite(out.insuranceUSD) ||
      !Number.isFinite(out.insuranceTotalUSD)
    ) {
      setBe(null);
      return;
    }
    setBe(out);
  }, [costPrice, rate, selectedCategoryFee, selectedShippingJPY]);

  // 計算結果用のuseEffect - 未入力は計算しない
  useEffect(() => {
    const ready =
      sellingPrice !== "" &&
      costPrice !== "" &&
      rate !== null &&
      weight !== null &&
      selectedCategoryFee !== "" &&
      selectedShippingJPY !== null;

    if (!ready) {
      setCalcResult(null);
      return;
    }

    // ここから下は全部 number に寄せる
    const shippingJPY: number = selectedShippingJPY;
    const sellingPriceUSD: number = parseFloat(sellingPrice);         // 文字列を数値へ
    const sellingPriceJPY: number = sellingPriceUSD * rate!;
    const categoryFeeJPY: number = calculateCategoryFeeUS(
      sellingPriceJPY,
      Number(selectedCategoryFee)
    );

    //実費合計
    const actualCost: number = calculateActualCost(
      Number(costPrice),
      shippingJPY,
      categoryFeeJPY
    );

    const grossProfit: number = calculateGrossProfit(
      sellingPriceUSD, actualCost
    );
    const profitMargin: number = calculateProfitMargin(
      grossProfit, sellingPriceUSD
    );

    setCalcResult({
      shippingJPY,
      categoryFeeJPY,
      actualCost,
      grossProfit,
      profitMargin,
      method: shippingMode === 'manual' ? '手動入力' : (result?.method ?? ''),
      sellingPriceJPY,
      rate: rate!,
    });

  }, [
    sellingPrice,
    costPrice,
    rate,
    weight,
    selectedCategoryFee,
    selectedShippingJPY,   // ← 依存にこれを入れる
    shippingMode,
    result?.method
  ]);

  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;

  const final = calcResult
    ? calculateFinalProfitDetailUS({
      sellingPrice: sellingPriceNum,
      costPrice: typeof costPrice === "number" ? costPrice : 0,
      shippingJPY: calcResult.shippingJPY,
      categoryFeePercent: selectedCategoryFee as number,
      paymentFeePercent: 1.35, //決済手数料(%)
      exchangeRateUSDtoJPY: rate ?? 0,
      targetMargin: 0.30,
    })
    : null;

  const isEnabled =
    !isNaN(sellingPriceNum) &&
    sellingPrice !== "" &&
    costPrice !== "" &&
    rate !== null &&
    weight !== null &&
    selectedCategoryFee !== "";

  // BEの表示値(モード切替対応)
  const currentUSD = useMemo(() => {
    if (!be) return null;
    switch (mode) {
      case "breakEven":
        return be.breakEvenUSD;
      case "tariff":
        return be.dutyTotalUSD;
      case "insurance":
        return be.insuranceTotalUSD;
      default:
        return be.breakEvenUSD;
    }
  }, [be, mode]);

  const currentJPY = useMemo(() => {
    if (currentUSD == null || rate == null) return null;
    return Math.round(currentUSD * rate);
  }, [currentUSD, rate]);

  return (
    <div className="p-4 w-full max-w-7xl mx-auto flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
      <div className="flex-1 flex flex-col space-y-4">
        {/* 為替レート表示コンポーネント */}
        <ExchangeRate onRateChange={setRate} />
        <div>
          <label className="block font-semibold mb-1">仕入れ値 (円) </label>
          <input
            type="number"
            step="10"
            min="10"
            value={costPrice}
            onChange={(e) => {
              const raw = e.target.value;
              //空なら空にする
              if (raw === "") {
                setCostPrice("");
                return;
              }

              //数値化
              let num = Number(raw);

              //マイナスなら0に
              if (num < 0) num = 0;

              setCostPrice(num);
            }}
            placeholder="仕入れ値"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        {/* <div>
          <label className="block font-semibold mb-1">売値 (＄)</label>
          <input
            type="text"
            value={sellingPrice}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                setSellingPrice("");
                return;
              }
              // 数字と小数点2桁までを許可
              if (/^\d*\.?\d{0,2}$/.test(raw)) {
                setSellingPrice(raw); // 入力中は文字列のまま保持
              }
            }}
            onBlur={() => {
              //入力確定時に少数点第2位まで丸める
              if (sellingPrice !== "") {
                const num = Math.floor(parseFloat(sellingPrice) * 100) / 100;
                setSellingPrice(num.toFixed(2)); // 文字列にして再セット
              }
            }}
            placeholder="売値"
            className="w-full px-3 py-2 border rounded-md"
          />
          {rate !== null && sellingPrice !== "" && (
            <p>概算円価格：約 {Math.round(parseFloat(sellingPrice) * rate)} 円</p>
          )}
        </div> */}
        <div className="flex items-center justify-between mb-0">
          <span className="block font-semibold">配送料モード</span>
          <button
            type="button"
            role="switch"
            aria-checked={shippingMode === "manual"}
            onClick={() =>
              setShippingMode((m) => (m === "auto" ? "manual" : "auto"))
            }
            className="relative inline-flex items-center h-9 w-36 rounded-full bg-gray-200 transition"
          >
            {/* ノブ */}
            <motion.span
              layout
              className="absolute h-7 w-7 rounded-full bg-white shadow"
              style={{ left: 4, top: 4 }}
              animate={{ x: shippingMode === "manual" ? 96 : 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
            {/* ラベル */}
            <span
              className={`w-1/2 text-center text-sm transition ${shippingMode === "auto" ? "font-semibold text-gray-900" : "text-gray-500"
                }`}
            >
              自動
            </span>
            <span
              className={`w-1/2 text-center text-sm transition ${shippingMode === "manual" ? "font-semibold text-gray-900" : "text-gray-500"
                }`}
            >
              手動
            </span>
          </button>
        </div>
        {/* ▼ 自動フォーム or 手動フォーム（アンマウントで隠す） */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={shippingMode}                 // "auto" or "manual"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 12, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden", willChange: "opacity, transform, height" }}
          >
            {shippingMode === "auto" ? (
              <fieldset>
                {/* 自動計算：実重量 */}
                <div className="mt-3">
                  <label className="block font-semibold mb-1">実重量 (g)</label>
                  <input
                    type="number"
                    value={weight ?? ""}
                    onChange={(e) =>
                      setWeight(e.target.value === "" ? null : Number(e.target.value))
                    }
                    placeholder="実重量"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                {/* 自動計算：サイズ */}
                <div className="mt-3">
                  <label className="block font-semibold mb-1">サイズ (cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      value={dimensions.length || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") { setDimensions((p) => ({ ...p, length: 0 })); return; }
                        const num = Math.max(0, Number(raw));
                        setDimensions((p) => ({ ...p, length: num }));
                      }}
                      placeholder="長さ"
                      className="px-2 py-1 border rounded-md"
                    />
                    <input
                      type="number"
                      value={dimensions.width || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") { setDimensions((p) => ({ ...p, width: 0 })); return; }
                        const num = Math.max(0, Number(raw));
                        setDimensions((p) => ({ ...p, width: num }));
                      }}
                      placeholder="幅"
                      className="px-2 py-1 border rounded-md"
                    />
                    <input
                      type="number"
                      value={dimensions.height || ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") { setDimensions((p) => ({ ...p, height: 0 })); return; }
                        const num = Math.max(0, Number(raw));
                        setDimensions((p) => ({ ...p, height: num }));
                      }}
                      placeholder="高さ"
                      className="px-2 py-1 border rounded-md"
                    />
                  </div>
                </div>
              </fieldset>
            ) : (
              <div className="mt-3">
                {/* 手動入力：配送料（円） */}
                <label className="block font-semibold mb-1">配送料（円・手動）</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10}
                  value={manualShipping}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") { setManualShipping(""); return; }
                    const num = Math.max(0, Number(raw));
                    setManualShipping(Number.isFinite(num) ? num : "");
                  }}
                  placeholder="例: 1200"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ※ 手動入力時は重量/サイズは非表示になります
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div>
          <label className="block font-semibold mb-1">カテゴリ手数料 </label>
          <select
            value={selectedCategoryFee}
            onChange={(e) => setSelectedCategoryFee(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">カテゴリを選択してください</option>
            {categoryOptions.map((cat) => (
              <option key={cat.label} value={cat.value}>
                {cat.label} ({cat.value}%)
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* 右カラム */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="block font-semibold text-gray-600">表示モード</span>
          <ModeSwitch mode={mode} onChange={setMode} />
        </div>

        {hydrated && (currentUSD != null ? (
          <motion.div
            className="flex flex-wrap items-baseline gap-2 sm:gap-3"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-live="polite"
          >
            {/* タイトル：モード切替時に控えめスライド＆フェード */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: "spring", stiffness: 320, damping: 24, mass: 0.5 }}
                className="text-xl sm:text-2xl font-semibold tracking-tight
                   text-gray-900 dark:text-gray-100"
              >
                {mode === "breakEven"
                  ? "損益分岐(USD)"
                  : mode === "tariff"
                    ? "関税込合計(USD)"
                    : "保険込み合計(USD)"}:
              </motion.span>
            </AnimatePresence>

            {/* USD額：更新時にごく軽いバウンス＆フェード */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={currentUSD.toFixed(2)}
                initial={{ opacity: 0, y: 2, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -2, scale: 0.995 }}
                transition={{ type: "spring", stiffness: 480, damping: 20 }}
                className="tabular-nums text-2xl sm:text-3xl font-semibold
                   text-gray-900 dark:text-gray-100"
              >
                {" "}{currentUSD.toFixed(2)}
              </motion.span>
            </AnimatePresence>

            {/* 円換算：ふわっと控えめに表示 */}
            {rate != null && currentJPY != null && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentJPY}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="text-sm sm:text-base text-gray-600
                     bg-gray-50 dark:bg-white/5
                     rounded-md px-2.5 py-1"
                >
                  （約 {currentJPY.toLocaleString()} 円）
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>
        ) : (
           <span className="text-gray-500">必要な入力を埋めると自動計算されます</span>
        ))}



        {/* 配送結果 */}
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <p>
            配送方法: {
              result === null
                ? "計算中..."
                : result.method
            }
          </p>
          <p>
            配送料: {
              result === null
                ? "計算中..."
                : result.price !== null
                  ? `${result.price}円`
                  : "不明"
            }
          </p>
        </div>


        {/* 利益結果 */}
        {rate !== null && sellingPrice !== "" && (
          <Result
            originalPriceUSD={sellingPrice !== "" ? parseFloat(sellingPrice) : 0}  // ★ 修正
            priceJPY={typeof sellingPrice === "number" && rate !== null ? sellingPrice * rate : 0}
            sellingPriceInclTax={sellingPriceInclTax}
            exchangeRateUSDtoJPY={rate ?? 0}
            calcResult={calcResult}
          />
        )}
        {/* <button
          onClick={() => setIsModalOpen(true)}
          disabled={!isEnabled}
          className={`btn-primary ${isEnabled ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" : "bg-gray-400 cursor-not-allowed text-gray-200"}
           px-8 py-4 text-lg rounded-full transition-colors duration-300`}
        >
          最終利益の詳細を見る
        </button> */}

        {isModalOpen && final && (
          <FinalResultModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            shippingMethod={result?.method || ""}
            shippingJPY={calcResult?.shippingJPY || 0}
            data={final}
            exchangeRateUSDtoJPY={rate ?? 0}
          />
        )}

      </div>

      {/* チャットアイコンをここで表示 */}
      <ChatIcon />

    </div >
  );
}
