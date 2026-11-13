import JsonLd from "@/components/JsonLd";
import { DEFAULT_OG_IMAGE, SITE_NAME, languageAlternates, pageUrl, productJsonLd } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Banknote, ChevronRight, Package, Truck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AvailabilityBadge from "@/components/AvailabilityBadge";
import ProductBuy from "@/components/ProductBuy";
import ProductCard from "@/components/ProductCard";
import { discountPercent, formatPrice } from "@/lib/money";
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
  const n = await getTranslations("nav");
  const title = loc(product, "title", locale);
  const description = loc(product, "description", locale);
  const image = product.images?.[0];
  const hasPrice = Number(product.price) > 0;
  const off = discountPercent(product.price, product.compare_at_price);

  return (
    <>
      <JsonLd data={productJsonLd(product, locale)} />
      <section className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
          <Link href="/" className="hover:text-brand-600">{n("home")}</Link>
          <ChevronRight size={14} className="rtl:rotate-180" />
          <Link href="/catalogue" className="hover:text-brand-600">{n("catalogue")}</Link>
          {product.category && (
            <>
              <ChevronRight size={14} className="rtl:rotate-180" />
              <Link
                href={{ pathname: "/catalogue", query: { category: product.category.slug } }}
                className="hover:text-brand-600"
              >
                {loc(product.category, "name", locale)}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-sm border border-zinc-200 bg-zinc-100">
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
              <div className="flex h-full items-center justify-center text-zinc-300">
                <Package size={96} />
              </div>
            )}
            {off > 0 && hasPrice && (
              <span className="absolute start-3 top-3 rounded-sm bg-brand-600 px-3 py-1.5 text-sm font-extrabold text-white">
                -{off}%
              </span>
            )}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <AvailabilityBadge value={product.availability} />
              {product.category && (
                <span className="rounded-sm bg-zinc-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-700">
                  {loc(product.category, "name", locale)}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-extrabold uppercase leading-tight text-zinc-900 sm:text-5xl">
              {title}
            </h1>

            {hasPrice && (
              <p className="mt-4 flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-5xl font-extrabold text-brand-600">
                  {formatPrice(product.price, locale)}
                </span>
                {off > 0 && product.compare_at_price && (
                  <span className="text-lg text-zinc-400 line-through">
                    {formatPrice(product.compare_at_price, locale)}
                  </span>
                )}
              </p>
            )}

            {description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-zinc-600">
                {description}
              </p>
            )}

            <div className="my-7 border-y border-zinc-200 py-6">
              <ProductBuy product={product} />
            </div>

            <ul className="space-y-3 text-sm text-zinc-700">
              <li className="flex items-center gap-3">
                <Banknote size={20} className="shrink-0 text-brand-600" />
                {t("noteCod")}
              </li>
              <li className="flex items-center gap-3">
                <Truck size={20} className="shrink-0 text-brand-600" />
                {t("noteDelivery")}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <h2 className="mb-8 font-display text-3xl font-extrabold uppercase text-zinc-900">
              {t("more")}
              <span className="mt-2 block h-1 w-16 bg-brand-600" />
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {more.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
