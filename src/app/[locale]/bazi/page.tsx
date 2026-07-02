import { BaziCalculatorForm } from "@/components/bazi/bazi-calculator-form";
import { BaziShell } from "@/components/bazi/bazi-ui";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type BaziPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BaziPage({ params }: BaziPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("bazi");
  const tCommon = await getTranslations("common");

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← {tCommon("title")}
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-base font-medium text-muted">{t("subtitle")}</p>
        </header>

        <div className="mt-8">
          <BaziCalculatorForm />
        </div>
      </main>
    </BaziShell>
  );
}
