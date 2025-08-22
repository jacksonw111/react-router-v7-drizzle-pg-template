import type { User } from "better-auth";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { LanguageSwitcher } from "~/components/language-switcher";
import { ThemeToggle } from "~/components/theme-toggle";
import { UserMenu } from "~/components/user-menu";

interface HeaderProps {
  user?: User | null;
  isVisible?: boolean;
}

export function Header({ user, isVisible = true }: HeaderProps) {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  console.log(user);
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        // 在顶部时始终显示
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 向下滚动时隐藏
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // 向上滚动时显示
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  // 当点击回到顶部时，强制显示header
  useEffect(() => {
    if (isVisible) {
      setHeaderVisible(true);
    }
  }, [isVisible]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: headerVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 sm:p-4"
    >
      <header className="w-full max-w-4xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border rounded-xl sm:rounded-2xl shadow-lg">
        <div className="flex h-10 sm:h-12 items-center justify-between px-3 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md flex items-center justify-center">
                <span className="font-bold text-sm">Tsle</span>
              </div>
              <span className="font-semibold text-sm sm:text-base hidden sm:inline"></span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

          
            <UserMenu user={user} />
          </div>
        </div>
      </header>
    </motion.div>
  );
}
