"use client";

import { useRouter } from "@/i18n/navigation";
import {
  METHOD_LABEL,
  type ReadingOrder,
  type ReadingPostPay,
  type ReadingRectifyPayload,
  type ReadingVerifiedPayload,
} from "@/lib/reading/types";
import { useState } from "react";
import { ReadingCodeBanner } from "./reading-code-banner";
import { ReadingRectifyWizard } from "./reading-rectify-wizard";
import { ReadingVerifiedWizard } from "./reading-verified-wizard";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  order: ReadingOrder;
};

function resolveCollectMethod(order: ReadingOrder) {
  const unknownHour =
    order.intake?.unknownHour || order.lockedSnapshot?.unknownHour;
  // C chỉ khi không rõ giờ; giờ đủ → chỉ A/B
  if (unknownHour) return "rectify_hour" as const;
  const m = order.intake?.method ?? order.postPay?.method ?? "independent";
  return m === "rectify_hour" ? "independent" : m;
}

export function ReadingCollectClient({ order }: Props) {
  const router = useRouter();
  const method = resolveCollectMethod(order);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitted =
    order.status === "submitted" || Boolean(order.postPay?.submittedAt);

  async function savePostPay(postPay: ReadingPostPay, submit = true) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reading/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_post_pay",
          submit,
          postPay: {
            ...postPay,
            verified: postPay.verified ?? null,
            rectify: postPay.rectify ?? null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không lưu được.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  if (!order.code) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted">
          Chưa có Mã mệnh thư. Vui lòng hoàn tất thanh toán trước.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/reading/${order.id}/checkout`)}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: READING_UI.confirm.bg }}
        >
          Đến thanh toán
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <ReadingCodeBanner order={order} />
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
          <p className="text-lg font-bold text-emerald-800">
            Đã nhận đủ thông tin
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Đơn theo phương thức{" "}
            <strong>{METHOD_LABEL[method]}</strong> đã được ghi nhận. Giữ{" "}
            <strong>Mã mệnh thư</strong> để tra cứu tiến độ luận giải.
          </p>
        </div>
      </div>
    );
  }

  if (method === "independent") {
    return (
      <div className="space-y-4">
        <ReadingCodeBanner order={order} />
        <div
          className="rounded-xl px-5 py-6 text-center"
          style={{
            backgroundColor: READING_UI.view.bg,
            border: `1px solid ${READING_UI.view.border}`,
          }}
        >
          <p
            className="text-lg font-bold"
            style={{ color: READING_UI.view.text }}
          >
            Luận độc lập — chỉ dùng dữ liệu cơ bản
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bạn đã chọn phương thức A. Không cần cung cấp thêm mốc quá khứ.
            Hệ thống sẽ lập mệnh thư từ thông tin đã khóa sau khi đăng ký.
          </p>
          <p className="mt-3 text-sm text-muted">
            Giữ <strong className="text-foreground">Mã mệnh thư</strong> phía
            trên để tra cứu.
          </p>
        </div>
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            savePostPay({
              method: "independent",
              verified: null,
              rectify: null,
              submittedAt: null,
            })
          }
          className="inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          style={{
            backgroundColor: READING_UI.confirm.bg,
            border: `1px solid ${READING_UI.confirm.border}`,
          }}
        >
          {loading ? "Đang xác nhận…" : "Xác nhận — chờ mệnh thư"}
        </button>
      </div>
    );
  }

  if (method === "rectify_hour") {
    return (
      <div className="space-y-2">
        <ReadingCodeBanner order={order} />
        <ReadingRectifyWizard
          initial={order.postPay?.rectify}
          loading={loading}
          error={error}
          onSubmit={async (rectify: ReadingRectifyPayload) => {
            await savePostPay({
              method: "rectify_hour",
              verified: null,
              rectify,
              submittedAt: null,
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ReadingCodeBanner order={order} />
      <ReadingVerifiedWizard
        initial={order.postPay?.verified}
        loading={loading}
        error={error}
        onSubmit={async (verified: ReadingVerifiedPayload) => {
          await savePostPay({
            method: "verified",
            verified,
            rectify: null,
            submittedAt: null,
          });
        }}
      />
    </div>
  );
}
