import React, { useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";

/**
 * SEO helper. Sets document.title, meta description, OG tags, and JSON-LD.
 * Simple alternative to react-helmet for our needs.
 */
export default function SEO({ title, description, path = "" }) {
    const { lang, t } = useLang();
    const fullTitle = title ? `${title} — PT. NURI DWI SUKSES` : t.meta.title;
    const desc = description || t.meta.description;
    const url = typeof window !== "undefined" ? `${window.location.origin}${path || window.location.pathname}` : "";

    useEffect(() => {
        document.title = fullTitle;
        setMeta("description", desc);
        setMeta("og:title", fullTitle, "property");
        setMeta("og:description", desc, "property");
        setMeta("og:type", "website", "property");
        setMeta("og:url", url, "property");
        setMeta("og:site_name", "PT. NURI DWI SUKSES", "property");
        setMeta("twitter:card", "summary_large_image");
        setMeta("twitter:title", fullTitle);
        setMeta("twitter:description", desc);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = url;

        // Organization JSON-LD (once)
        let ld = document.getElementById("nds-org-jsonld");
        if (!ld) {
            ld = document.createElement("script");
            ld.type = "application/ld+json";
            ld.id = "nds-org-jsonld";
            document.head.appendChild(ld);
        }
        ld.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PT. NURI DWI SUKSES",
            url: typeof window !== "undefined" ? window.location.origin : "",
            email: "nuridwisukses07@gmail.com",
            address: {
                "@type": "PostalAddress",
                streetAddress: "Jalan Rawa Indah No.12 Rt 04/03 Kel. Suka Asih",
                addressLocality: "Kec. Pasar Kemis, Kab. Tangerang",
                addressRegion: "Banten",
                postalCode: "15560",
                addressCountry: "ID",
            },
            foundingDate: "2023-05-22",
            description: desc,
            inLanguage: lang === "id" ? "id-ID" : "en-US",
        });
    }, [fullTitle, desc, url, lang]);

    return null;
}

function setMeta(name, content, attr = "name") {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}
