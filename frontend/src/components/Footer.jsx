import React from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, MessageCircle, Instagram } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, getValue } from "@/contexts/SiteContext";

export default function Footer() {
    const { t, lang } = useLang();
    const { settings } = useSite();

    const address = getText(settings, "contact_address", lang, t.contact.addressLine);
    const email = getValue(settings, "contact_email", t.contact.emailValue);
    const phone = getValue(settings, "contact_phone", "");
    const whatsapp = getValue(settings, "contact_whatsapp", "");
    const instagram = getValue(settings, "contact_instagram", "");

    return (
        <footer className="bg-canvas border-t border-hairline-soft" data-testid="footer">
            <div className="container-page py-section">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
                    <div className="md:col-span-5">
                        <Logo size={40} withWordmark />
                        <p className="mt-5 text-ink-steel max-w-sm text-sm leading-relaxed" data-testid="footer-tagline">
                            {t.footer.tagline}
                        </p>
                        <div className="mt-6 space-y-3 text-sm text-ink-charcoal">
                            <p className="flex items-start gap-2" data-testid="footer-address">
                                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-ink-stone" />
                                <span>{address}</span>
                            </p>
                            <p className="flex items-center gap-2" data-testid="footer-email">
                                <Mail className="w-4 h-4 text-ink-stone" />
                                <a href={`mailto:${email}`} className="hover:text-cobalt break-all">{email}</a>
                            </p>
                            {phone && (
                                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-ink-stone" /><a href={`tel:${phone}`} className="hover:text-cobalt">{phone}</a></p>
                            )}
                            {whatsapp && (
                                <p className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-ink-stone" /><a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-cobalt">WhatsApp · {whatsapp}</a></p>
                            )}
                            {instagram && (
                                <p className="flex items-center gap-2"><Instagram className="w-4 h-4 text-ink-stone" /><a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="hover:text-cobalt">@{instagram.replace(/^@/, "")}</a></p>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-sm font-bold text-ink-deep mb-4">{t.footer.company}</h4>
                        <ul className="space-y-2 text-sm text-ink-steel">
                            <li><Link to="/about" className="hover:text-ink-deep">{t.nav.about}</Link></li>
                            <li><Link to="/portfolio" className="hover:text-ink-deep">{t.nav.portfolio}</Link></li>
                            <li><Link to="/contact" className="hover:text-ink-deep">{t.nav.contact}</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h4 className="text-sm font-bold text-ink-deep mb-4">{t.footer.services}</h4>
                        <ul className="space-y-2 text-sm text-ink-steel">
                            <li><Link to="/services" className="hover:text-ink-deep">{t.nav.services}</Link></li>
                            <li><Link to="/machines" className="hover:text-ink-deep">{t.nav.machines}</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="text-sm font-bold text-ink-deep mb-4">{t.footer.resources}</h4>
                        <ul className="space-y-2 text-sm text-ink-steel">
                            <li><Link to="/blog" className="hover:text-ink-deep">{t.nav.blog}</Link></li>
                            <li><Link to="/admin/login" className="hover:text-ink-deep" data-testid="footer-admin-link">{t.footer.admin}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-hairline-soft flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-stone">
                    <p>© {new Date().getFullYear()} PT. NURI DWI SUKSES. {t.footer.rights}</p>
                    <p className="font-bold tracking-widest uppercase">Tangerang · Banten · Indonesia</p>
                </div>
            </div>
        </footer>
    );
}
