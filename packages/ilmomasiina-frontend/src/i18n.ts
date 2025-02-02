import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { i18n as componentsI18n, i18nResources as componentsRes } from "@tietokilta/ilmomasiina-components";
import * as en from "./locales/en.json";
import * as sv from "./locales/sv.json";

export const defaultNS = ["frontend", "components"] as const;
const enCombined = { ...en, ...componentsRes.en } as const;
const svCombined = { ...sv, ...componentsRes.sv } as const;
export const resources = {
  // these generate typescript errors if not exact match
  sv: svCombined as typeof enCombined,
  en: enCombined as typeof svCombined,
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "sv",
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

componentsI18n.init({ debug: !PROD });

i18n.on("languageChanged", (newLang) => {
  componentsI18n.changeLanguage(newLang);
});
componentsI18n.changeLanguage(i18n.language);

export default i18n;
