import React from "react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SEO from "@/components/SEO";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, getImage, pickLang } from "@/contexts/SiteContext";
import { resolveMediaUrl } from "@/lib/media";

const HERO_FALLBACK =
    "https://images.unsplash.com/photo-1601225998165-1be25cfd5d97?auto=format&fit=crop&w=2000&q=85";
const MACHINE_IMG_1 =
    "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&w=1600&q=85";
const MACHINE_IMG_2 =
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=85";

export default function HomePage() {
    const { t, lang } = useLang();
    const h = t.home;
    const { settings, collections } = useSite();

    const heroImage = resolveMediaUrl(getImage(settings, "hero_image", HERO_FALLBACK));
    const services = collections.services || [];
    const machines = collections.machines || [];

    return (
        <main data-testid="home-page">
            <SEO />
            {/* HERO */}
            <section className="relative" data-testid="home-hero">
                <div className="container-page pt-12 lg:pt-20 pb-section">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        <div className="lg:col-span-7 animate-fade-up">
                            <span
                                className="inline-flex items-center gap-2 rounded-pill border border-hairline px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink-charcoal"
                                data-testid="home-badge"
                            >
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cobalt" />
                                {getText(settings, "hero_badge", lang, h.badge)}
                            </span>
                            <h1 className="mt-5 text-hero text-ink-deep" data-testid="home-hero-title">
                                {getText(settings, "hero_title", lang, h.heroTitle)}
                            </h1>
                            <p className="mt-6 max-w-xl text-base sm:text-lg text-ink-charcoal leading-relaxed">
                                {getText(settings, "hero_sub", lang, h.heroSub)}
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/contact" className="btn-pill-primary" data-testid="home-cta-primary">
                                    {h.ctaPrimary} <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                                <Link to="/services" className="btn-pill-secondary" data-testid="home-cta-secondary">
                                    {h.ctaSecondary}
                                </Link>
                            </div>
                            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl" data-testid="home-stats">
                                <StatBox value="3+" label={h.statYears} />
                                <StatBox value={String(machines.length || 3)} label={h.statMachines} />
                                <StatBox value="100%" label={h.statQuality} />
                                <StatBox value="24/7" label={h.statCommit} />
                            </dl>
                        </div>
                        <div className="lg:col-span-5 relative" data-testid="home-hero-photo">
                            <div className="card-feature-photo aspect-[4/5] animate-fade-up">
                                <img
                                    src={heroImage}
                                    alt="Polymer plate printing — PT. NURI DWI SUKSES"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-canvas">
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">CRON HDI-920 S+</p>
                                    <p className="text-lg font-bold mt-1">Computer-to-Plate Imaging</p>
                                </div>
                            </div>
                            <div
                                className="hidden lg:block absolute -bottom-6 -left-6 card-feature w-64 shadow-[rgba(20,22,26,0.18)_0px_8px_24px_0px]"
                                data-testid="home-floating-card"
                            >
                                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">Quality first</p>
                                <p className="mt-2 text-sm text-ink-deep font-bold">
                                    {lang === "id"
                                        ? "Konsistensi titik raster di seluruh plat — produksi yang dapat Anda andalkan."
                                        : "Consistent dot sharpness across every plate — production you can rely on."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services teaser */}
            <section className="bg-surface-soft" data-testid="home-services">
                <div className="container-page py-section-lg">
                    <SectionHeader
                        eyebrow={h.sectionServicesEyebrow}
                        title={h.sectionServicesTitle}
                        sub={h.sectionServicesSub}
                    />
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(services.length ? services : t.services.list).slice(0, 6).map((s, i) => {
                            const title = pickLang(s, "title", lang, s.t);
                            const desc = pickLang(s, "desc", lang, s.d);
                            const IconCmp = (s.icon && LucideIcons[s.icon]) || CheckCircle2;
                            return (
                                <div
                                    key={s.id || i}
                                    className="card-feature group hover:border-ink-deep transition-colors"
                                    data-testid={`home-service-card-${i}`}
                                >
                                    <div className="flex items-center justify-center w-10 h-10 rounded-pill bg-ink-deep text-canvas mb-5">
                                        <IconCmp className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-ink-deep">{title}</h3>
                                    <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{desc}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Link to="/services" className="btn-pill-ghost" data-testid="home-services-all">
                            {t.nav.services} <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Machines showcase */}
            <section className="bg-canvas" data-testid="home-machines">
                <div className="container-page py-section-lg">
                    <SectionHeader
                        eyebrow={h.sectionMachinesEyebrow}
                        title={h.sectionMachinesTitle}
                        sub={h.sectionMachinesSub}
                    />
                    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {machines.length ? (
                            machines.slice(0, 2).map((m, i) => (
                                <PhotoCard
                                    key={m.id}
                                    img={resolveMediaUrl(m.image) || (i === 0 ? MACHINE_IMG_1 : MACHINE_IMG_2)}
                                    badge={pickLang(m, "badge", lang)}
                                    title={pickLang(m, "title", lang)}
                                    body={pickLang(m, "desc", lang)}
                                />
                            ))
                        ) : (
                            <>
                                <PhotoCard img={MACHINE_IMG_1} badge="CTP" title="CRON HDI-920 S+" body="Laser imaging direct-to-plate untuk resolusi tinggi dan registrasi yang akurat." />
                                <PhotoCard img={MACHINE_IMG_2} badge="Waterwash" title="Pencucian berbasis air" body="Permukaan plat bersih, konsisten, dengan proses ramah lingkungan." />
                            </>
                        )}
                    </div>
                    <div className="mt-10 flex justify-center">
                        <Link to="/machines" className="btn-pill-ghost" data-testid="home-machines-all">
                            {t.nav.machines} <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why us — keeps static (rarely changed) */}
            <section className="bg-surface-soft" data-testid="home-why">
                <div className="container-page py-section-lg">
                    <h2 className="text-display text-ink-deep max-w-2xl">{h.sectionWhyTitle}</h2>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { t: h.why1Title, b: h.why1Body, Icon: LucideIcons.Sparkles },
                            { t: h.why2Title, b: h.why2Body, Icon: LucideIcons.Truck },
                            { t: h.why3Title, b: h.why3Body, Icon: LucideIcons.Leaf },
                            { t: h.why4Title, b: h.why4Body, Icon: LucideIcons.Headphones },
                        ].map((w, i) => (
                            <div key={i} className="card-feature" data-testid={`home-why-card-${i}`}>
                                <div className="w-10 h-10 rounded-pill border border-hairline flex items-center justify-center mb-5 text-cobalt">
                                    <w.Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-ink-deep">{w.t}</h3>
                                <p className="mt-2 text-sm text-ink-charcoal leading-relaxed">{w.b}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="bg-canvas" data-testid="home-cta-banner">
                <div className="container-page py-section-lg">
                    <div className="rounded-4xl bg-ink-deep text-canvas p-10 sm:p-section relative overflow-hidden">
                        <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-cobalt/30 blur-3xl" />
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-display">{getText(settings, "cta_banner_title", lang, h.ctaBannerTitle)}</h2>
                                <p className="mt-4 max-w-md text-canvas/80 text-base leading-relaxed">
                                    {getText(settings, "cta_banner_body", lang, h.ctaBannerBody)}
                                </p>
                            </div>
                            <div className="md:justify-self-end">
                                <Link to="/contact" className="btn-pill-cta" data-testid="home-cta-banner-btn">
                                    {getText(settings, "cta_banner_btn", lang, h.ctaBannerBtn)} <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

function StatBox({ value, label }) {
    return (
        <div data-testid="home-stat-item">
            <dt className="text-2xl sm:text-3xl font-extrabold text-ink-deep tracking-tight">{value}</dt>
            <dd className="text-xs font-bold uppercase tracking-widest text-ink-stone mt-1">{label}</dd>
        </div>
    );
}

function SectionHeader({ eyebrow, title, sub }) {
    return (
        <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{eyebrow}</p>
            <h2 className="mt-3 text-display text-ink-deep">{title}</h2>
            {sub ? <p className="mt-4 text-base sm:text-lg text-ink-charcoal leading-relaxed">{sub}</p> : null}
        </div>
    );
}

function PhotoCard({ img, badge, title, body }) {
    return (
        <div className="card-feature-photo aspect-[5/4] group">
            <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/70 via-ink-deep/10 to-transparent" />
            <div className="absolute top-5 left-5">
                <span className="inline-block rounded-pill bg-canvas text-ink-deep text-[11px] font-bold uppercase tracking-widest px-3 py-1">
                    {badge}
                </span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 text-canvas">
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-sm text-canvas/85 max-w-md">{body}</p>
            </div>
        </div>
    );
}
