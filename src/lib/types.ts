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
  price: number;
  compare_at_price: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
  variants?: Variant[];
  category?: Category | null;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderLine = {
  product_id: string;
  slug: string;
  title: string;
  image: string;
  variant_id: string | null;
  variant: string | null;
  color_hex: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: number;
  created_at: string;
  status: OrderStatus;
  payment_method: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  note: string;
  locale: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

/** True when the product can be bought online (has a price and is in stock). */
export function isPurchasable(p: Pick<Product, "price" | "availability">) {
  return Number(p.price) > 0 && p.availability !== "out_of_stock";
}

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
