"use client";

import React from "react";
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

import FinalResultModal from './components/FinalResultModal';
import { calcBreakEvenUSD } from "lib/profitCalc";
import ModeSwitch from "./components/ModeSwitch";

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
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setmode] = useState<"breakEven" | "tariff" | "insurance">("breakEven");
  const [beValues, setBeValues] = useState<{ breakEvenUSD: number; tariffUSD: number; insuranceUSD: number } | null>(null);
  const EX_FEE_JPY_PER_USD = 3.3; // 両替手数料(円/1USD) 固定

  // 配送料データ読み込み
  useEffect(() => {
    fetch("/data/shipping.json")
      .then((res) => res.json())
      .then((data) => setShippingRates(data));
  }, []);

  // 計算結果用のuseEffect
  useEffect(() => {
    if (
      sellingPrice !== "" &&
      costPrice !== "" &&
      rate !== null &&
      weight !== null &&
      result !== null &&
      result.price !== null &&
      selectedCategoryFee !== ""
    ) {
      //配送料JPYに換算
      const shippingJPY = result.price ?? 0;

      // ここで売値の変換をする
      const sellingPriceUSD = typeof sellingPrice === "number" ? sellingPrice : 0;
      // 円換算は掛け算
      const sellingPriceJPY = sellingPriceUSD * (rate ?? 0);
      //カテゴリ手数料JPY計算
      const categoryFeeJPY = calculateCategoryFeeUS(
        typeof sellingPrice === "number" && rate !== null
          ? sellingPrice * rate  // ← USD → 円 にする
          : 0,
        typeof selectedCategoryFee === "number" ? selectedCategoryFee : 0
      );


      //実費合計
      const actualCost = calculateActualCost(
        typeof costPrice === "number" ? costPrice : 0,
        shippingJPY,
        categoryFeeJPY
      );
      //粗利計算
      const grossProfit = calculateGrossProfit(
        typeof sellingPrice === "number" ? sellingPrice : 0,
        actualCost
      );
      //利益率計算
      const profitMargin = calculateProfitMargin(grossProfit,
        typeof sellingPrice === "number" ? sellingPrice : 0
      );

      setCalcResult({
        shippingJPY,
        categoryFeeJPY,
        actualCost,
        grossProfit,
        profitMargin,
        method: result.method,
        sellingPriceJPY,
        rate
      });

    }
  }, [sellingPrice, costPrice, rate, weight, result, selectedCategoryFee]);

  useEffect(() => {
    fetch("/data/categoryFees.json")
      .then((res) => res.json())
      .then((data) => setCategoryOptions(data));
  }, []);

  useEffect(() => {
    if (rate !== null) {
      console.log(`最新為替レート：${rate}`);
    }
  }, [rate]);

  useEffect(() => {
    if (shippingRates && weight !== null && weight > 0) {
      const cheapest = getCheapestShipping(shippingRates, weight, dimensions);
      setResult(cheapest);
    }
  }, [shippingRates, weight, dimensions]);

  // 追記: 逆算の自動試算（必要条件が揃ったら）
  useEffect(() => {
    if (
      rate !== null &&
      result?.price != null &&                 // shippingJPY
      selectedCategoryFee !== "" &&
      typeof selectedCategoryFee === "number" &&
      typeof costPrice === "number"
    ) {
      const v = calcBreakEvenUSD({
        costJPY: costPrice,
        shippingJPY: result.price,
        rateJPYperUSD: rate,
        categoryFeePercent: selectedCategoryFee,
        exchangeFeeJPYPerUSD: EX_FEE_JPY_PER_USD,
      });
      setBeValues(v);
    } else {
      setBeValues(null);
    }
  }, [rate, result, selectedCategoryFee, costPrice]);

  // 追記: 表示用の選択値
  const beUSD =
    beValues
      ? mode === "breakEven"
        ? beValues.breakEvenUSD
        : mode === "tariff"
          ? beValues.tariffUSD
          : beValues.insuranceUSD
      : null;

  const beJPY = beUSD && rate ? Math.round(beUSD * rate) : null;
  // const categoryFeePercent =
  //   calcResult && sellingPrice !== "" && rate
  //     ? (calcResult.categoryFeeJPY / (parseFloat(sellingPrice) * rate)) * 100
  //     : 0;

  const stateTaxRate = 0.0671;
  const sellingPriceNum = sellingPrice !== "" ? parseFloat(sellingPrice) : 0;
  const sellingPriceInclTax = sellingPriceNum + sellingPriceNum * stateTaxRate;
  // const categoryFeeUSD = sellingPriceNum * (selectedCategoryFee as number / 100);

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
        <div>
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
        </div>

        <div>
          <label className="block font-semibold mb-1">実重量 (g) </label>
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
        <div>
          <label className="block font-semibold mb-1">サイズ (cm)</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={dimensions.length || ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setDimensions((prev) => ({ ...prev, length: 0 }));
                  return;
                }

                let num = Number(raw);
                if (num < 0) num = 0;

                setDimensions((prev) => ({ ...prev, length: num }));
              }}
              placeholder="長さ"
              className="px-2 py-1 border rounded-md"
            />
            <input
              type="number"
              value={dimensions.width || ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setDimensions((prev) => ({ ...prev, width: 0 }));
                  return;
                }

                let num = Number(raw);
                if (num < 0) num = 0;

                setDimensions((prev) => ({ ...prev, width: num }));
              }}
              placeholder="幅"
              className="px-2 py-1 border rounded-md"
            />
            <input
              type="number"
              value={dimensions.height || ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setDimensions((prev) => ({ ...prev, height: 0 }));
                  return;
                }

                let num = Number(raw);
                if (num < 0) num = 0;

                setDimensions((prev) => ({ ...prev, height: num }));
              }}
              placeholder="高さ"
              className="px-2 py-1 border rounded-md"
            />
          </div>
        </div>
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
        {/* 配送結果と利益結果を右側に移動する */}
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
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!isEnabled}
          className={`btn-primary ${isEnabled ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" : "bg-gray-400 cursor-not-allowed text-gray-200"}
           px-8 py-4 text-lg rounded-full transition-colors duration-300`}
        >
          最終利益の詳細を見る
        </button>

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
      <div className="p-4 border rounded bg-white space-y-3">
  <h3 className="font-bold">逆算（損益分岐点）</h3>
  <ModeSwitch mode={mode} onChange={setmode} />
  <div className="text-sm text-gray-600">両替手数料: {EX_FEE_JPY_PER_USD} 円/USD</div>
  {beUSD ? (
    <div className="space-y-1">
      <div>売値(USD): <span className="font-semibold">${beUSD.toFixed(2)}</span></div>
      <div>売値(JPY): <span className="font-semibold">{beJPY} 円</span></div>
      <button
        className="mt-2 px-3 py-2 rounded bg-blue-600 text-white"
        onClick={() => setSellingPrice(beUSD.toFixed(2))}
      >
        この値を売値にセット
      </button>
    </div>
  ) : (
    <div className="text-gray-500">為替・送料・カテゴリが揃うと自動計算します</div>
  )}
</div>
      <button
        className="px-3 py-2 rounded bg-gray-200"
        onClick={() => {
          const r = calcBreakEvenUSD({
            costJPY: 9000,
            shippingJPY: 1200,
            rateJPYperUSD: 160,
            categoryFeePercent: 12.7,
            exchangeFeeJPYPerUSD: 3.3,
          });
          console.log("仮テスト結果:", r);
        }}
      >
        逆算デバッグ実行
      </button>

    </div >
  );
}
