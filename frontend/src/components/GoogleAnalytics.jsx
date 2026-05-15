import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Google Analytics 4 loader + SPA pageview tracker.
 *
 * Activates only if REACT_APP_GA_MEASUREMENT_ID is set (format: G-XXXXXXXXXX).
 * Tracks initial load and every client-side route change.
 */
const GA_ID = (process.env.REACT_APP_GA_MEASUREMENT_ID || "").trim();
const ENABLED = /^G-[A-Z0-9]+$/i.test(GA_ID);

function injectGtag() {
    if (typeof window === "undefined" || window.__nds_ga_loaded) return;
    window.__nds_ga_loaded = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    // send_page_view: false — we send pageviews manually on each route change
    gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
}

export default function GoogleAnalytics() {
    const location = useLocation();
    const sentInitial = useRef(false);

    useEffect(() => {
        if (!ENABLED) return;
        injectGtag();
        const fire = () => {
            if (typeof window.gtag === "function") {
                window.gtag("event", "page_view", {
                    page_path: location.pathname + location.search,
                    page_location: window.location.href,
                    page_title: document.title,
                });
            }
        };
        // Slight delay to let SEO component update document.title first
        const t = setTimeout(fire, 80);
        sentInitial.current = true;
        return () => clearTimeout(t);
    }, [location.pathname, location.search]);

    return null;
}
