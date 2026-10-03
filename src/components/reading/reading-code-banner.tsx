import { formatReadingCodeDisplay } from "@/lib/reading/code-format";
import type { ReadingOrder } from "@/lib/reading/types";
import { READING_UI } from "./reading-ui-theme";

/** Banner mã mệnh thư — cấp & khóa khi thanh toán. */
export function ReadingCodeBanner({
  order,
}: {
  order: Pick<ReadingOrder, "code" | "school" | "status">;
  /** @deprecated */
  subtitle?: string;
}) {
  const locked =
    Boolean(order.code) &&
    (order.status === "paid" ||
      order.status === "collecting" ||
      order.status === "submitted");

  return (
    <div
      className="mb-5 rounded-xl px-4 py-3 text-center"
      style={{
        backgroundColor: READING_UI.code.bg,
        border: `1px solid ${READING_UI.code.border}`,
      }}
    >
      <p
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: READING_UI.code.label }}
      >
        Mã mệnh thư
      </p>
      {locked && order.code ? (
        <p
          className="mt-0.5 font-mono text-xl font-black tracking-wider"
          style={{ color: READING_UI.code.value }}
        >
          {formatReadingCodeDisplay(order.code)}
        </p>
      ) : (
        <p
          className="mt-1 text-sm font-medium"
          style={{ color: READING_UI.code.value }}
        >
          Sẽ được cấp sau khi thanh toán
        </p>
      )}
    </div>
  );
}
