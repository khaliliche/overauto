"use client";

import { useState } from "react";
import { Check, ClipboardList, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { loc, type Product, type Variant } from "@/lib/types";

export default function ProductBuy({ product }: { product: Product }) {
  const t = useTranslations("product");
  const locale = useLocale();
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
  const unavailable = product.availability === "out_of_stock";

  function pick(id: string) {
    setVariantId(id);
    setAdded(false);
  }

  function changeQty(n: number) {
    setQty(Math.max(1, Math.min(9999, n || 1)));
    setAdded(false);
  }

  function onAdd() {
    add(
      {
        key: `${product.id}:${selected?.id ?? "none"}`,
        productId: product.id,
        slug: product.slug,
        image: product.images?.[0] ?? "",
        title: {
          fr: loc(product, "title", "fr"),
          en: loc(product, "title", "en"),
          ar: loc(product, "title", "ar"),
        },
        variant: selected
          ? {
              id: selected.id,
              type: selected.type,
              hex: selected.color_hex,
              name: {
                fr: loc(selected, "name", "fr"),
                en: loc(selected, "name", "en"),
                ar: loc(selected, "name", "ar"),
              },
            }
          : null,
      },
      qty
    );
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-slate-700">
            {t("color")}
            {selected?.type === "color" && (
              <span className="ms-2 font-semibold text-slate-500">
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
                className={`h-9 w-9 rounded-full border border-slate-300 shadow-sm transition ${
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
          <p className="mb-2 text-sm font-bold text-slate-700">
            {t("scent")}
          </p>
          <div className="flex flex-wrap gap-2">
            {scents.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => pick(v.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  variantId === v.id
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 text-slate-700 hover:bg-brand-50"
                }`}
              >
                {loc(v, "name", locale)}
              </button>
            ))}
          </div>
        </div>
      )}

      {unavailable ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {t("unavailable")}
        </p>
      ) : (
        <>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">
              {t("quantity")}
            </p>
            <div className="inline-flex items-center overflow-hidden rounded-full border border-brand-200">
              <button
                type="button"
                onClick={() => changeQty(qty - 1)}
                className="px-4 py-3 text-slate-600 hover:bg-brand-50"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={9999}
                value={qty}
                onChange={(e) => changeQty(parseInt(e.target.value, 10))}
                className="w-16 border-x border-brand-200 py-2 text-center text-sm font-bold outline-none"
              />
              <button
                type="button"
                onClick={() => changeQty(qty + 1)}
                className="px-4 py-3 text-slate-600 hover:bg-brand-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-2 rounded-full bg-accent-600 px-8 py-3.5 font-bold text-white transition-colors hover:bg-accent-700"
            >
              <ClipboardList size={18} />
              {t("add")}
            </button>
            {added && (
              <>
                <span className="flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  <Check size={16} />
                  {t("added")}
                </span>
                <Link
                  href="/cart"
                  className="text-sm font-bold text-brand-600 underline"
                >
                  {t("viewQuote")}
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}