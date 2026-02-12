"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark";
type Language = "en" | "bn";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  copy: Record<string, string>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LanguageContext = createContext<LanguageContextValue | null>(null);

const copyMap: Record<Language, Record<string, string>> = {
  en: {
    brandTagline: "Local bazar, smarter shopping.",
    explore: "Explore",
    sellers: "Sellers",
    products: "Products",
    support: "Support",
    login: "Login",
    signup: "Sign Up",
    heroTitle: "Find trusted sellers, fresh items, and daily deals.",
    heroSubtitle:
      "Choose your location, compare sellers, and order in minutes with flexible payment options.",
    heroCta: "Browse bazaars",
    heroAlt: "Become a seller",
    locationTitle: "Set your local market",
    locationSubtitle:
      "Pick division, district, and area to unlock nearby sellers and live inventory.",
    featuredBazaars: "Featured bazaars",
    featuredSellers: "Top sellers",
    featuredProducts: "Recent products",
    footerNote: "Built for local sellers, loved by local shoppers.",
  },
  bn: {
    brandTagline: "স্থানীয় বাজার, স্মার্ট কেনাকাটা।",
    explore: "অন্বেষণ",
    sellers: "বিক্রেতা",
    products: "পণ্য",
    support: "সাপোর্ট",
    login: "লগইন",
    signup: "সাইন আপ",
    heroTitle: "বিশ্বস্ত বিক্রেতা, টাটকা পণ্য, এবং দৈনিক অফার খুঁজুন।",
    heroSubtitle:
      "লোকেশন নির্বাচন করুন, বিক্রেতা তুলনা করুন, এবং সহজ পেমেন্টে অর্ডার করুন।",
    heroCta: "বাজার দেখুন",
    heroAlt: "বিক্রেতা হোন",
    locationTitle: "আপনার বাজার ঠিক করুন",
    locationSubtitle:
      "ডিভিশন, জেলা, এবং এলাকা বাছাই করলে নিকটবর্তী বিক্রেতা দেখা যাবে।",
    featuredBazaars: "জনপ্রিয় বাজার",
    featuredSellers: "সেরা বিক্রেতা",
    featuredProducts: "নতুন পণ্য",
    footerNote: "স্থানীয় বিক্রেতা ও ক্রেতাদের জন্য নির্মিত।",
  },
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within AppProviders");
  }
  return context;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within AppProviders");
  }
  return context;
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("bazar_theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("bazar_theme", theme);
  }, [theme]);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("bazar_language");
    if (storedLanguage === "en" || storedLanguage === "bn") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bazar_language", language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const copy = useMemo(() => copyMap[language], [language]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <LanguageContext.Provider value={{ language, setLanguage, copy }}>
        {children}
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
