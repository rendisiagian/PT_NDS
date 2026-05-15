import React from "react";
import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, pickLang } from "@/contexts/SiteContext";

export default function PortfolioPage() {
    const { t, lang } = useLang();
    const p = t.portfolio;
    const { settings, collections } = useSite();

    const title = getText(settings, "portfolio_title", lang, p.title);
    const sub = getText(settings, "portfolio_sub", lang, p.sub);
    const sectors = collections.portfolio_sectors?.length ? collections.portfolio_sectors : p.sectors.map((s, i) => ({ id: i, title_id: s.t, title_en: s.t, desc_id: s.d, desc_en: s.d }));
    const testimonials = collections.testimonials?.length ? collections.testimonials : p.testimonials.map((tm, i) => ({ id: i, quote_id: tm.q, quote_en: tm.q, name: tm.n, role_id: tm.r, role_en: tm.r }));
    const ctaTitle = getText(settings, "cta_banner_title", lang, t.home.ctaBannerTitle);
    const ctaBtn = getText(settings, "cta_banner_btn", lang, t.home.ctaBannerBtn);

    return (
        <main data-testid="portfolio-page">
            <SEO title={p.eyebrow} description={sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{p.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="portfolio-title">{title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{sub}</p>
            </section>

            <section className="bg-surface-soft" data-testid="portfolio-sectors">
                <div className="container-page py-section-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectors.map((sector, i) => (
                            <div key={sector.id || i} className="card-feature relative overflow-hidden" data-testid={`portfolio-card-${i}`}>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-cobalt">
                                    Sector {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-3 text-xl font-bold text-ink-deep">{pickLang(sector, "title", lang)}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{pickLang(sector, "desc", lang)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-canvas" data-testid="portfolio-testimonials">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{p.testimonialTitle}</h2>
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {testimonials.map((tm, i) => (
                            <figure key={tm.id || i} className="card-feature" data-testid={`testimonial-${i}`}>
                                <Quote className="w-8 h-8 text-cobalt" />
                                <blockquote className="mt-4 text-lg text-ink-deep leading-relaxed font-semibold">
                                    "{pickLang(tm, "quote", lang)}"
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-pill bg-surface-soft border border-hairline flex items-center justify-center text-sm font-bold text-ink-deep">
                                        {(tm.name || "").split(" ").map((x) => x[0]).join("").slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-ink-deep">{tm.name}</div>
                                        <div className="text-xs text-ink-steel">{pickLang(tm, "role", lang)}</div>
                                    </div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-surface-soft">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{ctaTitle}</h3>
                    <Link to="/contact" className="btn-pill-primary" data-testid="portfolio-cta">
                        {ctaBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
