"use client";

import { READING_UI } from "@/components/reading/reading-ui-theme";
import type { AccountJournalEntry } from "@/lib/account/types";
import { useState } from "react";

const GROUPS = [
  "Tài chính - Chi tiêu",
  "Đời sống",
  "Thể thao / Sức khỏe",
  "Hôn nhân",
  "Công việc",
  "Khác",
];

export function AccountJournalClient({
  initial,
}: {
  initial: AccountJournalEntry[];
}) {
  const [entries, setEntries] = useState(initial);
  const [date, setDate] = useState("");
  const [group, setGroup] = useState(GROUPS[0]!);
  const [content, setContent] = useState("");

  function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!date.trim() || !content.trim()) return;
    setEntries((prev) => [
      {
        id: `local-${Date.now()}`,
        dateLabel: date,
        group,
        content: content.trim(),
        matched: false,
      },
      ...prev,
    ]);
    setContent("");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={addEntry}
        className="space-y-3 rounded-xl p-4"
        style={{
          backgroundColor: READING_UI.surfaceMuted,
          border: `1px solid ${READING_UI.borderSoft}`,
        }}
      >
        <p className="text-sm font-bold text-foreground">+ Thêm nhật ký mới</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-muted">
            Ngày xảy ra
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-muted">
            Nhóm
            <select
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-xs font-semibold text-muted">
          Nội dung
          <textarea
            required
            rows={2}
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: READING_UI.confirm.bg }}
        >
          Lưu sự kiện
        </button>
        <p className="text-[11px] text-muted">
          Demo local trên trình duyệt — sẽ đồng bộ server khi có Auth.
        </p>
      </form>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          Lịch sử các mốc sự kiện
        </p>
        <ul className="mt-2 space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl px-3 py-2.5 text-sm"
              style={{
                backgroundColor: READING_UI.surface,
                border: `1px solid ${READING_UI.borderSoft}`,
              }}
            >
              <p className="font-bold text-foreground">
                {entry.matched ? "🟢" : "⚪"} {entry.dateLabel} — [{entry.group}]
              </p>
              <p className="mt-0.5 text-muted">{entry.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
