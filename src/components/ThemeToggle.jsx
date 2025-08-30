import React from "react";
import { useTheme } from "../contexts/ThemeContext"; // Assuming ThemeContext is exported correctly
import { Sun, Moon } from "lucide-react"; // Icons for light/dark mode
import { Button } from "./ui/button"; // Assuming you have a Button component

const ThemeToggle = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
