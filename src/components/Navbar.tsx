import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

// Define the component's props interface (it's empty for now but good for future additions)
interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    if (user) {
      await signOut();
      navigate("/login");
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-300",
        isScrolled
          ? "shadow-md py-2 rounded-b-xl"
          : "py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 relative z-50"
        >
          <img
            src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"}
            alt="Solerz Logo"
            className="w-[100px] h-7 object-contain"
          />
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  to="/how-it-works"
                  className="text-sm font-medium px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  {t("nav.howItWorks")}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/pricing"
                  className="text-sm font-medium px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  {t("nav.pricing")}
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link
                  to="/about-us"
                  className="text-sm font-medium px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  About
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/contact-us"
                  className="text-sm font-medium px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Icons and Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800">
              {user ? (
                <>
                  <DropdownMenuLabel className="text-gray-900 dark:text-gray-100 truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full text-gray-700 dark:text-gray-300 cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 dark:text-red-400 cursor-pointer">
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="w-full text-gray-700 dark:text-gray-300 cursor-pointer">
                      {t("nav.login")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register" className="w-full text-gray-700 dark:text-gray-300 cursor-pointer">
                      {t("nav.register")}
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full text-gray-700 dark:text-gray-300"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 border-t border-gray-100 dark:border-gray-800 py-4 px-4 shadow-lg">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/how-it-works"
              className="text-base font-medium block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={toggleMobileMenu}
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              to="/pricing"
              className="text-base font-medium block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={toggleMobileMenu}
            >
              {t("nav.pricing")}
            </Link>
            <Link
              to="/how-it-works"
              className="text-base font-medium block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={toggleMobileMenu}
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              to="/about-us"
              className="text-base font-medium block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={toggleMobileMenu}
            >
              About
            </Link>
            <Link
              to="/contact-us"
              className="text-base font-medium block py-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
