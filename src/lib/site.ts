export const site = {
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "",
};

export function whatsappUrl(text?: string) {
  const base = site.whatsapp
    ? `https://wa.me/${site.whatsapp}`
    : "https://wa.me/";
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}