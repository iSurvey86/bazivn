import { AccountShell } from "@/components/account/account-shell";
import { getAccountProfile } from "@/lib/account/get-account-context";
import type { AccountNavId } from "@/lib/account/types";
import type { ReactNode } from "react";

export async function AccountPageFrame({
  active,
  children,
}: {
  active: AccountNavId;
  children: ReactNode;
}) {
  const profile = await getAccountProfile();
  return (
    <AccountShell active={active} profile={profile}>
      {children}
    </AccountShell>
  );
}
