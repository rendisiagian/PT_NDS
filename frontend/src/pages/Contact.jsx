import React, { useState } from "react";
import { MapPin, Mail, Clock, CheckCircle2, Phone, MessageCircle, Instagram } from "lucide-react";
import SEO from "@/components/SEO";
import api, { formatApiError } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import { useSite, getText, getValue } from "@/contexts/SiteContext";

const EMPTY = { name: "", email: "", phone: "", company: "", subject: "", message: "" };

export default function ContactPage() {
    const { t, lang } = useLang();
    const c = t.contact;
    const { settings } = useSite();
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const title = getText(settings, "contact_title", lang, c.title);
    const sub = getText(settings, "contact_sub", lang, c.sub);
    const address = getText(settings, "contact_address", lang, c.addressLine);
    const email = getValue(settings, "contact_email", c.emailValue);
    const phone = getValue(settings, "contact_phone", "");
    const whatsapp = getValue(settings, "contact_whatsapp", "");
    const instagram = getValue(settings, "contact_instagram", "");
    const hours = getText(settings, "contact_hours", lang, c.hoursValue);
    const mapsQuery = getValue(settings, "contact_maps_query", "Pasar Kemis Tangerang Banten");

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const payload = { ...form };
            ["phone", "company"].forEach((k) => { if (!payload[k]) delete payload[k]; });
            await api.post("/contact", payload);
            setSuccess(true);
            setForm(EMPTY);
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || c.form.error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main data-testid="contact-page">
            <SEO title={c.eyebrow} description={sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{c.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="contact-title">{title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{sub}</p>
            </section>

            <section className="bg-sky-tint">
                <div className="container-page py-section-lg grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5 space-y-5" data-testid="contact-info">
                        <InfoBlock Icon={MapPin} title={c.address} body={address} />
                        <InfoBlock Icon={Mail} title={c.email} body={<a href={`mailto:${email}`} className="hover:text-cobalt break-all">{email}</a>} />
                        {phone && (
                            <InfoBlock Icon={Phone} title="Telepon" body={<a href={`tel:${phone}`} className="hover:text-cobalt">{phone}</a>} />
                        )}
                        {whatsapp && (
                            <InfoBlock Icon={MessageCircle} title="WhatsApp" body={<a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-cobalt">{whatsapp}</a>} />
                        )}
                        {instagram && (
                            <InfoBlock Icon={Instagram} title="Instagram" body={<a href={`https://instagram.com/${instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="hover:text-cobalt">@{instagram.replace(/^@/, "")}</a>} />
                        )}
                        <InfoBlock Icon={Clock} title={c.hours} body={hours} />

                        <div className="card-feature-photo aspect-[5/3] mt-2">
                            <iframe
                                title="PT. NURI DWI SUKSES location"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`}
                                className="w-full h-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-7" data-testid="contact-form-wrap">
                        <form className="card-feature space-y-5" onSubmit={submit} data-testid="contact-form">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label={c.form.name} required>
                                    <input type="text" required value={form.name} onChange={set("name")} className="input-base" data-testid="contact-input-name" />
                                </Field>
                                <Field label={c.form.email} required>
                                    <input type="email" required value={form.email} onChange={set("email")} className="input-base" data-testid="contact-input-email" />
                                </Field>
                                <Field label={c.form.phone}>
                                    <input type="tel" value={form.phone} onChange={set("phone")} className="input-base" data-testid="contact-input-phone" />
                                </Field>
                                <Field label={c.form.company}>
                                    <input type="text" value={form.company} onChange={set("company")} className="input-base" data-testid="contact-input-company" />
                                </Field>
                            </div>
                            <Field label={c.form.subject} required>
                                <input type="text" required value={form.subject} onChange={set("subject")} className="input-base" data-testid="contact-input-subject" />
                            </Field>
                            <Field label={c.form.message} required>
                                <textarea required rows={6} value={form.message} onChange={set("message")} className="input-base resize-y" data-testid="contact-input-message" />
                            </Field>

                            {error && <p className="text-sm text-critical font-bold" data-testid="contact-form-error">{error}</p>}
                            {success && (
                                <p className="text-sm font-bold flex items-center gap-2 text-success" data-testid="contact-form-success">
                                    <CheckCircle2 className="w-4 h-4" /> {c.form.success}
                                </p>
                            )}

                            <button type="submit" disabled={submitting} className="btn-pill-cta disabled:opacity-60" data-testid="contact-submit-btn">
                                {submitting ? c.form.sending : c.form.submit}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <style>{`
                .input-base { width: 100%; background: #ffffff; color: #1C1E21; border: 1px solid #CED0D4; border-radius: 8px; padding: 12px 14px; font-size: 15px; line-height: 1.4; transition: border-color .15s ease; }
                .input-base:focus { outline: none; border: 2px solid #0064E0; padding: 11px 13px; }
            `}</style>
        </main>
    );
}

function InfoBlock({ Icon, title, body }) {
    return (
        <div className="card-feature flex items-start gap-4">
            <div className="w-10 h-10 rounded-pill bg-ink-deep text-canvas flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-cobalt">{title}</p>
                <p className="mt-1 text-base text-ink-deep">{body}</p>
            </div>
        </div>
    );
}

function Field({ label, required, children }) {
    return (
        <label className="block">
            <span className="text-sm font-bold text-ink-deep mb-2 block">
                {label}{required && <span className="text-critical ml-0.5">*</span>}
            </span>
            {children}
        </label>
    );
}
