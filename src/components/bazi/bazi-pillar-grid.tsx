import type { BaZiChartResult } from "@/lib/astrology-engine";
import type { ShenShaItem } from "@/lib/bazi-shen-sha";
import {
  elementTheme,
  PILLAR_LABELS,
  PILLAR_LABELS_FULL,
  PILLAR_ORDER,
  type PillarKey,
} from "@/lib/bazi-theme";
import { BaziCard, BaziSectionTitle } from "./bazi-ui";

/** Thần sát: xanh = cát, đỏ = hung — không theo ngũ hành */
const SHEN_SHA_TEXT = {
  cat: "#2d5a40",
  hung: "#a83828",
} as const;

type BaziPillarGridProps = {
  chart: BaZiChartResult;
};

function ShenShaList({ stars }: { stars: ShenShaItem[] }) {
  if (stars.length === 0) {
    return <span className="text-muted">—</span>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1">
      {stars.map((star) => (
        <span
          key={star.key}
          className="text-sm font-semibold"
          style={{ color: SHEN_SHA_TEXT[star.type] }}
        >
          {star.name}
        </span>
      ))}
    </div>
  );
}

export function BaziPillarGrid({ chart }: BaziPillarGridProps) {
  return (
    <div className="space-y-6">
      <BaziCard className="overflow-hidden p-0">
        <div className="bazi-scroll-x overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-strong bg-surface-muted">
                <th className="w-28 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  &nbsp;
                </th>
                {PILLAR_ORDER.map((key) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-foreground"
                  >
                    {PILLAR_LABELS_FULL[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-semibold text-muted">Thiên Can</td>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  const theme = elementTheme(p.elementStem);
                  return (
                    <td key={key} className="px-4 py-3 text-center">
                      <span
                        className="bazi-pillar-char text-2xl"
                        style={{ color: theme.color }}
                      >
                        {p.ganVi}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-semibold text-muted">Địa Chi</td>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  const theme = elementTheme(p.elementBranch);
                  return (
                    <td key={key} className="px-4 py-3 text-center">
                      <span
                        className="bazi-pillar-char text-2xl"
                        style={{ color: theme.color }}
                      >
                        {p.zhiVi}
                      </span>
                      <p className="mt-0.5 text-xs font-medium text-muted">{p.animal}</p>
                    </td>
                  );
                })}
              </tr>

              <tr className="border-b border-border">
                <td className="px-4 py-3 text-xs font-semibold text-muted">Trụ</td>
                {PILLAR_ORDER.map((key) => {
                  const p = chart.pillars[key];
                  const theme = elementTheme(p.elementStem);
                  return (
                    <td key={key} className="px-4 py-3 text-center">
                      <span
                        className="bazi-pillar-char text-lg"
                        style={{ color: theme.color }}
                      >
                        {p.ganZhiVi}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {(
                [
                  ["Chủ tinh", (k: PillarKey) => chart.pillars[k].tenGodGanVi],
                  ["Trường sinh", (k: PillarKey) => chart.pillars[k].diShiVi],
                  ["Nạp âm", (k: PillarKey) => chart.pillars[k].naYinVi],
                  [
                    "Tuần / Không",
                    (k: PillarKey) =>
                      `${chart.pillars[k].xunVi} · ${chart.pillars[k].xunKongVi}`,
                  ],
                ] as const
              ).map(([label, getter]) => (
                <tr key={label} className="border-b border-border">
                  <td className="px-4 py-2 text-xs font-semibold text-muted">{label}</td>
                  {PILLAR_ORDER.map((key) => (
                    <td
                      key={key}
                      className="px-4 py-2 text-center text-sm font-medium text-foreground"
                    >
                      {getter(key)}
                    </td>
                  ))}
                </tr>
              ))}

              <tr>
                <td className="px-4 py-2.5 text-xs font-semibold text-muted">Thần sát</td>
                {PILLAR_ORDER.map((key) => (
                  <td key={key} className="px-3 py-2.5">
                    <ShenShaList stars={chart.pillars[key].shenSha ?? []} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="border-t border-border px-4 py-2.5 text-xs text-muted">
          <span className="font-semibold text-foreground">Chú thích màu:</span> Can/Chi/Trụ —{" "}
          <span style={{ color: elementTheme("Mộc").color }}>Mộc</span>,{" "}
          <span style={{ color: elementTheme("Hỏa").color }}>Hỏa</span>,{" "}
          <span style={{ color: elementTheme("Thổ").color }}>Thổ</span>,{" "}
          <span style={{ color: elementTheme("Kim").color }}>Kim</span>,{" "}
          <span style={{ color: elementTheme("Thủy").color }}>Thủy</span>
          {" · "}
          Thần sát —{" "}
          <span style={{ color: SHEN_SHA_TEXT.cat }}>cát</span>,{" "}
          <span style={{ color: SHEN_SHA_TEXT.hung }}>hung</span>
        </p>
      </BaziCard>

      <div>
        <BaziSectionTitle subtitle="Can ẩn trong từng địa chi và thập thần tương ứng">
          Tàng Can
        </BaziSectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLAR_ORDER.map((key) => {
            const pillar = chart.pillars[key];
            return (
              <BaziCard key={key} className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {PILLAR_LABELS[key]}
                </p>
                {pillar.hideGan.length === 0 ? (
                  <p className="text-sm text-muted">—</p>
                ) : (
                  <ul className="space-y-2">
                    {pillar.hideGan.map((h) => (
                      <li
                        key={`${key}-${h.gan}`}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="font-medium text-foreground">{h.ganVi}</span>
                        <span className="font-semibold text-foreground">{h.tenGodVi}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </BaziCard>
            );
          })}
        </div>
      </div>

      {(chart.shenSha?.length ?? 0) > 0 ? (
        <BaziCard className="p-4">
          <BaziSectionTitle>Thần sát toàn cục</BaziSectionTitle>
          <ShenShaList stars={chart.shenSha ?? []} />
        </BaziCard>
      ) : null}

      <div>
        <BaziSectionTitle subtitle="Thai Nguyên, Mệnh Cung và Thân Cung">
          Cung vị
        </BaziSectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["Thai Nguyên", chart.palaces.taiYuan],
              ["Mệnh Cung", chart.palaces.mingGong],
              ["Thân Cung", chart.palaces.shenGong],
            ] as const
          ).map(([label, palace]) => (
            <BaziCard key={label} className="p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {label}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {palace.ganZhiVi}
              </p>
              <p className="mt-1 text-xs text-muted">{palace.naYinVi}</p>
            </BaziCard>
          ))}
        </div>
      </div>
    </div>
  );
}
