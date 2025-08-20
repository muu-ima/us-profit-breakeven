"use client";

import { FinalProfitDetailUS } from "types/profitCalc";
import FinalResult from "./FinalResult";
import { Dialog } from "@headlessui/react";

type FinalResultModalProps = {
  shippingMethod: string;
  shippingJPY: number;
  data: FinalProfitDetailUS;
  exchangeRateUSDtoJPY: number;
  isOpen: boolean;           // ← 追加
  onClose: () => void;       // ← 追加
};

export default function FinalResultModal({
  isOpen,
  onClose,
  ...props
}: FinalResultModalProps) {


  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* オーバーレイ */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-y-auto max-h-[80vh] p-6">
          <FinalResult {...props} />

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

