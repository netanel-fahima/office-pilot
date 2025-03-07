import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@src/locales/en.json";
import he from "@src/locales/he.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: "he", // ברירת מחדל: עברית
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
