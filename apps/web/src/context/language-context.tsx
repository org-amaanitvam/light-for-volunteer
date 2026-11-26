
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

export type Language = "en" | "hi";

const translations = {
  en: {
    home: "Home",
    opportunities: "Opportunities",
    mentors: "Mentors",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    login: "Log in",
    joinLight: "Join Light",
    joinVolunteer: "Join as Volunteer",
    registerOrganisation: "Register Organisation",
    joinMentor: "Join as Mentor",
    findCauses: "Find causes & build verified hours",
    guideVolunteers: "Guide volunteers in community impact",
    myDashboard: "My Dashboard",
    signOut: "Sign out",
    signedInAs: "Signed in as:",
    language: "Language",
  },
  hi: {
    home: "होम",
    opportunities: "अवसर",
    mentors: "मार्गदर्शक",
    about: "हमारे बारे में",
    blog: "ब्लॉग",
    contact: "संपर्क करें",
    login: "लॉग इन",
    joinLight: "लाइट से जुड़ें",
    joinVolunteer: "स्वयंसेवक के रूप में जुड़ें",
    registerOrganisation: "संस्था पंजीकृत करें",
    joinMentor: "मार्गदर्शक के रूप में जुड़ें",
    findCauses: "अवसर खोजें और सत्यापित घंटे अर्जित करें",
    guideVolunteers: "सामुदायिक कार्यों में स्वयंसेवकों का मार्गदर्शन करें",
    myDashboard: "मेरा डैशबोर्ड",
    signOut: "लॉग आउट",
    signedInAs: "लॉग इन हैं:",
    language: "भाषा",
  },
};

type TranslationKey = keyof typeof translations.en;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "site-language";

const listeners = new Set<() => void>();

function getLanguageSnapshot(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLanguage = localStorage.getItem(STORAGE_KEY);

  return savedLanguage === "hi" ? "hi" : "en";
}

function getServerLanguageSnapshot(): Language {
  return "en";
}

function subscribeToLanguage(callback: () => void) {
  listeners.add(callback);

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function updateLanguage(nextLanguage: Language) {
  localStorage.setItem(STORAGE_KEY, nextLanguage);

  listeners.forEach((callback) => callback());
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(nextLanguage: Language) {
    updateLanguage(nextLanguage);
  }

  function t(key: TranslationKey) {
    return translations[language][key];
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
