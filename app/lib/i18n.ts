import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// 导入语言资源
import en from "~/locales/en.json";
import ja from "~/locales/ja.json";
import ko from "~/locales/ko.json";
import zh from "~/locales/zh.json";

const resources = {
  zh: { translation: zh },
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
};

// 自定义语言检测器 - 从URL参数获取语言
const urlParamDetector = {
  name: "urlParam",
  lookup() {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("lang");
    }
    return null;
  },
  cacheUserLanguage(lng: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lng);
    }
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "zh",
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["urlParam", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

// 添加自定义检测器
i18n.services.languageDetector?.addDetector(urlParamDetector);

export default i18n;
