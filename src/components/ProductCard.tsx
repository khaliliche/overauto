"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Package, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buildCartItem, useCart } from "@/lib/cart";
import { discountPercent, formatPrice } from "@/lib/money";
import { loc, type Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const { add } = useCart();
  const [done, setDone] = useState(false);

  const title = loc(product, "title", locale);
  const image = product.images?.[0];
  const href = `/catalogue/${product.slug}`;
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const soldOut = product.availability === "out_of_stock";
  const off = discountPercent(product.price, product.compare_at_price);

  function quickAdd() {
    add(buildCartItem(product, null), 1);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  const btn =
    "flex w-full items-center justify-center gap-2 rounded-sm px-3 py-2.5 text-sm font-bold transition-colors";

  return (
    <div className="group flex flex-col overflow-hidden rounded-sm border border-zinc-200 bg-white transition duration-200 hover:border-brand-600 hover:shadow-lg">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-zinc-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <Package size={56} />
          </div>
        )}
        <div className="absolute start-2 top-2 flex flex-col items-start gap-1">
          {off > 0 && (
            <span className="rounded-sm bg-brand-600 px-2 py-1 text-[11px] font-extrabold text-white">
              -{off}%
            </span>
          )}
          {soldOut && (
            <span className="rounded-sm bg-zinc-900 px-2 py-1 text-[11px] font-bold uppercase text-white">
              {t("availability.out_of_stock")}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {product.category && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">
            {loc(product.category, "name", locale)}
          </p>
        )}
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-zinc-900 hover:text-brand-600 sm:text-base">
            {title}
          </h3>
        </Link>

        <div className="mt-auto pt-1">
          {Number(product.price) > 0 ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-xl font-extrabold text-brand-600">
                {formatPrice(product.price, locale)}
              </span>
              {off > 0 && product.compare_at_price && (
                <span className="text-xs text-zinc-400 line-through">
                  {formatPrice(product.compare_at_price, locale)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm font-bold text-zinc-500">{t("priceOnRequest")}</p>
          )}
        </div>

        {soldOut ? (
          <span className={`${btn} cursor-not-allowed bg-zinc-200 text-zinc-500`}>
            {t("availability.out_of_stock")}
          </span>
        ) : hasVariants ? (
          <Link
            href={href}
            className={`${btn} border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white`}
          >
            {t("choose")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={quickAdd}
            className={`${btn} ${
              done
                ? "bg-emerald-600 text-white"
                : "bg-accent-700 text-white hover:bg-brand-600"
            }`}
          >
            {done ? <Check size={16} /> : <ShoppingCart size={16} />}
            {done ? t("added") : t("add")}
          </button>
        )}
      </div>
    </div>
  );
}
