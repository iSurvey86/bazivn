"use client";

import {
  INTEREST_TOPIC_IDS,
  INTEREST_TOPIC_LABEL,
  RECTIFY_EVENT_GROUP_IDS,
  RECTIFY_EVENT_GROUP_LABEL,
  RECTIFY_TIME_SOURCE_IDS,
  RECTIFY_TIME_SOURCE_LABEL,
  type InterestTopicId,
  type ReadingRectifyPayload,
  type RectifyEventGroup,
  type RectifyLandmark,
  type RectifyTimeSource,
} from "@/lib/reading/types";
import { useState } from "react";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  initial?: ReadingRectifyPayload | null;
  onSubmit: (payload: ReadingRectifyPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

type Step = "range" | "landmarks" | "future" | "questions";

const MIN_LANDMARKS = 8;

function emptyLandmark(): RectifyLandmark {
  return {
    day: null,
    month: null,
    year: null,
    group: null,
    detail: "",
  };
}

function btnPrimary(disabled?: boolean) {
  return {
    backgroundColor: READING_UI.confirm.bg,
    border: `1px solid ${READING_UI.confirm.border}`,
    opacity: disabled ? 0.5 : 1,
  } as const;
}

function btnSecondary() {
  return {
    backgroundColor: READING_UI.view.bg,
    border: `1px solid ${READING_UI.view.border}`,
    color: READING_UI.view.text,
  } as const;
}

export function ReadingRectifyWizard({
  initial,
  onSubmit,
  loading,
  error,
}: Props) {
  const [step, setStep] = useState<Step>("range");
  const [timeRange, setTimeRange] = useState(initial?.timeRange ?? "");
  const [timeSource, setTimeSource] = useState<RectifyTimeSource | "">(
    initial?.timeSource ?? "",
  );
  const [landmarks, setLandmarks] = useState<RectifyLandmark[]>(() => {
    const rows = initial?.landmarks?.length
      ? initial.landmarks
      : Array.from({ length: 4 }, emptyLandmark);
    return rows.map((r) => ({
      day: r.day ?? null,
      month: r.month ?? null,
      year: r.year ?? null,
      group: r.group ?? null,
      detail: r.detail ?? "",
    }));
  });
  const [uncertainNotes, setUncertainNotes] = useState(
    initial?.uncertainNotes ?? "",
  );
  const [knownFuture, setKnownFuture] = useState(initial?.knownFuture ?? "");
  const [topics, setTopics] = useState<InterestTopicId[]>(
    initial?.interestTopics ?? [],
  );
  const [mainQuestion, setMainQuestion] = useState(
    initial?.mainQuestion ?? "",
  );
  const [extraQuestions, setExtraQuestions] = useState(
    initial?.extraQuestions ?? "",
  );
  const [commitment, setCommitment] = useState(
    initial?.dataCommitment ?? false,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function filledLandmarks() {
    return landmarks.filter((l) => l.detail.trim() && l.group);
  }

  function goRangeNext() {
    if (!timeRange.trim()) {
      setLocalError("Vui lòng nhập khoảng giờ sinh có thể xảy ra.");
      return;
    }
    if (!timeSource) {
      setLocalError("Vui lòng chọn nguồn nhớ / xác nhận giờ sinh.");
      return;
    }
    setLocalError(null);
    setStep("landmarks");
  }

  function goLandmarksNext() {
    if (filledLandmarks().length < MIN_LANDMARKS) {
      setLocalError(
        `Cần ít nhất ${MIN_LANDMARKS} mốc sự kiện lớn (hiện có ${filledLandmarks().length}).`,
      );
      return;
    }
    setLocalError(null);
    setStep("future");
  }

  async function finish() {
    if (!mainQuestion.trim()) {
      setLocalError("Vui lòng nhập câu hỏi quan trọng nhất.");
      return;
    }
    if (!commitment) {
      setLocalError("Cần xác nhận cam kết dữ liệu.");
      return;
    }
    if (!timeSource) {
      setLocalError("Thiếu nguồn xác nhận giờ sinh.");
      return;
    }
    setLocalError(null);
    await onSubmit({
      timeRange: timeRange.trim(),
      timeSource,
      landmarks: filledLandmarks(),
      uncertainNotes: uncertainNotes.trim(),
      knownFuture: knownFuture.trim(),
      interestTopics: topics,
      mainQuestion: mainQuestion.trim(),
      extraQuestions: extraQuestions.trim(),
      dataCommitment: true,
    });
  }

  if (step === "range") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 2C. Hiệu chỉnh, tìm giờ sinh (Bước 1/2: thông tin khoảng giờ)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Phần này dành cho người có giờ sinh chưa chắc chắn hoặc nằm sát ranh
          giới 2 giờ (thời thần).
        </p>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Khoảng giờ sinh có thể xảy ra
          </span>
          <p className="text-xs text-muted">
            Ví dụ: 17:00–19:00 hoặc ±20p quanh 17:45
          </p>
          <input
            type="text"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Nguồn nhớ / Xác nhận giờ sinh
          </span>
          <select
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={timeSource}
            onChange={(e) =>
              setTimeSource(e.target.value as RectifyTimeSource | "")
            }
          >
            <option value="">— Chọn nguồn xác nhận —</option>
            {RECTIFY_TIME_SOURCE_IDS.map((id) => (
              <option key={id} value={id}>
                {RECTIFY_TIME_SOURCE_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        {(localError || error) && (
          <p className="text-sm font-medium text-red-600">
            {localError || error}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={goRangeNext}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={btnPrimary()}
          >
            Tiếp tục nhập mốc quá khứ →
          </button>
        </div>
      </div>
    );
  }

  if (step === "landmarks") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 2C. Hiệu chỉnh, tìm giờ sinh (Bước 2/2: các mốc định vị quan trọng)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Để hiệu chỉnh giờ chính xác, vui lòng cung cấp {MIN_LANDMARKS}–12 mốc
          sự kiện lớn nhất đời người (kết hôn, sinh con, mua nhà, tai nạn lớn,
          tang chế…).
        </p>
        <p className="text-xs italic text-muted">
          Thời điểm: năm nên có; tháng và ngày tùy chọn nếu nhớ.
        </p>
        <div className="space-y-3">
          {landmarks.map((row, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl p-3"
              style={{
                backgroundColor: READING_UI.surfaceMuted,
                border: `1px solid ${READING_UI.borderSoft}`,
              }}
            >
              <p className="text-xs font-bold text-muted">Mốc {i + 1}</p>
              <div className="grid grid-cols-3 gap-1.5 sm:max-w-xs">
                <select
                  aria-label="Ngày"
                  className="rounded-lg border border-border bg-surface px-2 py-2 text-sm"
                  value={row.day ?? ""}
                  onChange={(e) => {
                    const day = e.target.value ? Number(e.target.value) : null;
                    setLandmarks((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i]!, day };
                      return next;
                    });
                  }}
                >
                  <option value="">Ngày</option>
                  {Array.from({ length: 31 }, (_, d) => d + 1).map((d) => (
                    <option key={d} value={d}>
                      {String(d).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Tháng"
                  className="rounded-lg border border-border bg-surface px-2 py-2 text-sm"
                  value={row.month ?? ""}
                  onChange={(e) => {
                    const month = e.target.value
                      ? Number(e.target.value)
                      : null;
                    setLandmarks((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i]!, month };
                      return next;
                    });
                  }}
                >
                  <option value="">Tháng</option>
                  {Array.from({ length: 12 }, (_, m) => m + 1).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  aria-label="Năm"
                  placeholder="Năm"
                  className="rounded-lg border border-border bg-surface px-2 py-2 text-sm"
                  value={row.year ?? ""}
                  onChange={(e) => {
                    const year = e.target.value ? Number(e.target.value) : null;
                    setLandmarks((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i]!, year };
                      return next;
                    });
                  }}
                />
              </div>
              <select
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={row.group ?? ""}
                onChange={(e) => {
                  const group = (e.target.value || null) as
                    | RectifyEventGroup
                    | null;
                  setLandmarks((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, group };
                    return next;
                  });
                }}
              >
                <option value="">— Chọn nhóm sự kiện —</option>
                {RECTIFY_EVENT_GROUP_IDS.map((id) => (
                  <option key={id} value={id}>
                    {RECTIFY_EVENT_GROUP_LABEL[id]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Chi tiết sự kiện…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={row.detail}
                onChange={(e) => {
                  const detail = e.target.value;
                  setLandmarks((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, detail };
                    return next;
                  });
                }}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => setLandmarks((prev) => [...prev, emptyLandmark()])}
        >
          + Thêm mốc thời gian
        </button>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Có dữ liệu nào ở trên bạn không chắc chắn, dễ nhầm lẫn ngày tháng
            không?
          </span>
          <textarea
            rows={2}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={uncertainNotes}
            onChange={(e) => setUncertainNotes(e.target.value)}
          />
        </label>
        {(localError || error) && (
          <p className="text-sm font-medium text-red-600">
            {localError || error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() => setStep("range")}
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={btnSecondary()}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            onClick={goLandmarksNext}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={btnPrimary()}
          >
            Chuyển sang Phần 3: Tương lai →
          </button>
        </div>
      </div>
    );
  }

  if (step === "future") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 3. Dữ liệu tương lai đã biết trước (nếu có)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Lưu ý: Ghi các kế hoạch đã chốt. Mục đích: tách bạch dữ liệu đã biết
          trước — không dùng để «chứng minh» độ chính xác dự báo.
        </p>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Các sự kiện / kế hoạch tương lai đã biết trước (Để trống nếu không
            có)
          </span>
          <textarea
            rows={5}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={knownFuture}
            onChange={(e) => setKnownFuture(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() => setStep("landmarks")}
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={btnSecondary()}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={btnPrimary()}
          >
            Chuyển sang Phần 4: Câu hỏi →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground">
        Phần 4. Câu hỏi muốn mệnh thư trả lời
      </h2>
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">
          4.1 Nhóm vấn đề quan tâm
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTEREST_TOPIC_IDS.map((id) => {
            const checked = topics.includes(id);
            return (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2 text-sm"
                style={{
                  backgroundColor: checked
                    ? READING_UI.code.bg
                    : READING_UI.surfaceMuted,
                  border: `1px solid ${
                    checked ? READING_UI.code.border : READING_UI.borderSoft
                  }`,
                }}
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={checked}
                  onChange={() =>
                    setTopics((prev) =>
                      checked ? prev.filter((x) => x !== id) : [...prev, id],
                    )
                  }
                />
                <span>{INTEREST_TOPIC_LABEL[id]}</span>
              </label>
            );
          })}
        </div>
      </div>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          4.2 Câu hỏi quan trọng nhất{" "}
          <span className="text-red-600">(* Bắt buộc)</span>
        </span>
        <textarea
          rows={3}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          value={mainQuestion}
          onChange={(e) => setMainQuestion(e.target.value)}
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          4.3 Các câu hỏi bổ sung (Tùy chọn)
        </span>
        <textarea
          rows={3}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          value={extraQuestions}
          onChange={(e) => setExtraQuestions(e.target.value)}
        />
      </label>
      <label
        className="flex cursor-pointer items-start gap-2 rounded-xl px-3 py-3 text-sm"
        style={{
          backgroundColor: READING_UI.surfaceMuted,
          border: `1px solid ${READING_UI.borderSoft}`,
        }}
      >
        <input
          type="checkbox"
          className="mt-0.5"
          checked={commitment}
          onChange={(e) => setCommitment(e.target.checked)}
        />
        <span>
          Tôi hiểu dữ liệu quá khứ là tự nguyện và chỉ dùng để nghiệm chứng; dữ
          liệu tương lai đã biết trước không được tính là kết quả dự báo.
        </span>
      </label>
      {(localError || error) && (
        <p className="text-sm font-medium text-red-600">
          {localError || error}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={() => setStep("future")}
          className="rounded-xl px-4 py-2.5 text-sm font-bold"
          style={btnSecondary()}
        >
          ← Quay lại
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={finish}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          style={btnPrimary(loading)}
        >
          {loading ? "Đang gửi…" : "✉ Xác nhận & gửi thông tin"}
        </button>
      </div>
    </div>
  );
}
