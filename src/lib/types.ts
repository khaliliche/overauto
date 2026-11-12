export type Availability = "in_stock" | "out_of_stock" | "on_request";

export type Category = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  sort_order: number;
};

export type Variant = {
  id: string;
  product_id: string;
  type: "color" | "scent";
  name_fr: string;
  name_en: string;
  name_ar: string;
  color_hex: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  slug: string;
  title_fr: string;
  title_en: string;
  title_ar: string;
  description_fr: string;
  description_en: string;
  description_ar: string;
  availability: Availability;
  is_visible: boolean;
  is_featured: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
  variants?: Variant[];
  category?: Category | null;
};

/** Returns row[field_locale], falling back to French if empty. */
export function loc(
  row: object,
  field: string,
  locale: string
): string {
  const r = row as Record<string, unknown>;
  const v = r[`${field}_${locale}`];
  if (typeof v === "string" && v.trim() !== "") return v;
  const fr = r[`${field}_fr`];
  return typeof fr === "string" ? fr : "";
}