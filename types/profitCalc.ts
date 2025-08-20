// types/profitCalc.ts

export interface ProfitCalcParamsUS {
    sellingPrice: number; //USD
    costPrice: number; //JPY
    shippingJPY: number; //JPY
    categoryFeePercent: number; // %
    paymentFeePercent: number; //%
    exchangeRateUSDtoJPY: number;
    targetMargin?: number;
}

export interface FinalProfitDetailUS {
    grossProfitUSD: number;         // 州税後の売上 - 手数料 (USD)
    profitMargin: number;           // 利益率 (%)
    feeTaxUSD: number;              // 手数料Tax (USD)
    exchangeAdjustmentJPY: number;  // USD→JPYでの調整額 (JPY)
    feeRebateJPY: number;
    categoryFeeUSD: number;
    payoneerFeeUSD: number;
    netProfitJPY: number;
    profitJPY: number;
    sellingPrice: number;           // USD (税抜)
    sellingPriceInclTax: number;   // USD (州税込)
    costPrice: number;             // 円 (仕入れ値)
    paymentFeeUSD: number;
    exchangeFeeJPY: number;
    finalValueFee: number;
}

