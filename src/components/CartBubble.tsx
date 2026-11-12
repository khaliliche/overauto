"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Droplets, Minus, Plus, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/lib/cart";
import { whatsappUrl } from "@/lib/site";
import WhatsAppIcon from "./WhatsAppIcon";

type L = "fr" | "en" | "ar";
type OrderType = "wholesale" | "retail";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function CartBubble() {
  const t = useTranslations("bubble");
  const ct = useTranslations("cart");
  const c = useTranslations("common");
  const locale = useLocale() as L;
  const pathname = usePathname();
  const { items, count, ready, setQty, remove } = useCart();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<OrderType>("wholesale");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (count === 0) setOpen(false);
  }, [count]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready || count === 0 || pathname.startsWith("/cart")) return null;

  const typeLabel = type === "wholesale" ? c("wholesale") : c("pieceByPiece");

  function send() {
    if (!name.trim()) return setError(ct("errName"));
    if (!city.trim()) return setError(ct("errCity"));
    setError("");

    const lines = items.map((i) => {
      const title = i.title[locale] || i.title.fr;
      const v = i.variant ? i.variant.name[locale] || i.variant.name.fr : "";
      return `- ${title}${v ? ` (${v})` : ""} × ${i.quantity}`;
    });

    const parts = [
      `*${ct("wa.title")}*`,
      `${ct("wa.customer")} ${name.trim()}`,
      `${ct("wa.type")} ${typeLabel}`,
      ct("wa.products"),
      ...lines,
      `${ct("wa.city")} ${city.trim()}`,
    ];
    if (note.trim()) parts.push(`${ct("wa.note")} ${note.trim()}`);
    parts.push("", ct("wa.closing"));

    window.open(whatsappUrl(parts.join("\n")), "_blank", "noopener");
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-60 bg-black/30 sm:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label={ct("title")}
          className="sheet-up fixed inset-x-0 bottom-0 z-61 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl border border-brand-100 bg-white shadow-2xl sm:inset-x-auto sm:bottom-24 sm:end-5 sm:w-95 sm:max-h-[75vh] sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <p className="font-extrabold text-brand-900">
              🛒 {ct("title")}{" "}
              <span className="text-sm font-bold text-slate-400">({count})</span>
            </p>
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-slate-500 hover:bg-brand-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <div className="space-y-3">
              {items.map((i) => {
                const title = i.title[locale] || i.title.fr;
                const v = i.variant
                  ? i.variant.name[locale] || i.variant.name.fr
                  : "";
                return (
                  <div
                    key={i.key}
                    className="flex gap-3 rounded-2xl border border-brand-100 p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                      {i.image ? (
                        <Image
                          src={i.image}
                          alt={title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-brand-200">
                          <Droplets size={22} />
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <p className="line-clamp-2 text-sm font-bold text-brand-900">
                        {title}
                      </p>
                      {i.variant && (
                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          {i.variant.type === "color" && (
                            <span
                              className="h-3 w-3 rounded-full border border-slate-200"
                              style={{
                                backgroundColor: i.variant.hex ?? "#06b6d4",
                              }}
                            />
                          )}
                          {v}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center overflow-hidden rounded-full border border-brand-200">
                          <button
                            type="button"
                            onClick={() => setQty(i.key, i.quantity - 1)}
                            className="px-2.5 py-1.5 text-slate-600 hover:bg-brand-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-8 text-center text-xs font-bold">
                            {i.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(i.key, i.quantity + 1)}
                            className="px-2.5 py-1.5 text-slate-600 hover:bg-brand-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label={ct("remove")}
                          onClick={() => remove(i.key)}
                          className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-brand-100 pt-4">
              <input
                className={field}
                placeholder={ct("fullName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={field}
                placeholder={ct("city")}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                {(["wholesale", "retail"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setType(k)}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      type === k
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-200 text-slate-700 hover:bg-brand-50"
                    }`}
                  >
                    {k === "wholesale" ? c("wholesale") : c("pieceByPiece")}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                className={field}
                placeholder={ct("notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-brand-100 bg-white px-5 py-4">
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={send}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-white transition-colors hover:bg-[#1ebe5b]"
            >
              <WhatsAppIcon size={20} />
              {ct("send")}
            </button>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-bold text-brand-600 hover:underline"
            >
              {t("viewCart")}
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={t("open")}
        onClick={() => setOpen((v) => !v)}
        className="bubble-pop fixed bottom-5 end-5 z-62 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 shadow-xl shadow-brand-900/30 ring-4 ring-white transition-transform hover:scale-105 active:scale-95"
      >
        <span key={count} className="bubble-bump text-3xl leading-none">
          🛒
        </span>
        <span className="absolute -end-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-600 px-1.5 text-xs font-extrabold text-white ring-2 ring-white">
          {count}
        </span>
      </button>
    </>
  );
}