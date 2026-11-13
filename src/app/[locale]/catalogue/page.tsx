import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { getTranslations, setRequestLocale } from "next-intl/server";
import CatalogueGrid from "@/components/CatalogueGrid";
import { getCategories, getProducts } from "@/lib/products";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMeta(locale, "/catalogue", { ns: "catalogue", desc: "subtitle" });
}
export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalogue");
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-extrabold uppercase text-zinc-900 sm:text-5xl">
        {t("title")}
        <span className="mt-2 block h-1 w-16 bg-brand-600" />
      </h1>
      <p className="mb-8 mt-3 text-zinc-600">{t("subtitle")}</p>
      <Suspense>
        <CatalogueGrid products={products} categories={categories} />
      </Suspense>
    </section>
  );
}