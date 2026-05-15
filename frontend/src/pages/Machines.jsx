import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";

export default function MachinesPage() {
    const { t } = useLang();
    const m = t.machines;
    return (
        <main data-testid="machines-page">
            <SEO title={m.eyebrow} description={m.sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{m.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="machines-title">{m.title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{m.sub}</p>
            </section>

            <section className="bg-canvas" data-testid="machines-list">
                <div className="container-page pb-section-lg space-y-12">
                    {m.list.map((machine, i) => (
                        <article
                            key={i}
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
                            data-testid={`machine-card-${i}`}
                        >
                            <div className="lg:col-span-7 [direction:ltr]">
                                <div className="card-feature-photo aspect-[5/3]">
                                    <img src={machine.img} alt={machine.t} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                            </div>
                            <div className="lg:col-span-5 [direction:ltr]">
                                <span className="inline-block rounded-pill bg-ink-deep text-canvas text-[11px] font-bold uppercase tracking-widest px-3 py-1">
                                    {machine.badge}
                                </span>
                                <h2 className="mt-5 text-heading-lg text-ink-deep">{machine.t}</h2>
                                <p className="mt-4 text-base text-ink-charcoal leading-relaxed">{machine.d}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Specs Table */}
            <section className="bg-surface-soft" data-testid="machines-specs">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{m.specsTitle}</h2>
                    <div className="mt-8 card-feature p-0 overflow-hidden">
                        <dl className="divide-y divide-hairline-soft">
                            {m.specs.map((s, i) => (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 py-4" data-testid={`spec-row-${i}`}>
                                    <dt className="text-sm font-bold text-ink-deep">{s.k}</dt>
                                    <dd className="sm:col-span-2 text-sm text-ink-charcoal">{s.v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            <section className="bg-canvas">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{t.home.ctaBannerTitle}</h3>
                    <Link to="/contact" className="btn-pill-primary" data-testid="machines-cta">
                        {t.home.ctaBannerBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
