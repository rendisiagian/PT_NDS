import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileCheck2, Droplets, Beaker, Layers3, Truck, Search } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";

const ICONS = [FileCheck2, Droplets, Beaker, Layers3, Truck, Search];

export default function ServicesPage() {
    const { t } = useLang();
    const s = t.services;
    return (
        <main data-testid="services-page">
            <SEO title={s.eyebrow} description={s.sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{s.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="services-title">{s.title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{s.sub}</p>
            </section>

            {/* Service grid */}
            <section className="bg-surface-soft" data-testid="services-grid">
                <div className="container-page py-section-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {s.list.map((item, i) => {
                            const Icon = ICONS[i % ICONS.length];
                            return (
                                <div key={i} className="card-feature group hover:border-ink-deep transition-colors" data-testid={`service-card-${i}`}>
                                    <div className="w-11 h-11 rounded-pill border border-hairline flex items-center justify-center mb-5 text-cobalt group-hover:bg-cobalt group-hover:text-canvas group-hover:border-cobalt transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-ink-deep">{item.t}</h3>
                                    <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{item.d}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="bg-canvas" data-testid="services-process">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{s.processTitle}</h2>
                    <ol className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-5">
                        {s.steps.map((step, i) => (
                            <li key={i} className="card-feature relative" data-testid={`process-step-${i}`}>
                                <span className="absolute -top-3 left-6 inline-block rounded-pill bg-ink-deep text-canvas text-[11px] font-bold uppercase tracking-widest px-3 py-1">
                                    Step {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-3 text-base font-bold text-ink-deep">{step.t}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{step.d}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-surface-soft">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{t.home.ctaBannerTitle}</h3>
                    <Link to="/contact" className="btn-pill-cta" data-testid="services-cta">
                        {t.home.ctaBannerBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
