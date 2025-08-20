//  lib/shipping.ts

export type ShippingOption = {
  weight: number;
  price: number;
};

export type ShippingData = {
  small_packet_air: ShippingOption[];
  fedex: ShippingOption[];
  ems: ShippingOption[];
};

export function findPriceByWeight(
  options: ShippingOption[],
  weight: number
): number | null {
  for (const option of options) {
    if (weight <= option.weight) return option.price;
  }
  // 重量が最大を超えたら最後の（最大の）価格 or ひとつ手前を返す
  if (options.length > 1) {
    return options[options.length - 1].price;
    // もし「ひとつ手前」なら:
    // return options[options.length - 2].price;
  }
  return null;
}

/**
 * 容積重量の計算
 * @param length 長さ (cm)
 * @param width 幅 (cm)
 * @param height 高さ (cm)
 * @param divisor 係数 (通常は5000)
 */
export function calculateDimensionalWeight(
  length: number,
  width: number,
  height: number,
  divisor: number = 5000
): number {
  return (length * width * height) / divisor;
}

// /lib/shipping.ts の上部あたりに追加してください

const SMALL_PACKET_MAX_WEIGHT = 2000;
const SMALL_PACKET_MAX_LENGTH = 60;
const SMALL_PACKET_MAX_SUM = 90;

function isValidForSmallPacket(
  actualWeight: number,
  dimensions: { length: number; width: number; height: number }
): boolean {
  const sum = dimensions.length + dimensions.width + dimensions.height;
  return (
    actualWeight <= SMALL_PACKET_MAX_WEIGHT &&
    dimensions.length <= SMALL_PACKET_MAX_LENGTH &&
    sum <= SMALL_PACKET_MAX_SUM
  );
}

/**
 * 最も安い配送方法を取得
 * @param data 配送データ
 * @param actualWeight 実重量
 * @param dimensions 寸法(長さ、幅、高さ)
 */

export function getCheapestShipping(
  data: ShippingData,
  actualWeight: number,
  dimensions: { length: number; width: number; height: number },
  divisor: number = 5
) {
  const dimensionalWeight = calculateDimensionalWeight(
    dimensions.length,
    dimensions.width,
    dimensions.height,
    divisor
  );
  const applicableWeight = Math.max(actualWeight, dimensionalWeight); //FedEX用

  // 小型包装の制限を満たす場合のみ小型包装の料金を取得
  const smallPacketPrice = isValidForSmallPacket(actualWeight, dimensions)
    ? findPriceByWeight(data.small_packet_air, actualWeight)
    : null;

  const fedexPrice = findPriceByWeight(data.fedex, applicableWeight);
  const emsPrice = findPriceByWeight(data.ems, actualWeight);


    // **ここでログを出す**
  console.log("dimensionalWeight:", dimensionalWeight);
  console.log("applicableWeight (FedEx用):", applicableWeight);
  console.log("smallPacketPrice:", smallPacketPrice);
  console.log("fedexPrice:", fedexPrice);
  console.log("emsPrice:", emsPrice);

  const prices = [
    { method: "small_packet_air", price: smallPacketPrice },
    { method: "fedex", price: fedexPrice },
    { method: "ems", price: emsPrice },
  ].filter((p) => p.price !== null);

  if (prices.length === 0) return null;

  return prices.reduce((prev, curr) =>
    curr.price! < prev.price! ? curr : prev
  );
}
