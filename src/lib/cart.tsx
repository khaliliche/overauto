"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Tri = { fr: string; en: string; ar: string };

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  image: string;
  title: Tri;
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
  ready: boolean;
  add: (item: Omit<CartItem, "quantity">, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "sile-quote";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
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
          quantity: Math.min(9999, copy[i].quantity + qty),
        };
        return copy;
      }
      return [...prev, { ...item, quantity: Math.min(9999, qty) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.map((x) =>
        x.key === key
          ? { ...x, quantity: Math.max(1, Math.min(9999, qty)) }
          : x
      )
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, x) => n + x.quantity, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}