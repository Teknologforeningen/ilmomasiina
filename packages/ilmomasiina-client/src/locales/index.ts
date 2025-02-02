import en from "./en.json";
import sv from "./sv.json";

// eslint-disable-next-line import/prefer-default-export
export const i18nResources = {
  // this way we generate typescript errors if not exact match
  sv: sv satisfies typeof en,
  en: en satisfies typeof sv,
} as const;
