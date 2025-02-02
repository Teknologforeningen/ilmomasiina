import i18n, { DefaultNamespace, ParseKeys } from "i18next";
import { initReactI18next } from "react-i18next";

import { i18nResources as componentsRes } from "@tietokilta/ilmomasiina-client";
import en from "./locales/en.json";
import sv from "./locales/sv.json";

export const defaultNS = ["frontend", "public"] as const;
const svCombined = { ...sv, ...componentsRes.sv } as const;
const enCombined = { ...en, ...componentsRes.en } as const;
export const resources = {
  // these generate typescript errors if not exact match
  sv: svCombined satisfies typeof enCombined,
  en: enCombined satisfies typeof svCombined,
} as const;

export type KnownLanguage = keyof typeof resources;
export const knownLanguages = Object.keys(resources) as KnownLanguage[];

export type TKey = ParseKeys<DefaultNamespace>;

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS,
    supportedLngs: Object.keys(resources),
    interpolation: {
      // for React
      escapeValue: false,
    },
    debug: !PROD,
    react: {
      nsMode: "fallback",
    },
  });

export default i18n;
