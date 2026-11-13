"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { buildCartItem, useCart } from "@/lib/cart";
import { site, whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";
import { isPurchasable, loc, type Product, type Variant } from "@/lib/types";

export default function ProductBuy({ product }: { product: Product }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const { add } = useCart();

  const variants = [...(product.variants ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const colors = variants.filter((v) => v.type === "color");
  const scents = variants.filter((v) => v.type === "scent");

  const [variantId, setVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected: Variant | null =
    variants.find((v) => v.id === variantId) ?? null;
  const soldOut = product.availability === "out_of_stock";
  const purchasable = isPurchasable(product);

  function pick(id: string) {
    setVariantId(id);
    setAdded(false);
  }

  function changeQty(n: number) {
    setQty(Math.max(1, Math.min(999, n || 1)));
    setAdded(false);
  }

  function onAdd(goToCart: boolean) {
    add(buildCartItem(product, selected), qty);
    if (goToCart) router.push("/cart");
    else setAdded(true);
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-zinc-800">
            {t("color")}
            {selected?.type === "color" && (
              <span className="ms-2 font-semibold text-zinc-500">
                {loc(selected, "name", locale)}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-label={loc(v, "name", locale)}
                title={loc(v, "name", locale)}
                onClick={() => pick(v.id)}
                style={{ backgroundColor: v.color_hex ?? "#06b6d4" }}
                className={`h-9 w-9 rounded-full border border-zinc-300 shadow-sm transition ${
                  variantId === v.id
                    ? "ring-2 ring-brand-600 ring-offset-2"
                    : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {scents.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-zinc-800">{t("scent")}</p>
          <div className="flex flex-wrap gap-2">
            {scents.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => pick(v.id)}
                className={`rounded-sm border px-4 py-2 text-sm font-semibold transition ${
                  variantId === v.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
                }`}
              >
                {loc(v, "name", locale)}
              </button>
            ))}
          </div>
        </div>
      )}

      {soldOut ? (
        <p className="rounded-sm bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700">
          {t("unavailable")}
        </p>
      ) : !purchasable ? (
        <div className="space-y-3">
          <p className="text-lg font-bold text-zinc-700">{t("priceOnRequest")}</p>
          {site.whatsapp && (
            <a
              href={whatsappUrl(loc(product, "title", locale))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#1fb957]"
            >
              <WhatsAppIcon size={18} />
              {t("askWhatsapp")}
            </a>
          )}
        </div>
      ) : (
        <>
          <div>
            <p className="mb-2 text-sm font-bold text-zinc-800">{t("quantity")}</p>
            <div className="inline-flex items-center overflow-hidden rounded-sm border border-zinc-300">
              <button
                type="button"
                aria-label="-"
                onClick={() => changeQty(qty - 1)}
                className="px-4 py-3 text-zinc-600 hover:bg-zinc-100"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={999}
                value={qty}
                onChange={(e) => changeQty(parseInt(e.target.value, 10))}
                className="w-16 border-x border-zinc-300 py-2 text-center text-sm font-bold outline-none"
              />
              <button
                type="button"
                aria-label="+"
                onClick={() => changeQty(qty + 1)}
                className="px-4 py-3 text-zinc-600 hover:bg-zinc-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onAdd(true)}
              className="flex items-center gap-2 rounded-sm bg-brand-600 px-8 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-700"
            >
              {t("buyNow")}
            </button>
            <button
              type="button"
              onClick={() => onAdd(false)}
              className="flex items-center gap-2 rounded-sm border-2 border-zinc-900 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <ShoppingCart size={18} />
              {t("add")}
            </button>
          </div>

          {added && (
            <p className="flex items-center gap-3 text-sm font-bold text-emerald-700">
              <span className="flex items-center gap-1.5">
                <Check size={16} />
                {t("added")}
              </span>
              <Link href="/cart" className="text-brand-600 underline">
                {t("viewCart")}
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
