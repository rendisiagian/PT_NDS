import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "@/components/Logo";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { formatApiError } from "@/lib/api";

export default function AdminLoginPage() {
    const { t } = useLang();
    const a = t.admin;
    const { user, login, checking } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!checking && user && user.role === "admin") {
        return <Navigate to="/admin" replace />;
    }

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(email, password);
            navigate("/admin", { replace: true });
        } catch (err) {
            setError(formatApiError(err.response?.data?.detail) || "Login failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-[80vh] flex items-center justify-center container-page py-section" data-testid="admin-login-page">
            <SEO title="Admin Login" description="Internal admin login" />
            <div className="w-full max-w-md">
                <Link to="/" className="inline-flex"><Logo size={44} withWordmark /></Link>
                <div className="mt-8 card-feature">
                    <div className="w-10 h-10 rounded-pill bg-cobalt text-canvas flex items-center justify-center mb-5">
                        <Lock className="w-4 h-4" />
                    </div>
                    <h1 className="text-heading-lg text-ink-deep" data-testid="admin-login-title">{a.loginTitle}</h1>
                    <p className="mt-2 text-sm text-ink-steel">{a.loginSub}</p>
                    <form onSubmit={submit} className="mt-6 space-y-4" data-testid="admin-login-form">
                        <label className="block">
                            <span className="text-sm font-bold text-ink-deep mb-2 block">{a.email}</span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-canvas text-ink border border-hairline rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-cobalt focus:border-2"
                                data-testid="admin-login-email"
                                autoComplete="email"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-ink-deep mb-2 block">{a.password}</span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-canvas text-ink border border-hairline rounded-lg px-3.5 py-3 text-sm focus:outline-none focus:border-cobalt focus:border-2"
                                data-testid="admin-login-password"
                                autoComplete="current-password"
                            />
                        </label>
                        {error && <p className="text-sm text-critical font-bold" data-testid="admin-login-error">{error}</p>}
                        <button type="submit" disabled={submitting} className="btn-pill-cta w-full disabled:opacity-60" data-testid="admin-login-submit">
                            {submitting ? a.submitting : a.submit}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
