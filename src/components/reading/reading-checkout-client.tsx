"use client";

import { useRouter } from "@/i18n/navigation";
import { SCHOOL_LABEL, type ReadingOrder } from "@/lib/reading/types";
import { ReadingCodeBanner } from "./reading-code-banner";
import { READING_UI } from "./reading-ui-theme";
import { useMemo, useState } from "react";

type Props = {
  order: ReadingOrder;
};

/** Số tiền demo — thay bằng bảng giá thật khi nối PayOS. */
const DEMO_AMOUNT_VND = 500_000;

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

/** Payload QR giả (quét được chuỗi demo, chưa phải VietQR ngân hàng). */
function buildDemoQrPayload(order: ReadingOrder) {
  return [
    "BAZIVN-DEMO",
    `ORDER:${order.id}`,
    `SCHOOL:${order.school}`,
    `AMOUNT:${DEMO_AMOUNT_VND}`,
  ].join("|");
}

function demoQrImageUrl(payload: string) {
  const q = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${q}`;
}

export function ReadingCheckoutClient({ order }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrPayload = useMemo(() => buildDemoQrPayload(order), [order]);
  const qrUrl = useMemo(() => demoQrImageUrl(qrPayload), [qrPayload]);

  async function markPaid() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reading/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không cập nhật được.");
      router.push(`/reading/${order.id}/collect`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  if (
    order.code &&
    (order.status === "paid" ||
      order.status === "collecting" ||
      order.status === "submitted")
  ) {
    return (
      <div className="space-y-4">
        <ReadingCodeBanner order={order} subtitle="Đã đăng ký" />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
          <p className="text-lg font-bold text-emerald-800">
            Thanh toán đã kích hoạt — mã đã khóa
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Tiếp tục nhập dữ liệu theo phương thức đã chọn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/reading/${order.id}/collect`)}
          className="inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white"
          style={{
            backgroundColor: READING_UI.confirm.bg,
            border: `1px solid ${READING_UI.confirm.border}`,
          }}
        >
          Tiếp tục nhập dữ liệu →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReadingCodeBanner order={order} />

      <div className="rounded-xl border border-border bg-surface px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">Thanh toán</h2>
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
            style={{
              backgroundColor: READING_UI.view.bg,
              color: READING_UI.view.text,
              border: `1px solid ${READING_UI.view.border}`,
            }}
          >
            QR demo
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Quét QR (giả) hoặc bấm nút bên dưới để giả lập «đã nhận tiền» — hệ
          thống cấp và khóa{" "}
          <strong className="text-foreground">Mã mệnh thư</strong> (
          {SCHOOL_LABEL[order.school]}).
        </p>

        <div className="mt-5 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="QR thanh toán demo"
            width={220}
            height={220}
            className="rounded-lg border border-border bg-white p-2 shadow-sm"
          />
          <p className="text-center text-sm text-foreground">
            Số tiền:{" "}
            <strong className="text-lg">{formatVnd(DEMO_AMOUNT_VND)}</strong>
          </p>
          <p className="max-w-xs text-center text-xs text-muted">
            Nội dung CK demo:{" "}
            <span className="font-mono text-foreground">
              MT {order.id.slice(0, 8).toUpperCase()}
            </span>
            <br />
            Chưa nối ngân hàng / PayOS — chỉ để trình diễn UI.
          </p>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={markPaid}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        style={{
          backgroundColor: READING_UI.confirm.bg,
          border: `1px solid ${READING_UI.confirm.border}`,
        }}
      >
        {loading ? "Đang kích hoạt…" : "Tôi đã chuyển khoản (demo)"}
      </button>
      <p className="text-center text-xs text-muted">
        Nút này giả webhook «nhận tiền» → kích hoạt mã ngay.
      </p>
    </div>
  );
}
