"use client";

import type { ReactNode } from "react";

type PremiumBlurProps = {
  children: ReactNode;
  locked: boolean;
  title: string;
  description: string;
  chartId?: string;
};

export function PremiumBlur({
  children,
  locked,
  title,
  description,
  chartId,
}: PremiumBlurProps) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-slate-900/60 p-6 backdrop-blur-[2px]">
        <div className="max-w-sm rounded-2xl border border-amber-400/30 bg-slate-950/90 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
            ✦
          </div>
          <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
          <button
            type="button"
            onClick={() => {
              if (chartId) {
                window.alert(
                  "Tính năng thanh toán sẽ kết nối Stripe/PayOS ở bước tiếp theo.",
                );
              }
            }}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:from-amber-400 hover:to-amber-500"
          >
            Mở khóa Premium
          </button>
        </div>
      </div>
    </div>
  );
}
