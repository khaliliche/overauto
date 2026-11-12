import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-slate-600 sm:flex-row">
        <p className="font-extrabold text-brand-700">
          Sile <span className="text-accent-500">Chemicals</span>
        </p>
        <p>{t("tagline")}</p>
        <p>
          © {new Date().getFullYear()} Sile Chemicals. {t("rights")}
        </p>
      </div>
    </footer>
  );
}