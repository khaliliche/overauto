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
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mb-10 mt-2 text-slate-600">{t("subtitle")}</p>
      <Suspense>
        <CatalogueGrid products={products} categories={categories} />
      </Suspense>
    </section>
  );
}