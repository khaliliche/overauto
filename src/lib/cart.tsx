"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loc, type Product, type Variant } from "./types";

type Tri = { fr: string; en: string; ar: string };

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  image: string;
  title: Tri;
  price: number;
  variant: {
    id: string;
    type: "color" | "scent";
    hex: string | null;
    name: Tri;
  } | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (item: Omit<CartItem, "quantity">, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Refresh prices from the database; drops products that no longer exist. */
  sync: (prices: Record<string, number>) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "overauto-cart";

/** Builds a cart line from a product (and the chosen variant, if any). */
export function buildCartItem(
  product: Product,
  variant: Variant | null
): Omit<CartItem, "quantity"> {
  return {
    key: `${product.id}:${variant?.id ?? "none"}`,
    productId: product.id,
    slug: product.slug,
    image: product.images?.[0] ?? "",
    price: Number(product.price),
    title: {
      fr: loc(product, "title", "fr"),
      en: loc(product, "title", "en"),
      ar: loc(product, "title", "ar"),
    },
    variant: variant
      ? {
          id: variant.id,
          type: variant.type,
          hex: variant.color_hex,
          name: {
            fr: loc(variant, "name", "fr"),
            en: loc(variant, "name", "en"),
            ar: loc(variant, "name", "ar"),
          },
        }
      : null,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Reading localStorage must happen after mount (SSR-safe).
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(
            parsed.filter(
              (x) =>
                x &&
                typeof x.key === "string" &&
                typeof x.productId === "string" &&
                typeof x.price === "number" &&
                typeof x.quantity === "number"
            )
          );
        }
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty: number) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.key === item.key);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = {
          ...copy[i],
          price: item.price,
          quantity: Math.min(999, copy[i].quantity + qty),
        };
        return copy;
      }
      return [...prev, { ...item, quantity: Math.min(999, qty) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.map((x) =>
        x.key === key
          ? { ...x, quantity: Math.max(1, Math.min(999, qty)) }
          : x
      )
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const sync = useCallback((prices: Record<string, number>) => {
    setItems((prev) =>
      prev
        .filter((x) => prices[x.productId] !== undefined)
        .map((x) => ({ ...x, price: prices[x.productId] }))
    );
  }, []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, x) => n + x.quantity, 0),
      subtotal: items.reduce((n, x) => n + x.price * x.quantity, 0),
      add,
      setQty,
      remove,
      clear,
      sync,
    }),
    [items, ready, add, setQty, remove, clear, sync]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
