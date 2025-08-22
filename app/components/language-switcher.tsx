import { Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const languages = [
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);

    // 根据当前路径构建新的URL
    const currentPath = location.pathname;
    const query = searchParams.get("q");

    // 如果在主页
    if (currentPath === "/" || currentPath.startsWith("/?")) {
      const params = new URLSearchParams();
      params.set("lang", langCode);
      if (query) {
        params.set("q", query);
      }
      navigate(`/?${params.toString()}`);
    }
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <span className="text-sm sm:hidden">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-md text-left hover:bg-muted/50 transition-colors ${
                    i18n.language === language.code
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                >
                  <span className="text-base sm:text-lg">{language.flag}</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {language.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
