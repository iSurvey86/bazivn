"use client";

import type { BaZiChartResult } from "@/lib/astrology-engine";
import { exportChartAsPng } from "@/lib/export-chart-image";
import { useRef, useState } from "react";
import { BaziClassicChart } from "./bazi-classic-chart";

type BaziChartBoardProps = {
  chart: BaZiChartResult;
  fullName?: string | null;
  birthPlace?: string | null;
};

export function yearOptions() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 5; y >= 1920; y--) years.push(y);
  return years;
}

export function BaziChartBoard({ chart, fullName, birthPlace }: BaziChartBoardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [referenceYear, setReferenceYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [exporting, setExporting] = useState(false);

  async function handleDownload() {
    const node = chartRef.current;
    if (!node) return;

    setExporting(true);
    try {
      await exportChartAsPng(node, { fullName, referenceYear });
    } catch {
      /* silent — button resets */
    } finally {
      setExporting(false);
    }
  }

  return (
    <BaziClassicChart
      ref={chartRef}
      chart={chart}
      fullName={fullName}
      birthPlace={birthPlace}
      referenceYear={referenceYear}
      yearOptions={yearOptions()}
      onReferenceYearChange={setReferenceYear}
      onDownload={handleDownload}
      exporting={exporting}
    />
  );
}
