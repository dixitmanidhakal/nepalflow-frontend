/**
 * i18next setup - Nepali/English localization
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ne from './ne.json';

const savedLang = localStorage.getItem('nepalflow_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ne: { translation: ne },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// Persist language choice
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('nepalflow_lang', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = 'ltr'; // Nepali is LTR
});

export default i18n;
