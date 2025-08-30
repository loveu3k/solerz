// src/pages/LoginPage.tsx (unchanged)
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const LoginPage = () => {
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (location.state?.message) {
      toast({
        title: "Success",
        description: location.state.message,
      });
    }
  }, [location.state, toast]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 text-foreground dark:text-gray-200 flex flex-col">
      <header className="py-4 px-6 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
            alt="Solerz Logo"
            className="w-100 h-7 object-contain"
          />
        </Link>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-300"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-sm text-muted-foreground dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <p>{t("footer.copyright")}</p>
      </footer>
    </div>
  );
};

export default LoginPage;
