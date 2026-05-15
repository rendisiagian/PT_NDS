import React from "react";
import { Link } from "react-router-dom";
import { Quote, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";

export default function AboutPage() {
    const { t } = useLang();
    const a = t.about;
    return (
        <main data-testid="about-page">
            <SEO title={a.eyebrow} description={a.sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{a.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="about-title">{a.title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{a.sub}</p>
            </section>

            {/* Kata Sambutan */}
            <section className="bg-surface-soft" data-testid="about-kata-sambutan">
                <div className="container-page py-section-lg grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-cobalt">CEO</p>
                        <h2 className="mt-3 text-display text-ink-deep">{a.kataSambutanTitle}</h2>
                        <div className="mt-6 card-feature">
                            <div className="w-12 h-12 rounded-pill bg-ink-deep text-canvas flex items-center justify-center mb-4">
                                <Quote className="w-5 h-5" />
                            </div>
                            <p className="text-base font-bold text-ink-deep">{a.ceo}</p>
                            <p className="text-sm text-ink-steel">{a.ceoRole}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-8 space-y-5 text-base text-ink-charcoal leading-relaxed">
                        {a.kataSambutan.map((p, i) => (
                            <p key={i} className={i === 0 ? "text-lg text-ink-deep" : ""}>{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="bg-canvas" data-testid="about-vision-mission">
                <div className="container-page py-section-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-feature">
                        <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{a.visionTitle}</p>
                        <h3 className="mt-3 text-heading-lg text-ink-deep">{a.visionTitle}</h3>
                        <p className="mt-4 text-base text-ink-charcoal leading-relaxed">{a.vision}</p>
                    </div>
                    <div className="card-feature bg-ink-deep text-canvas border-ink-deep">
                        <p className="text-xs font-bold uppercase tracking-widest text-cobalt-soft">{a.missionTitle}</p>
                        <h3 className="mt-3 text-heading-lg">{a.missionTitle}</h3>
                        <ol className="mt-4 space-y-3 list-decimal list-outside pl-5 text-canvas/90 text-base leading-relaxed">
                            {a.mission.map((m, i) => (
                                <li key={i}>{m}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-surface-soft" data-testid="about-values">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{a.valuesTitle}</h2>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {a.values.map((v, i) => (
                            <div key={i} className="card-feature" data-testid={`about-value-${i}`}>
                                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">0{i + 1}</p>
                                <h3 className="mt-3 text-xl font-bold text-ink-deep">{v.t}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{v.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-canvas">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{t.home.ctaBannerTitle}</h3>
                    <Link to="/contact" className="btn-pill-primary" data-testid="about-cta">
                        {t.home.ctaBannerBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
