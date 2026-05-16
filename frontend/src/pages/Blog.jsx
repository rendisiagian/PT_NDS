import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

export default function BlogPage() {
    const { t, lang } = useLang();
    const b = t.blog;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/blog")
            .then((r) => setPosts(r.data || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main data-testid="blog-page">
            <SEO title={b.eyebrow} description={b.sub} />
            <section className="container-page pt-12 lg:pt-20 pb-section">
                <p className="text-xs font-bold uppercase tracking-widest text-cobalt">{b.eyebrow}</p>
                <h1 className="mt-3 text-hero text-ink-deep max-w-4xl" data-testid="blog-title">{b.title}</h1>
                <p className="mt-6 max-w-3xl text-base sm:text-lg text-ink-charcoal leading-relaxed">{b.sub}</p>
            </section>

            <section className="bg-sky-soft" data-testid="blog-list">
                <div className="container-page py-section-lg">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="card-feature animate-pulse h-72 bg-canvas/60" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <p className="text-ink-steel">{b.empty}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${post.slug}`}
                                    className="group rounded-4xl overflow-hidden bg-canvas border border-hairline-soft hover:border-ink-deep transition-colors"
                                    data-testid={`blog-card-${post.slug}`}
                                >
                                    {post.cover_image && (
                                        <div className="aspect-[16/10] overflow-hidden bg-surface-soft">
                                            <img
                                                src={post.cover_image}
                                                alt={lang === "id" ? post.title_id : post.title_en}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cobalt">
                                            <span>{new Date(post.created_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                                            {post.tags && post.tags[0] && (
                                                <>
                                                    <span className="text-ink-stone">·</span>
                                                    <span className="text-ink-stone">{post.tags[0]}</span>
                                                </>
                                            )}
                                        </div>
                                        <h2 className="mt-3 text-xl font-bold text-ink-deep leading-snug">
                                            {lang === "id" ? post.title_id : post.title_en}
                                        </h2>
                                        <p className="mt-3 text-sm text-ink-charcoal line-clamp-3 leading-relaxed">
                                            {lang === "id" ? post.excerpt_id : post.excerpt_en}
                                        </p>
                                        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-ink-deep group-hover:text-cobalt transition-colors">
                                            {b.readMore} <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
