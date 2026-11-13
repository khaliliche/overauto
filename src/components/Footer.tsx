import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site, whatsappUrl } from "@/lib/site";
import TriStripe from "./TriStripe";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Footer() {
  const t = useTranslations("footer");
  const n = useTranslations("nav");

  return (
    <footer className="mt-16 bg-accent-700 text-zinc-300">
      <TriStripe className="h-1.5" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="inline-block rounded-sm bg-white p-2">
            <Image
              src="/logo.png"
              alt="Over Auto"
              width={800}
              height={403}
              className="h-12 w-auto"
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
            {t("shop")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalogue" className="hover:text-white">{n("catalogue")}</Link></li>
            <li><Link href="/cart" className="hover:text-white">{n("cart")}</Link></li>
            <li><Link href="/about" className="hover:text-white">{n("about")}</Link></li>
            <li><Link href="/contact" className="hover:text-white">{n("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
            {t("help")}
          </h3>
          <ul className="space-y-2 text-sm">
            <li>{t("help1")}</li>
            <li>{t("help2")}</li>
            <li>{t("help3")}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold uppercase tracking-wide text-white">
            {t("contact")}
          </h3>
          <ul className="space-y-3 text-sm">
            {site.whatsapp && (
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <WhatsAppIcon size={16} /> WhatsApp
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Phone size={16} /> {site.phone}
                </a>
              </li>
            )}
            {site.email && (
              <li>
                <a
                  href={`mailto:${site.email}`}
                  dir="ltr"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Mail size={16} /> {site.email}
                </a>
              </li>
            )}
            {site.address && (
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" /> {site.address}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Over Auto. {t("rights")}
      </div>
    </footer>
  );
}
