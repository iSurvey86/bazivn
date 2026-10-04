import type { AccountProgressStep } from "@/lib/account/types";
import { READING_UI } from "@/components/reading/reading-ui-theme";

export function AccountProgressTimeline({
  percent,
  steps,
  compact,
}: {
  percent: number;
  steps: AccountProgressStep[];
  compact?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: READING_UI.surface,
        border: `1px solid ${READING_UI.border}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">
          {compact ? "Tiến độ luận giải" : "Thanh tiến độ luận giải"}
        </p>
        <p className="text-xs font-bold text-accent">Tổng: {percent}%</p>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full"
        style={{ backgroundColor: READING_UI.borderSoft }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            backgroundColor: READING_UI.confirm.bg,
          }}
        />
      </div>
      <ol className={`mt-4 space-y-3 ${compact ? "text-xs" : "text-sm"}`}>
        {steps.map((step, i) => {
          const mark =
            step.status === "done"
              ? "🟢"
              : step.status === "active"
                ? "🔵"
                : "⚪";
          return (
            <li key={step.id} className="flex gap-2">
              <span aria-hidden>{mark}</span>
              <div>
                <p className="font-bold text-foreground">
                  Bước {i + 1}: {step.title}
                  {step.completedAt ? (
                    <span className="ml-1 font-medium text-muted">
                      ({step.completedAt})
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-muted">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
