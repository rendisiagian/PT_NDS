import React from "react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowRight, FileCheck2 } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, pickLang } from "@/contexts/SiteContext";

export default function ServicesPage() {
    const { t, lang } = useLang();
    const s = t.services;
    const { settings, collections } = useSite();

    const title = getText(settings, "services_title", lang, s.title);
    const sub = getText(settings, "services_sub", lang, s.sub);
    const services = collections.services?.length ? collections.services : s.list.map((i, idx) => ({ id: idx, title_id: i.t, title_en: i.t, desc_id: i.d, desc_en: i.d, icon: "FileCheck2" }));
    const steps = collections.process_steps?.length ? collections.process_steps : s.steps.map((i, idx) => ({ id: idx, title_id: i.t, title_en: i.t, desc_id: i.d, desc_en: i.d }));
    const ctaTitle = getText(settings, "cta_banner_title", lang, t.home.ctaBannerTitle);
    const ctaBtn = getText(settings, "cta_banner_btn", lang, t.home.ctaBannerBtn);

    return (
        <main data-testid="services-page">
            <SEO title={s.eyebrow} description={sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{s.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="services-title">{title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{sub}</p>
            </section>

            <section className="bg-surface-soft" data-testid="services-grid">
                <div className="container-page py-section-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((item, i) => {
                            const Icon = (item.icon && LucideIcons[item.icon]) || FileCheck2;
                            return (
                                <div key={item.id || i} className="card-feature group hover:border-ink-deep transition-colors" data-testid={`service-card-${i}`}>
                                    <div className="w-11 h-11 rounded-pill border border-hairline flex items-center justify-center mb-5 text-cobalt group-hover:bg-cobalt group-hover:text-canvas group-hover:border-cobalt transition-colors">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-ink-deep">{pickLang(item, "title", lang)}</h3>
                                    <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{pickLang(item, "desc", lang)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="bg-canvas" data-testid="services-process">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{s.processTitle}</h2>
                    <ol className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-5">
                        {steps.map((step, i) => (
                            <li key={step.id || i} className="card-feature relative" data-testid={`process-step-${i}`}>
                                <span className="absolute -top-3 left-6 inline-block rounded-pill bg-ink-deep text-canvas text-[11px] font-bold uppercase tracking-widest px-3 py-1">
                                    Step {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="mt-3 text-base font-bold text-ink-deep">{pickLang(step, "title", lang)}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{pickLang(step, "desc", lang)}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="bg-surface-soft">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{ctaTitle}</h3>
                    <Link to="/contact" className="btn-pill-cta" data-testid="services-cta">
                        {ctaBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
