import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import i18n from "./i18n";

export type LanguageCode = "zh" | "en" | "ja" | "ko";

interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  languages: Language[];
  currentLanguage: Language;
  isLanguageReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("zh");
  const [isLanguageReady, setIsLanguageReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get language from URL params or localStorage
  const getInitialLanguage = useCallback((): LanguageCode => {
    const urlLang = searchParams.get("lang") as LanguageCode;
    if (urlLang && languages.some(l => l.code === urlLang)) {
      return urlLang;
    }
    
    const savedLang = localStorage.getItem("language") as LanguageCode;
    if (savedLang && languages.some(l => l.code === savedLang)) {
      return savedLang;
    }
    
    const browserLang = navigator.language.split("-")[0] as LanguageCode;
    if (languages.some(l => l.code === browserLang)) {
      return browserLang;
    }
    
    return "zh";
  }, [searchParams]);

  // Initialize language
  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguageState(initialLang);
    i18n.changeLanguage(initialLang);
    setIsLanguageReady(true);
  }, [getInitialLanguage]);

  // Sync language changes across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && e.newValue && e.newValue !== language) {
        const newLang = e.newValue as LanguageCode;
        setLanguageState(newLang);
        i18n.changeLanguage(newLang);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  // Update URL and localStorage when language changes
  const updateLanguage = useCallback((newLanguage: LanguageCode) => {
    if (newLanguage === language) return;

    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
    i18n.changeLanguage(newLanguage);

    // Update URL params without navigation
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("lang", newLanguage);
    
    // Use replace to avoid adding to history
    navigate(`${location.pathname}?${newSearchParams.toString()}`, {
      replace: true,
    });

    // Update html lang attribute
    document.documentElement.lang = newLanguage;
  }, [language, searchParams, navigate, location.pathname]);

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: updateLanguage,
        languages,
        currentLanguage,
        isLanguageReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}