"use client";

import {
  INTEREST_TOPIC_IDS,
  INTEREST_TOPIC_LABEL,
  VERIFICATION_FIELD_IDS,
  VERIFICATION_FIELD_LABEL,
  VERIFICATION_FIELD_NOTE,
  type InterestTopicId,
  type ReadingVerifiedPayload,
  type VerificationEvent,
  type VerificationFieldId,
} from "@/lib/reading/types";
import { useMemo, useState } from "react";
import { READING_UI } from "./reading-ui-theme";

type Props = {
  initial?: ReadingVerifiedPayload | null;
  onSubmit: (payload: ReadingVerifiedPayload) => Promise<void>;
  loading?: boolean;
  error?: string | null;
};

type Step =
  | "fields"
  | `detail:${VerificationFieldId}`
  | "anchor"
  | "future"
  | "questions";

function emptyEvent(): VerificationEvent {
  return { day: null, month: null, year: null, content: "" };
}

function normalizeEvent(e: VerificationEvent): VerificationEvent {
  return {
    day: e.day ?? null,
    month: e.month ?? null,
    year: e.year ?? null,
    content: e.content ?? "",
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

export function ReadingVerifiedWizard({
  initial,
  onSubmit,
  loading,
  error,
}: Props) {
  const [selected, setSelected] = useState<VerificationFieldId[]>(
    initial?.selectedFields ?? [],
  );
  const [fieldEvents, setFieldEvents] = useState<
    Record<VerificationFieldId, VerificationEvent[]>
  >(() => {
    const base = Object.fromEntries(
      VERIFICATION_FIELD_IDS.map((id) => [id, [emptyEvent(), emptyEvent()]]),
    ) as Record<VerificationFieldId, VerificationEvent[]>;
    for (const f of initial?.fields ?? []) {
      base[f.fieldId] =
        f.events.length > 0
          ? f.events.map(normalizeEvent)
          : [emptyEvent(), emptyEvent()];
    }
    return base;
  });
  const [anchorMilestone, setAnchorMilestone] = useState(
    initial?.anchorMilestone ?? "",
  );
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
  const [step, setStep] = useState<Step>("fields");
  const [localError, setLocalError] = useState<string | null>(null);

  const detailIndex = useMemo(() => {
    if (!step.startsWith("detail:")) return -1;
    const id = step.slice("detail:".length) as VerificationFieldId;
    return selected.indexOf(id);
  }, [step, selected]);

  function toggleField(id: VerificationFieldId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function goFieldsNext() {
    if (selected.length < 1) {
      setLocalError("Chọn ít nhất 1 lĩnh vực.");
      return;
    }
    setLocalError(null);
    setStep(`detail:${selected[0]!}`);
  }

  function goDetailNext() {
    const id = selected[detailIndex]!;
    const rows = fieldEvents[id] ?? [];
    const filled = rows.filter((r) => r.content.trim());
    if (filled.length < 1) {
      setLocalError("Nhập ít nhất 1 mốc sự kiện cho lĩnh vực này.");
      return;
    }
    setLocalError(null);
    if (detailIndex < selected.length - 1) {
      setStep(`detail:${selected[detailIndex + 1]!}`);
    } else {
      setStep("anchor");
    }
  }

  function goDetailBack() {
    if (detailIndex <= 0) setStep("fields");
    else setStep(`detail:${selected[detailIndex - 1]!}`);
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
    setLocalError(null);
    const payload: ReadingVerifiedPayload = {
      selectedFields: selected,
      fields: selected.map((fieldId) => ({
        fieldId,
        events: (fieldEvents[fieldId] ?? []).filter((e) => e.content.trim()),
      })),
      anchorMilestone: anchorMilestone.trim(),
      uncertainNotes: uncertainNotes.trim(),
      knownFuture: knownFuture.trim(),
      interestTopics: topics,
      mainQuestion: mainQuestion.trim(),
      extraQuestions: extraQuestions.trim(),
      dataCommitment: true,
    };
    await onSubmit(payload);
  }

  if (step === "fields") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 2B. Nghiệm chứng quá khứ (Bước 1/3: chọn lĩnh vực)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Hãy chọn lĩnh vực mà bạn có những mốc sự kiện nhớ rõ thời gian nhất
          để hệ thống tạo biểu mẫu.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Bạn muốn cung cấp mốc sự kiện về lĩnh vực nào? (Chọn nhiều hoặc
            tất cả)
          </p>
          <button
            type="button"
            className="text-xs font-bold text-accent hover:underline"
            onClick={() =>
              setSelected(
                selected.length === VERIFICATION_FIELD_IDS.length
                  ? []
                  : [...VERIFICATION_FIELD_IDS],
              )
            }
          >
            {selected.length === VERIFICATION_FIELD_IDS.length
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {VERIFICATION_FIELD_IDS.map((id) => {
            const checked = selected.includes(id);
            return (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
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
                  onChange={() => toggleField(id)}
                />
                <span className="font-medium text-foreground">
                  {VERIFICATION_FIELD_LABEL[id]}
                </span>
              </label>
            );
          })}
        </div>
        {(localError || error) && (
          <p className="text-sm font-medium text-red-600">
            {localError || error}
          </p>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={goFieldsNext}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={btnPrimary()}
          >
            Tiếp tục nhập mốc thời gian →
          </button>
        </div>
      </div>
    );
  }

  if (step.startsWith("detail:")) {
    const id = step.slice("detail:".length) as VerificationFieldId;
    const rows = fieldEvents[id] ?? [emptyEvent()];
    const nextLabel =
      detailIndex < selected.length - 1
        ? `Tiếp tục (${VERIFICATION_FIELD_LABEL[selected[detailIndex + 1]!]}) →`
        : "Tiếp tục →";
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 2B. Nghiệm chứng quá khứ (Bước 2/3: chi tiết sự kiện)
        </h2>
        <p className="text-sm font-bold text-accent">
          ► Lĩnh vực {detailIndex + 1}: {VERIFICATION_FIELD_LABEL[id]}
        </p>
        <p className="text-xs italic text-muted">
          Thời điểm: điền năm (nên có); tháng và ngày tùy chọn nếu nhớ.
          {VERIFICATION_FIELD_NOTE[id]
            ? ` ${VERIFICATION_FIELD_NOTE[id]}`
            : ""}
        </p>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid gap-2 rounded-xl p-3"
              style={{
                backgroundColor: READING_UI.surfaceMuted,
                border: `1px solid ${READING_UI.borderSoft}`,
              }}
            >
              <div className="grid grid-cols-3 gap-1.5 sm:max-w-xs">
                <select
                  aria-label="Ngày"
                  className="rounded-lg border border-border bg-surface px-2 py-2 text-sm"
                  value={row.day ?? ""}
                  onChange={(e) => {
                    const day = e.target.value ? Number(e.target.value) : null;
                    setFieldEvents((prev) => {
                      const next = [...(prev[id] ?? [])];
                      next[i] = { ...next[i]!, day };
                      return { ...prev, [id]: next };
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
                    setFieldEvents((prev) => {
                      const next = [...(prev[id] ?? [])];
                      next[i] = { ...next[i]!, month };
                      return { ...prev, [id]: next };
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
                    setFieldEvents((prev) => {
                      const next = [...(prev[id] ?? [])];
                      next[i] = { ...next[i]!, year };
                      return { ...prev, [id]: next };
                    });
                  }}
                />
              </div>
              <input
                type="text"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                placeholder="Sự kiện / kết quả…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={row.content}
                onChange={(e) => {
                  const content = e.target.value;
                  setFieldEvents((prev) => {
                    const next = [...(prev[id] ?? [])];
                    next[i] = { ...next[i]!, content };
                    return { ...prev, [id]: next };
                  });
                }}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() =>
            setFieldEvents((prev) => ({
              ...prev,
              [id]: [...(prev[id] ?? []), emptyEvent()],
            }))
          }
        >
          + Thêm mốc thời gian
        </button>
        {(localError || error) && (
          <p className="text-sm font-medium text-red-600">
            {localError || error}
          </p>
        )}
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={goDetailBack}
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={btnSecondary()}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            onClick={goDetailNext}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={btnPrimary()}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    );
  }

  if (step === "anchor") {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">
          Phần 2B. Nghiệm chứng quá khứ (Bước 3/3: mốc định vị)
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Trong các sự kiện đã cung cấp, đâu là bước ngoặt / mốc «neo» quan
          trọng nhất để luận giả đối chiếu với đại vận?
        </p>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Mốc sự kiện quan trọng nhất
          </span>
          <textarea
            rows={3}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={anchorMilestone}
            onChange={(e) => setAnchorMilestone(e.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-foreground">
            Có dữ liệu nào bạn nhớ mang máng, không chắc chắn về thời gian
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
        <div className="flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setStep(`detail:${selected[selected.length - 1]!}`)
            }
            className="rounded-xl px-4 py-2.5 text-sm font-bold"
            style={btnSecondary()}
          >
            ← Quay lại
          </button>
          <button
            type="button"
            onClick={() => setStep("future")}
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
          Lưu ý: Ghi các kế hoạch đã chốt (mua nhà, chuyển việc, phẫu thuật đã
          hẹn…). Mục đích: tách bạch dữ liệu đã biết trước — không dùng để
          «chứng minh» độ chính xác dự báo.
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
            onClick={() => setStep("anchor")}
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

  // questions
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
        <p className="text-xs text-muted">
          Nên hỏi trực tiếp, cụ thể, có mốc thời gian nếu cần.
        </p>
        <textarea
          rows={3}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Ví dụ: Năm 2027 có nên chuyển hướng kinh doanh riêng không?"
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

      <label className="flex cursor-pointer items-start gap-2 rounded-xl px-3 py-3 text-sm"
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
