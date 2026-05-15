import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Globe } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/contexts/LanguageContext";

const ROUTES = [
    { to: "/", key: "home" },
    { to: "/about", key: "about" },
    { to: "/services", key: "services" },
    { to: "/machines", key: "machines" },
    { to: "/portfolio", key: "portfolio" },
    { to: "/blog", key: "blog" },
    { to: "/contact", key: "contact" },
];

export default function Navbar() {
    const { t, lang, toggle } = useLang();
    const [open, setOpen] = useState(false);
    const location = useLocation();

    return (
        <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft" data-testid="navbar">
            <div className="container-page flex items-center justify-between h-16">
                <Link to="/" className="flex items-center" data-testid="navbar-logo-link" onClick={() => setOpen(false)}>
                    <Logo size={36} withWordmark />
                </Link>

                {/* Desktop pill nav */}
                <nav className="hidden lg:flex items-center gap-2" data-testid="navbar-desktop">
                    {ROUTES.map((r) => (
                        <NavLink
                            key={r.to}
                            to={r.to}
                            end={r.to === "/"}
                            data-testid={`nav-${r.key}`}
                            className={({ isActive }) =>
                                isActive || (r.to !== "/" && location.pathname.startsWith(r.to))
                                    ? "pill-tab-active"
                                    : "pill-tab"
                            }
                        >
                            {t.nav[r.key]}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggle}
                        className="hidden sm:inline-flex items-center gap-1 rounded-pill border border-hairline px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink-deep transition-colors"
                        data-testid="lang-toggle"
                        aria-label="Toggle language"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {lang === "id" ? "ID" : "EN"}
                    </button>
                    <Link to="/contact" className="hidden md:inline-flex btn-pill-primary" data-testid="navbar-cta">
                        {t.nav.getQuote}
                    </Link>
                    <button
                        className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-pill border border-hairline"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        data-testid="navbar-mobile-toggle"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="lg:hidden border-t border-hairline-soft bg-canvas" data-testid="navbar-mobile-menu">
                    <div className="container-page py-4 flex flex-col gap-2">
                        {ROUTES.map((r) => (
                            <NavLink
                                key={r.to}
                                to={r.to}
                                end={r.to === "/"}
                                onClick={() => setOpen(false)}
                                data-testid={`mobile-nav-${r.key}`}
                                className={({ isActive }) =>
                                    isActive
                                        ? "pill-tab-active w-fit"
                                        : "pill-tab w-fit"
                                }
                            >
                                {t.nav[r.key]}
                            </NavLink>
                        ))}
                        <div className="flex items-center gap-2 pt-3">
                            <button
                                onClick={toggle}
                                className="inline-flex items-center gap-1 rounded-pill border border-hairline px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink"
                                data-testid="mobile-lang-toggle"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                {lang === "id" ? "ID" : "EN"}
                            </button>
                            <Link to="/contact" onClick={() => setOpen(false)} className="btn-pill-primary" data-testid="mobile-navbar-cta">
                                {t.nav.getQuote}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
