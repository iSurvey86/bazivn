import { BaziShell } from "@/components/bazi/bazi-ui";
import { Link } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <BaziShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-muted">
          BaziVN
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-lg text-lg font-medium text-muted">{t("subtitle")}</p>
        <Link
          href="/bazi"
          className="mt-10 inline-flex items-center rounded-lg bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent-hover"
        >
          {tCommon("homeCta")}
        </Link>
      </main>
    </BaziShell>
  );
}
