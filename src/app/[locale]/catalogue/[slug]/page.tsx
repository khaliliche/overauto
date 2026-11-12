import JsonLd from "@/components/JsonLd";
import { DEFAULT_OG_IMAGE, SITE_NAME, languageAlternates, pageUrl, productJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Droplets, Info } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { getOtherProducts, getProductBySlug } from "@/lib/products";
import { loc } from "@/lib/types";

export const revalidate = 60;

// How many other products to show under a product
const MORE_PRODUCTS_LIMIT = 4;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = loc(product, "title", locale);
  const description = loc(product, "description", locale).slice(0, 160);
  const path = `/catalogue/${product.slug}`;
  const url = pageUrl(locale, path);
  const image = product.images?.[0] || DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const more = await getOtherProducts(product.id, MORE_PRODUCTS_LIMIT);
  const t = await getTranslations("product");
  const c = await getTranslations("common");
  const title = loc(product, "title", locale);
  const description = loc(product, "description", locale);
  const image = product.images?.[0];

  return (
    <>
    <JsonLd data={productJsonLd(product, locale)} />
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/catalogue"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("back")}
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-brand-100 bg-brand-50">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-brand-200">
              <Droplets size={96} />
            </div>
          )}
        </div>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <AvailabilityBadge value={product.availability} />
            {product.category && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                {loc(product.category, "name", locale)}
              </span>
            )}
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
              {c("wholesale")}
            </span>
            <span className="rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-bold text-accent-800">
              {c("pieceByPiece")}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            {title}
          </h1>

          {description && (
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">
              {description}
            </p>
          )}

          <div className="my-7 flex gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            <Info size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="font-bold">{t("modes")}</p>
              <p className="mt-0.5 text-slate-600">{t("priceNote")}</p>
            </div>
          </div>

          <ProductBuy product={product} />
        </div>
      </div>
    </section>

    {more.length > 0 && (
      <section className="border-t border-brand-100 bg-brand-50/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="mb-8 text-2xl font-extrabold text-brand-900 sm:text-3xl">
            {t("more")}
          </h2>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
            {more.map((p) => (
              <div
                key={p.id}
                className="w-[62%] shrink-0 snap-start md:w-auto [&>a]:h-full"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )}
    </>
  );
}