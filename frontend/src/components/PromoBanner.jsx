import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";

export default function PromoBanner() {
    const { t } = useLang();
    return (
        <div className="promo-banner" data-testid="promo-banner">
            <span className="hidden sm:inline-flex items-center gap-2 text-canvas/95">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cobalt-soft" />
                {t.promo}
            </span>
            <span className="sm:hidden">{t.promo}</span>
            <Link
                to="/contact"
                className="inline-flex items-center gap-1 text-canvas font-bold underline decoration-canvas/40 underline-offset-4 hover:decoration-canvas"
                data-testid="promo-banner-cta"
            >
                {t.promoCta} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
