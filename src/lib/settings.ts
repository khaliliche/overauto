import { supabasePublic } from "./supabase/public";

export type Settings = {
  shipping_fee: number;
  free_shipping_from: number | null;
};

// Used if the settings table is missing or empty. Keep in sync with the SQL.
export const DEFAULT_SETTINGS: Settings = {
  shipping_fee: 30,
  free_shipping_from: 500,
};

export async function getSettings(): Promise<Settings> {
  const { data } = await supabasePublic()
    .from("settings")
    .select("shipping_fee, free_shipping_from")
    .eq("id", 1)
    .maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return {
    shipping_fee: Number(data.shipping_fee),
    free_shipping_from:
      data.free_shipping_from == null ? null : Number(data.free_shipping_from),
  };
}

export function shippingFor(subtotal: number, s: Settings) {
  if (s.free_shipping_from != null && subtotal >= s.free_shipping_from) return 0;
  return s.shipping_fee;
}
