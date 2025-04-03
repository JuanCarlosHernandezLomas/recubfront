'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationES from '@/app/locales/es/translation.json';
import translationEN from '@/app/locales/en/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector) // Solo disponible en el cliente
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es',
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
}

export default i18n;
