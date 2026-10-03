import { BaziChartBoard } from "@/components/bazi/bazi-chart-board";
import { BaziShell } from "@/components/bazi/bazi-ui";
import { getChartById } from "@/lib/charts/repository";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type ChartPageProps = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ year?: string }>;
};

export default async function ChartPage({ params, searchParams }: ChartPageProps) {
  const { locale, id } = await params;
  const { year: yearParam } = await searchParams;
  setRequestLocale(locale);

  const record = await getChartById(id);
  if (!record) notFound();

  const t = await getTranslations("bazi");
  const parsedYear = yearParam ? Number(yearParam) : NaN;
  const initialReferenceYear = Number.isFinite(parsedYear)
    ? parsedYear
    : undefined;

  return (
    <BaziShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/bazi"
          className="text-sm font-bold text-muted transition hover:text-accent"
        >
          ← {t("backToForm")}
        </Link>

        <div className="mt-6">
          <BaziChartBoard
            chartId={record.id}
            chart={record.baziData}
            fullName={record.fullName}
            birthPlace={record.birthPlace}
            initialReferenceYear={initialReferenceYear}
          />
        </div>
      </main>
    </BaziShell>
  );
}
