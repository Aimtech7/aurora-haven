import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "en" | "sw";

interface Translation {
  key: string;
  en: string;
  sw: string;
  category: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translations: Translation[];
  loading: boolean;
  refreshTranslations: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "en" || saved === "sw") ? saved : "en";
  });
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTranslations = async () => {
    try {
      const { data, error } = await supabase
        .from("translations")
        .select("*")
        .order("key");

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error("Error loading translations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranslations();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, fallback?: string): string => {
    const translation = translations.find((t) => t.key === key);
    if (translation) {
      return translation[language] || translation.en || fallback || key;
    }
    return fallback || key;
  };

  const refreshTranslations = async () => {
    await loadTranslations();
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, translations, loading, refreshTranslations }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
