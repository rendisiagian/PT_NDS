import React from "react";
import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";

export default function PortfolioPage() {
    const { t } = useLang();
    const p = t.portfolio;
    return (
        <main data-testid="portfolio-page">
            <SEO title={p.eyebrow} description={p.sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{p.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="portfolio-title">{p.title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{p.sub}</p>
            </section>

            <section className="bg-surface-soft" data-testid="portfolio-sectors">
                <div className="container-page py-section-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {p.sectors.map((sector, i) => (
                            <div key={i} className="card-feature relative overflow-hidden" data-testid={`portfolio-card-${i}`}>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-cobalt">
                                    Sector {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-3 text-xl font-bold text-ink-deep">{sector.t}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{sector.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-canvas" data-testid="portfolio-testimonials">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{p.testimonialTitle}</h2>
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {p.testimonials.map((t2, i) => (
                            <figure key={i} className="card-feature" data-testid={`testimonial-${i}`}>
                                <Quote className="w-8 h-8 text-cobalt" />
                                <blockquote className="mt-4 text-lg text-ink-deep leading-relaxed font-semibold">
                                    "{t2.q}"
                                </blockquote>
                                <figcaption className="mt-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-pill bg-surface-soft border border-hairline flex items-center justify-center text-sm font-bold text-ink-deep">
                                        {t2.n.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-ink-deep">{t2.n}</div>
                                        <div className="text-xs text-ink-steel">{t2.r}</div>
                                    </div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-surface-soft">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{t.home.ctaBannerTitle}</h3>
                    <Link to="/contact" className="btn-pill-primary" data-testid="portfolio-cta">
                        {t.home.ctaBannerBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
