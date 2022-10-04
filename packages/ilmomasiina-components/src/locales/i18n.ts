import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fi from './fi.json';
import swe from './swe.json';

const resources = {
  fi: { translation: fi },
  swe: { translation: swe },
};

i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'swe',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  });

export default i18n;
