import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, pickLang } from "@/contexts/SiteContext";
import { resolveMediaUrl } from "@/lib/media";

export default function MachinesPage() {
    const { t, lang } = useLang();
    const m = t.machines;
    const { settings, collections } = useSite();

    const title = getText(settings, "machines_title", lang, m.title);
    const sub = getText(settings, "machines_sub", lang, m.sub);
    const machines = collections.machines?.length ? collections.machines : m.list.map((i, idx) => ({ id: idx, badge_id: i.badge, badge_en: i.badge, title_id: i.t, title_en: i.t, desc_id: i.d, desc_en: i.d, image: i.img }));
    const specs = collections.machine_specs?.length ? collections.machine_specs : m.specs.map((s, idx) => ({ id: idx, key_id: s.k, key_en: s.k, value_id: s.v, value_en: s.v }));
    const ctaTitle = getText(settings, "cta_banner_title", lang, t.home.ctaBannerTitle);
    const ctaBtn = getText(settings, "cta_banner_btn", lang, t.home.ctaBannerBtn);

    return (
        <main data-testid="machines-page">
            <SEO title={m.eyebrow} description={sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{m.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="machines-title">{title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{sub}</p>
            </section>

            <section className="bg-canvas" data-testid="machines-list">
                <div className="container-page pb-section-lg space-y-12">
                    {machines.map((machine, i) => (
                        <article
                            key={machine.id || i}
                            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}
                            data-testid={`machine-card-${i}`}
                        >
                            <div className="lg:col-span-7 [direction:ltr]">
                                <div className="card-feature-photo aspect-[5/3]">
                                    <img
                                        src={resolveMediaUrl(machine.image) || machine.img}
                                        alt={pickLang(machine, "title", lang)}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            <div className="lg:col-span-5 [direction:ltr]">
                                <span className="inline-block rounded-pill bg-ink-deep text-canvas text-[11px] font-bold uppercase tracking-widest px-3 py-1">
                                    {pickLang(machine, "badge", lang)}
                                </span>
                                <h2 className="mt-5 text-heading-lg text-ink-deep">{pickLang(machine, "title", lang)}</h2>
                                <p className="mt-4 text-base text-ink-charcoal leading-relaxed">{pickLang(machine, "desc", lang)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bg-sky-soft" data-testid="machines-specs">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{m.specsTitle}</h2>
                    <div className="mt-8 card-feature p-0 overflow-hidden">
                        <dl className="divide-y divide-hairline-soft">
                            {specs.map((s, i) => (
                                <div key={s.id || i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 py-4" data-testid={`spec-row-${i}`}>
                                    <dt className="text-sm font-bold text-ink-deep">{pickLang(s, "key", lang)}</dt>
                                    <dd className="sm:col-span-2 text-sm text-ink-charcoal">{pickLang(s, "value", lang)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            <section className="bg-canvas">
                <div className="container-page py-section-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <h3 className="text-heading-lg text-ink-deep max-w-2xl">{ctaTitle}</h3>
                    <Link to="/contact" className="btn-pill-primary" data-testid="machines-cta">
                        {ctaBtn} <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
