"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS: Record<OrderStatus, [string, string]> = {
  new: ["Nouvelle", "bg-red-100 text-red-700"],
  confirmed: ["Confirmée", "bg-amber-100 text-amber-800"],
  shipped: ["Expédiée", "bg-blue-100 text-blue-800"],
  delivered: ["Livrée", "bg-emerald-100 text-emerald-800"],
  cancelled: ["Annulée", "bg-slate-200 text-slate-600"],
};

const FILTERS: (OrderStatus | "all")[] = [
  "all",
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const dh = (n: number) => `${Number(n).toLocaleString("fr-FR")} DH`;

/** 0612345678 -> 212612345678 (for wa.me links). */
function waNumber(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("212")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return "212" + d.slice(1);
  return d;
}

export default function OrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(o: Order, status: OrderStatus) {
    setBusy(o.id);
    await createClient().from("orders").update({ status }).eq("id", o.id);
    setBusy(null);
    router.refresh();
  }

  async function remove(o: Order) {
    if (!confirm(`Supprimer la commande n° ${o.order_number} ?`)) return;
    setBusy(o.id);
    await createClient().from("orders").delete().eq("id", o.id);
    setBusy(null);
    router.refresh();
  }

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md border px-3.5 py-1.5 text-sm font-bold ${
              filter === f
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            {f === "all" ? "Toutes" : STATUS[f][0]}
            {f === "new" && newCount > 0 ? ` (${newCount})` : ""}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-slate-300 p-12 text-center text-slate-500">
          Aucune commande.
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((o) => {
            const [label, cls] = STATUS[o.status] ?? STATUS.new;
            const isOpen = open === o.id;
            return (
              <li key={o.id} className="rounded-md border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      #{o.order_number} · {o.customer_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(o.created_at).toLocaleString("fr-FR")} · {o.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>
                      {label}
                    </span>
                    <span className="font-bold text-slate-900">{dh(o.total)}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-slate-100 p-4 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Client</p>
                        <p className="font-semibold">{o.customer_name}</p>
                        <p dir="ltr" className="text-left">{o.phone}</p>
                        <p>{o.address}, {o.city}</p>
                        {o.note && <p className="mt-1 italic text-slate-500">« {o.note} »</p>}
                      </div>
                      <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                        <a
                          href={`tel:${o.phone.replace(/\s/g, "")}`}
                          className="rounded-md border border-slate-300 px-3 py-2 font-semibold hover:bg-slate-50"
                        >
                          Appeler
                        </a>
                        <a
                          href={`https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(
                            `Bonjour ${o.customer_name}, nous confirmons votre commande n° ${o.order_number} (${dh(o.total)}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-[#25D366] px-3 py-2 font-semibold text-white"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        {o.items.map((i, k) => (
                          <tr key={k}>
                            <td className="py-2 pr-3">
                              {i.title}
                              {i.variant ? ` — ${i.variant}` : ""}
                            </td>
                            <td className="py-2 pr-3 text-right text-slate-500">
                              {i.price > 0 ? `${dh(i.price)} × ${i.quantity}` : `× ${i.quantity}`}
                            </td>
                            <td className="py-2 text-right font-semibold">
                              {i.price > 0 ? (
                                dh(i.price * i.quantity)
                              ) : (
                                <span className="text-amber-600">Prix à confirmer</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="space-y-1 text-right">
                      <p>Sous-total : {dh(o.subtotal)}</p>
                      <p>Livraison : {o.shipping > 0 ? dh(o.shipping) : "Gratuite"}</p>
                      <p className="text-base font-bold">
                        Total à encaisser : {dh(o.total)}
                      </p>
                      {o.items.some((i) => i.price <= 0) && (
                        <p className="font-semibold text-amber-600">
                          Certains produits n&apos;ont pas de prix : appelez le client pour confirmer le total final.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-2 font-semibold">
                        Statut
                        <select
                          disabled={busy === o.id}
                          value={o.status}
                          onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
                          className="rounded-md border border-slate-300 bg-white px-3 py-2"
                        >
                          {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {STATUS[s][0]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => remove(o)}
                        className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
