import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText } from "@/contexts/SiteContext";

export default function PromoBanner() {
    const { t, lang } = useLang();
    const { settings } = useSite();
    const text = getText(settings, "promo_text", lang, t.promo);
    const cta = getText(settings, "promo_cta", lang, t.promoCta);
    return (
        <div className="promo-banner" data-testid="promo-banner">
            <span className="hidden sm:inline-flex items-center gap-2 text-canvas/95">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cobalt-soft" />
                {text}
            </span>
            <span className="sm:hidden">{text}</span>
            <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-canvas font-bold underline decoration-canvas/40 underline-offset-4 hover:decoration-canvas"
                data-testid="promo-banner-cta"
            >
                {cta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
