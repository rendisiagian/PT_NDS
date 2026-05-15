import React, { createContext, useContext, useEffect, useState } from "react";
import translations from "@/lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("nds_lang") : null;
        if (saved === "en" || saved === "id") return saved;
        if (typeof navigator !== "undefined" && navigator.language && navigator.language.toLowerCase().startsWith("id")) return "id";
        return "id";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("nds_lang", lang);
            document.documentElement.lang = lang;
        }
    }, [lang]);

    const value = {
        lang,
        setLang,
        toggle: () => setLang((l) => (l === "id" ? "en" : "id")),
        t: translations[lang],
    };

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
    return ctx;
}
