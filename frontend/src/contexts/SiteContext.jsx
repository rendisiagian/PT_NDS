import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const SiteContext = createContext(null);

const DEFAULT_STATE = { settings: {}, collections: {} };

export function SiteProvider({ children }) {
    const [state, setState] = useState(DEFAULT_STATE);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/site/all");
            setState({
                settings: data?.settings || {},
                collections: data?.collections || {},
            });
        } catch (err) {
            // keep defaults on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <SiteContext.Provider value={{ ...state, loading, refresh }}>
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    const ctx = useContext(SiteContext);
    if (!ctx) throw new Error("useSite must be used inside SiteProvider");
    return ctx;
}

/**
 * Convenience helpers for reading bilingual/translated values.
 * - getText(settings, "hero_title", lang, fallback)
 * - getValue(settings, "contact_email", fallback) -> raw value
 * - getList(settings, "mission_id", fallback) -> array
 * - getImage(settings, "hero_image", fallback) -> URL string
 */
export function getText(settings, key, lang, fallback = "") {
    const v = settings?.[key];
    if (!v) return fallback;
    if (typeof v === "string") return v;
    if (v[lang]) return v[lang];
    if (v.value != null) return String(v.value);
    if (v.id) return v.id;
    return fallback;
}

export function getValue(settings, key, fallback = "") {
    const v = settings?.[key];
    if (!v) return fallback;
    if (typeof v === "string") return v;
    if (v.value != null) return v.value;
    return fallback;
}

export function getList(settings, key, fallback = []) {
    const v = settings?.[key];
    if (!v) return fallback;
    if (Array.isArray(v)) return v;
    if (Array.isArray(v.value)) return v.value;
    return fallback;
}

export function getImage(settings, key, fallback = "") {
    const v = settings?.[key];
    if (!v) return fallback;
    if (typeof v === "string") return v;
    if (v.url) return v.url;
    if (v.value) return String(v.value);
    return fallback;
}

/** Resolve potentially-bilingual field on a collection item ({title_id, title_en} -> lang-aware) */
export function pickLang(item, base, lang, fallback = "") {
    if (!item) return fallback;
    const k = `${base}_${lang}`;
    if (item[k]) return item[k];
    if (item[`${base}_id`]) return item[`${base}_id`];
    if (item[base]) return item[base];
    return fallback;
}
