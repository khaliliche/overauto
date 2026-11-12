// The 10 colors the admin can choose from (and the client sees as circles).
export type PaletteColor = {
  hex: string;
  fr: string;
  en: string;
  ar: string;
  /** true = light color, so the check mark must be dark */
  light?: boolean;
};

export const PALETTE: PaletteColor[] = [
  { hex: "#111827", fr: "Noir", en: "Black", ar: "\u0623\u0633\u0648\u062f" },
  { hex: "#ffffff", fr: "Blanc", en: "White", ar: "\u0623\u0628\u064a\u0636", light: true },
  { hex: "#dc2626", fr: "Rouge", en: "Red", ar: "\u0623\u062d\u0645\u0631" },
  { hex: "#2563eb", fr: "Bleu", en: "Blue", ar: "\u0623\u0632\u0631\u0642" },
  { hex: "#16a34a", fr: "Vert", en: "Green", ar: "\u0623\u062e\u0636\u0631" },
  { hex: "#facc15", fr: "Jaune", en: "Yellow", ar: "\u0623\u0635\u0641\u0631", light: true },
  { hex: "#f97316", fr: "Orange", en: "Orange", ar: "\u0628\u0631\u062a\u0642\u0627\u0644\u064a" },
  { hex: "#7c3aed", fr: "Violet", en: "Purple", ar: "\u0628\u0646\u0641\u0633\u062c\u064a" },
  { hex: "#ec4899", fr: "Rose", en: "Pink", ar: "\u0648\u0631\u062f\u064a" },
  { hex: "#6b7280", fr: "Gris", en: "Gray", ar: "\u0631\u0645\u0627\u062f\u064a" },
];
