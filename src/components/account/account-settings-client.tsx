"use client";

import { READING_UI } from "@/components/reading/reading-ui-theme";
import { useState } from "react";

export function AccountSettingsClient({
  displayName,
  memberLevel,
}: {
  displayName: string;
  memberLevel: string;
}) {
  const [emailYear, setEmailYear] = useState(true);
  const [remindHalf, setRemindHalf] = useState(true);
  const [zalo, setZalo] = useState(false);
  const [hideNamePdf, setHideNamePdf] = useState(true);
  const [pinJournal, setPinJournal] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-accent">
          Thông tin cá nhân
        </h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted">Họ tên:</dt>
            <dd className="font-semibold text-foreground">{displayName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Cấp độ thành viên:</dt>
            <dd className="font-semibold text-foreground">{memberLevel}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-accent">
          Cài đặt thông báo & nhắc nhở
        </h2>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={emailYear}
              onChange={(e) => setEmailYear(e.target.checked)}
            />
            <span>Gửi email khi có phân tích Lưu niên năm mới.</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={remindHalf}
              onChange={(e) => setRemindHalf(e.target.checked)}
            />
            <span>
              Nhắc nhở vận trình vào ngày 1 và 15 Dương lịch hàng tháng.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={zalo}
              onChange={(e) => setZalo(e.target.checked)}
            />
            <span>Bật thông báo qua Zalo/Telegram.</span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-wide text-accent">
          Bảo mật dữ liệu
        </h2>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={hideNamePdf}
              onChange={(e) => setHideNamePdf(e.target.checked)}
            />
            <span>Ẩn họ tên thật khi xuất file PDF.</span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={pinJournal}
              onChange={(e) => setPinJournal(e.target.checked)}
            />
            <span>Yêu cầu mã PIN khi truy cập Nhật ký nghiệm chứng.</span>
          </label>
        </div>
      </section>

      <button
        type="button"
        className="rounded-xl px-4 py-2.5 text-sm font-bold text-white"
        style={{ backgroundColor: READING_UI.confirm.bg }}
        onClick={() => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2000);
        }}
      >
        Lưu cài đặt
      </button>
      {saved ? (
        <p className="text-sm font-semibold text-emerald-700">
          Đã lưu (demo — chưa đồng bộ server).
        </p>
      ) : null}
    </div>
  );
}
