"use client";

import { FinalProfitDetailUS } from 'types/profitCalc';

type FinalResultProps = {
  shippingMethod: string;
  shippingJPY: number;
  data: FinalProfitDetailUS;
  exchangeRateUSDtoJPY: number; // 追加
};

export default function FinalResult({
  shippingMethod,
  shippingJPY,
  data,
  exchangeRateUSDtoJPY,
}: FinalResultProps) {
  return (
    <div className="p-4 border rounded-lg shadow space-y-2 bg-white">
      <h2 className="text-lg font-bold mb-2">【最終利益の詳細】</h2>

      <div className="space-y-1">
        <p>■ 売上 (税抜) : ${data.sellingPrice.toFixed(2)} / ￥{Math.round(data.sellingPrice * exchangeRateUSDtoJPY).toLocaleString()}</p>
        <p>■ 州税込売上 : ${data.sellingPriceInclTax.toFixed(2)} / ￥{Math.round(data.sellingPriceInclTax * exchangeRateUSDtoJPY).toLocaleString()}</p>

        <div className="border-t border-gray-300 my-2" />

        <p>■ 配送方法 : {shippingMethod.toLocaleString()}</p>
        <p>■ 配送料 : ${(shippingJPY / exchangeRateUSDtoJPY).toFixed(2)} / ￥{shippingJPY.toLocaleString()}</p>
        <p>■ 仕入れ : ${(data.costPrice / exchangeRateUSDtoJPY).toFixed(2)} / ￥{data.costPrice.toLocaleString()}</p>

        <div className="border-t border-gray-300 my-2" />

        <p className="text-gray-600 font-semibold my-1">【州税込売上から計算】</p>
        <p>■ カテゴリ手数料 : ${data.categoryFeeUSD.toFixed(2)} / ￥{Math.round(data.categoryFeeUSD * exchangeRateUSDtoJPY).toLocaleString()}</p>
        <p>■ 決済手数料 : ${data.paymentFeeUSD.toFixed(2)} / ￥{Math.round(data.paymentFeeUSD * exchangeRateUSDtoJPY).toLocaleString()}</p>
        <p>■ 手数料税 : ${data.feeTaxUSD.toFixed(2)} / ￥{Math.round(data.feeTaxUSD * exchangeRateUSDtoJPY).toLocaleString()}</p>
        <p>■ payoneer手数料 : ${data.payoneerFeeUSD.toFixed(2)} / ￥{Math.round(data.payoneerFeeUSD * exchangeRateUSDtoJPY).toLocaleString()}</p>
        <p>■ 為替手数料: ${(data.exchangeFeeJPY / exchangeRateUSDtoJPY).toFixed(2)}  / ￥{data.exchangeFeeJPY.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        <div className="p-6 bg-white rounded-lg shadow space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">【損益結果】</h2>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">利益 (売上 - 仕入 - 送料)</span>
            <div className="text-right">
              <span className="block text-gray-500 text-sm">USD</span>
              <span className="text-lg font-semibold text-gray-700">${(data.netProfitJPY / exchangeRateUSDtoJPY).toFixed(2)}</span>
              <span className="block text-sm mt-1 text-gray-500">JPY</span>
              <span className="text-2xl font-bold text-gray-900">￥{data.netProfitJPY.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-700 font-medium">最終損益（還付金付与後）</span>
            <div className="text-right">
              <span className="block text-gray-500 text-sm">USD</span>
              <span className="text-lg font-semibold text-gray-700">${(data.profitJPY / exchangeRateUSDtoJPY).toFixed(2)}</span>
              <span className="block text-sm mt-1 text-gray-500">JPY</span>
              <span className="text-2xl font-bold text-gray-900">￥{data.profitJPY.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-gray-700 font-medium">利益率</span>
            <span className="text-2xl font-bold text-green-600">{data.profitMargin.toFixed(2)}%</span>
          </div>
        </div>


        <div className="border-t border-gray-300 my-2" />

        <p className="text-gray-500 text-sm">
          ※ 税還付金 : ${(data.exchangeAdjustmentJPY / exchangeRateUSDtoJPY).toFixed(2)} / ￥{data.exchangeAdjustmentJPY.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          <br></br>
          ※ 手数料還付金 :${(data.feeRebateJPY / exchangeRateUSDtoJPY).toFixed(2)} / ￥{data.feeRebateJPY.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
