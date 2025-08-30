import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const ForgotPasswordPage = () => {
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 flex flex-col">
      <header className="py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            {t("app.name")}
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-sm text-muted-foreground dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <p>{t("footer.copyright")}</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
