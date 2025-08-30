import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const LanguageSwitcher = ({
  variant = "ghost",
  size = "icon",
}: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {size === "icon" ? (
            <Globe className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{currentLanguage?.label || "Language"}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`flex items-center gap-2 ${language === lang.code ? "font-medium" : ""}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
