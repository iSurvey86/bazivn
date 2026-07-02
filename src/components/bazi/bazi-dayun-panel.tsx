import type { BaZiChartResult } from "@/lib/astrology-engine";
import { BaziCard, BaziSectionTitle } from "./bazi-ui";

type BaziDayunPanelProps = {
  chart: BaZiChartResult;
};

export function BaziDayunPanel({ chart }: BaziDayunPanelProps) {
  const { startAge, startSolarYear } = chart.yun;

  return (
    <div className="space-y-6">
      <BaziCard className="border-border-strong bg-accent-light px-5 py-4">
        <p className="text-sm font-semibold text-foreground">
          Đại vận khởi từ <strong className="font-black">{startSolarYear}</strong> — sau{" "}
          <strong className="font-black">
            {startAge.years} tuổi {startAge.months} tháng {startAge.days} ngày
          </strong>
          <span className="font-semibold text-muted"> · {chart.genderLabel}</span>
        </p>
      </BaziCard>

      <BaziSectionTitle subtitle="Mỗi chu kỳ 10 năm kèm Lưu Niên từng năm">
        Chu kỳ Đại Vận
      </BaziSectionTitle>

      <div className="bazi-scroll-x flex gap-4 overflow-x-auto pb-3">
        {chart.yun.daYun.map((period, index) => (
          <article
            key={period.index}
            className="relative min-w-[200px] shrink-0"
          >
            {index < chart.yun.daYun.length - 1 ? (
              <div
                className="absolute left-full top-8 z-0 h-px w-4 bg-border-strong"
                aria-hidden
              />
            ) : null}
            <BaziCard className="relative z-10 p-4">
              <p className="text-sm font-bold text-muted">
                {period.startAge}–{period.endAge} tuổi
              </p>
              <p className="mt-2 text-xl font-black text-accent">
                {period.ganZhiVi}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-muted">
                {period.startYear} – {period.endYear}
              </p>

              <ul className="mt-4 max-h-52 space-y-0.5 overflow-y-auto border-t border-border-strong pt-3">
                {period.liuNian.map((ln) => (
                  <li
                    key={ln.year}
                    className="flex items-center justify-between gap-2 rounded px-1 py-1 text-sm hover:bg-surface-muted"
                  >
                    <span className="tabular-nums font-semibold text-muted">{ln.year}</span>
                    <span className="font-bold text-foreground">
                      {ln.ganZhiVi}
                    </span>
                    <span className="tabular-nums font-semibold text-muted">{ln.age}t</span>
                  </li>
                ))}
              </ul>
            </BaziCard>
          </article>
        ))}
      </div>
    </div>
  );
}
