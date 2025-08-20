// lib/profitCalc.ts

import { ProfitCalcParamsUS, FinalProfitDetailUS } from 'types/profitCalc';

/**
 * 最終利益の詳細を計算する (US版)
 * @param {Object} params - パラメータオブジェクト
 * @param {number} params.sellingPrice - 売値（USD）
 * @param {number} params.costPrice - 仕入れ値（JPY）
 * @param {number} params.shippingJPY - 配送料（JPY）
 * @param {number} params.categoryFeePercent - カテゴリ手数料（%）
 * @param {number} params.paymentFeePercent - 決済手数料（%）
 * @param {number} params.platformRate - プラットフォーム手数料率（%）
 *
 * @returns {Object} 最終利益の詳細
 * @returns {number} return.totalCost - 総コスト (JPY)
 * @returns {number} return.profit - 利益 (JPY)
 * @returns {number} return.profitMargin - 利益率 (%)
 * @returns {number} return.suggestedPrice - 目標利益率を達成するための推奨販売価格 (JPY)
 * @returns {number} return.feeTax - 手数料にかかるタックス額 (JPY)
 * @returns {number} return.payoneerFee - ペイオニア手数料 (JPY)
 * @returns {number} return.exchangeAdjustmentJPY - 為替調整額 (JPY)
 */
export function calculateFinalProfitDetailUS({
  sellingPrice, //USD
  costPrice, //JPY
  shippingJPY, //JPY
  categoryFeePercent, //%
  paymentFeePercent, //%
  exchangeRateUSDtoJPY,

}: ProfitCalcParamsUS): FinalProfitDetailUS {
  console.log("利益計算に渡すcategoryFeePercent:", categoryFeePercent);
  if (!exchangeRateUSDtoJPY) {
    throw new Error("exchangeRateUSDtoJPY が必要です！");
  }

  // 州税抜き売上 (USD) 
  const sellingPriceExclTaxUSD = sellingPrice;

  // 州税抜き売上 (JPY)
  const revenueJPYExclTax = sellingPrice * exchangeRateUSDtoJPY;

  // 州税6.71%を計算、州税込みの売上 (USD)
  const stateTaxRate = 0.0671;
  const sellingPriceInclTax = sellingPrice * (1 + stateTaxRate);

  // カテゴリ手数料 & 決済手数料 
  const categoryFeeUSD = sellingPriceInclTax * (categoryFeePercent / 100);
  const paymentFeeUSD = sellingPriceInclTax * (paymentFeePercent / 100);

  // Final Value Fee
  const finalValueFee = 0.40;

  // 手数料にかかるTAX (10%) (USD)
  const feeTaxUSD = (categoryFeeUSD + paymentFeeUSD + finalValueFee) * 0.10;

  // Payoneer手数料 (粗利の2%) → 一旦は州税込み売上 - 基本手数料で粗利計算してから算出
  const grossProfitUSD = sellingPrice - (categoryFeeUSD + paymentFeeUSD + feeTaxUSD);
  const payoneerFeeUSD = grossProfitUSD * 0.02;

  // 税還付金 (JPY)
  const exchangeAdjustmentJPY = costPrice * 10 / 110; // 税率10%の場合

  // 手数料還付金 (JPY)
  const feeRebateJPY = feeTaxUSD * exchangeRateUSDtoJPY

  // 全手数料 (USD) 合計
  const totalFeesUSD = categoryFeeUSD + paymentFeeUSD + feeTaxUSD + payoneerFeeUSD + finalValueFee;

  // 全手数料引き後 (USD)
  const netSellingUSD = sellingPriceExclTaxUSD - totalFeesUSD;

  // １ドル辺り3.3円手数料
  const exchangeFeePerUSD = 3.3; // 1USD あたり 3.3円の両替手数料

  // 両替手数料 (JPY)
  const exchangeFeeJPY = netSellingUSD * exchangeFeePerUSD;

  // 正味JPY
  const netSellingJPY = (netSellingUSD * exchangeRateUSDtoJPY) - exchangeFeeJPY;

  // 仕入れ値と送料（JPY）を差し引く
  const netProfitJPY = netSellingJPY - costPrice - shippingJPY;

  //  最終損益
  const profitJPY = netProfitJPY + exchangeAdjustmentJPY + feeRebateJPY;

  // 売値ベース 利益率
  const profitMargin = revenueJPYExclTax === 0 ? 0 : (profitJPY / revenueJPYExclTax) * 100;

  return {
    grossProfitUSD,
    netProfitJPY,
    profitMargin,
    profitJPY,
    feeTaxUSD,
    payoneerFeeUSD,
    exchangeAdjustmentJPY,
    feeRebateJPY,
    categoryFeeUSD,
    sellingPrice,
    sellingPriceInclTax,
    paymentFeeUSD,
    exchangeFeeJPY,
    finalValueFee,
    costPrice
  };
}

// 追加: 関税30%、保険30%

export const TARIFF_RATE = 0.30;
export const INSURANCE_RATE = 0.30;

/**
 * 損益分岐点(USD)と、関税込み/保険込みを算出
 *  - costJPY, shippingJPY: 円 
 *  - rateJPYperUSD: JPY/USD
 *  - categoryFeePercent:　例 12.7%
 *  - exchangeFeeJPYPerUSD: 例 3.3(円/1USD)
 */

export function calcBreakEvenUSD({
  costJPY,
  shippingJPY,
  rateJPYperUSD,
  categoryFeePercent,
  exchangeFeeJPYPerUSD = 3.3,
}: {
  costJPY: number;
  shippingJPY: number;
  rateJPYperUSD: number;
  categoryFeePercent: number;
  exchangeFeeJPYPerUSD?: number;
}) {

  if (process.env.NODE_ENV !== "production") {
    console.log("[calcBreakEvenUSD] input:", {
      costJPY, shippingJPY, rateJPYperUSD, categoryFeePercent, exchangeFeeJPYPerUSD,
    });
  }

  const baseUSD = (costJPY + shippingJPY) / rateJPYperUSD;
  const pCat = categoryFeePercent / 100; // 例: 12.7% → 0.127
  const pFx = exchangeFeeJPYPerUSD / rateJPYperUSD; // 為替手数料を割合に変換
  const K = pCat + pFx; // 売上に対して、差し引かれる総手数料率
  if (process.env.NODE_ENV !== "production") {
    console.log("[calcBreakEvenUSD] mid:", { baseUSD, pCat, pFx, K });
  }

  if (K >= 1) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[calcBreakEvenUSD] K>=1 のため有限解なし");
    }
    return { breakEvenUSD: Infinity, tariffUSD: Infinity, insuranceUSD: Infinity };
  }

  const breakEvenUSD = baseUSD / (1 - K);

  // 関税30%上乗せ本体
  const tariffUSD = breakEvenUSD * (1 + TARIFF_RATE); //TARIFF_RATE = 0.30

  // ★保険= 「関税増分(= tariff - BE)」の30%
  const tariffDeltaUSD = tariffUSD - breakEvenUSD;
  const insuranceUSD = tariffDeltaUSD * INSURANCE_RATE;    // INSURANCE_RATE = 0.30
 
  // 保険込み合計 (表示/反映用)
  const insuranceTotalUSD = tariffUSD + insuranceUSD;        // （参考）保険込みの合計価格

   if (process.env.NODE_ENV !== "production") {
    console.log("[calcBreakEvenUSD] output:", { breakEvenUSD, tariffUSD, insuranceUSD });
  }
  return { breakEvenUSD, tariffUSD, insuranceUSD, insuranceTotalUSD };
}

/**
 * カテゴリ手数料額を計算する (US)
 */
export function calculateCategoryFeeUS(
  sellingPrice: number,
  categoryFeePercent: number
): number {
  console.log("売値 (JPY):", sellingPrice);
  console.log("カテゴリ手数料率(%):", categoryFeePercent);
  return sellingPrice * (categoryFeePercent / 100);
}

/**
 * 配送料（USD）をJPYに換算する
 */
export function convertShippingPriceToJPY(
  shippingPriceUSD: number,
  exchangeRateUSDtoJPY: number): number {
  return shippingPriceUSD * exchangeRateUSDtoJPY;
}

/**
 * 実費合計を計算する
 */
export function calculateActualCost(
  costPrice: number,
  shippingJPY: number,
  categoryFeeJPY: number
): number {
  return costPrice + shippingJPY + categoryFeeJPY;
}

/**
 * 粗利を計算する
 */
export function calculateGrossProfit(
  sellingPriceJPY: number,
  actualCostJPY: number
): number {
  return sellingPriceJPY - actualCostJPY;
}

/**
 * 利益率を計算する
 */
export function calculateProfitMargin(
  grossProfit: number,
  sellingPrice: number
): number {
  if (sellingPrice === 0) return 0;
  return (grossProfit / sellingPrice) * 100;
}
