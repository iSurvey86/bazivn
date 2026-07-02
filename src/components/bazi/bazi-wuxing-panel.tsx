import type { BaZiChartResult } from "@/lib/astrology-engine";
import { ELEMENT_COLORS } from "@/lib/bazi-terminology";
import { elementTheme } from "@/lib/bazi-theme";
import { BaziCard, BaziSectionTitle } from "./bazi-ui";

type BaziWuxingPanelProps = {
  chart: BaZiChartResult;
};

const ELEMENTS = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const;

export function BaziWuxingPanel({ chart }: BaziWuxingPanelProps) {
  const { wuXingBalance } = chart;
  const max = Math.max(...ELEMENTS.map((e) => wuXingBalance[e]), 1);
  const dominantTheme = elementTheme(wuXingBalance.dominant);

  return (
    <div className="space-y-6">
      <BaziCard className="p-6">
        <BaziSectionTitle subtitle="Phân bố năng lượng ngũ hành trong lá số">
          Cân bằng Ngũ Hành
        </BaziSectionTitle>

        <div
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          style={{
            backgroundColor: dominantTheme.bg,
            borderColor: dominantTheme.border,
            color: dominantTheme.color,
          }}
        >
          <span className="font-bold">Hành mạnh nhất:</span>
          <span className="font-black">{wuXingBalance.dominant}</span>
        </div>

        <div className="mt-8 space-y-5">
          {ELEMENTS.map((element) => {
            const value = wuXingBalance[element];
            const pct = Math.round((value / wuXingBalance.total) * 100) || 0;
            const width = Math.round((value / max) * 100);
            const theme = elementTheme(element);

            return (
              <div key={element}>
                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span className="font-bold" style={{ color: theme.color }}>
                    {element}
                  </span>
                  <span className="tabular-nums font-semibold text-foreground">
                    {value.toFixed(1)} điểm · {pct}%
                  </span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: theme.bg }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: ELEMENT_COLORS[element],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </BaziCard>
    </div>
  );
}
