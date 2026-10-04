import { AccountPageFrame } from "@/components/account/account-page-frame";
import { AccountPanel } from "@/components/account/account-panel";
import { AccountSettingsClient } from "@/components/account/account-settings-client";
import { getAccountProfile } from "@/lib/account/get-account-context";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function AccountSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const profile = await getAccountProfile();

  return (
    <AccountPageFrame active="settings">
      <AccountPanel title="Cài đặt tài khoản">
        <AccountSettingsClient
          displayName={profile.displayName}
          memberLevel={profile.memberLevel}
        />
      </AccountPanel>
    </AccountPageFrame>
  );
}
