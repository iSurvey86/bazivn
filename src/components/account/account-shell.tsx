"use client";

import { Link } from "@/i18n/navigation";
import { ACCOUNT_NAV, type AccountNavId } from "@/lib/account/types";
import type { AccountProfile } from "@/lib/account/types";
import type { ReactNode } from "react";
import { READING_UI } from "@/components/reading/reading-ui-theme";

export function AccountShell({
  active,
  profile,
  children,
}: {
  active: AccountNavId;
  profile: AccountProfile;
  children: ReactNode;
}) {
  const statusColor =
    profile.statusTone === "ready"
      ? "#2f6f5e"
      : profile.statusTone === "processing"
        ? "#c45c26"
        : READING_UI.muted;

  return (
    <div className="bazi-page-bg flex min-h-full flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-gradient-to-r from-[#f3e0cb] to-[#f8ebe0] px-4 shadow-sm sm:px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-sm font-black tracking-widest text-foreground">
            BAZIVN
          </span>
          <span className="mt-0.5 text-[10px] font-extrabold tracking-[0.2em] text-accent">
            MỆNH THƯ
          </span>
        </Link>
        <Link
          href="/bazi"
          className="text-xs font-bold text-muted transition hover:text-accent"
        >
          ← Lập lá số
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-0 md:flex-row">
        <aside
          className="w-full shrink-0 border-b border-border md:w-64 md:border-b-0 md:border-r"
          style={{ backgroundColor: "rgb(255 253 249 / 92%)" }}
        >
          <div className="px-4 py-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ backgroundColor: READING_UI.confirm.bg }}
              >
                {profile.displayName
                  .split(/\s+/)
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">
                  {profile.displayName}
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold tracking-wide text-accent">
                  {profile.code}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold" style={{ color: statusColor }}>
                  ● {profile.statusLabel}
                </p>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              {ACCOUNT_NAV.map((item) => {
                const on = item.id === active;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
                    style={
                      on
                        ? {
                            backgroundColor: READING_UI.code.bg,
                            color: READING_UI.ink,
                            borderLeft: `3px solid ${READING_UI.confirm.bg}`,
                          }
                        : { color: READING_UI.muted }
                    }
                  >
                    <span className="w-5 text-center text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: READING_UI.confirm.bg }}
              onClick={() =>
                alert("Tải PDF mệnh thư — sẽ nối khi bàn giao bản chính thức.")
              }
            >
              Tải bản PDF mệnh thư ↓
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
