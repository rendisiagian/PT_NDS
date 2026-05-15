import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import SEO from "@/components/SEO";
import api from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";

export default function BlogPostPage() {
    const { slug } = useParams();
    const { t, lang } = useLang();
    const b = t.blog;
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/blog/${slug}`)
            .then((r) => setPost(r.data))
            .catch(() => setError("not found"));
    }, [slug]);

    if (error) {
        return (
            <main className="container-page py-section-lg text-center" data-testid="blog-post-not-found">
                <p className="text-ink-steel">404</p>
                <Link to="/blog" className="mt-4 btn-pill-ghost inline-flex">
                    <ArrowLeft className="w-4 h-4 mr-1" /> {b.backToBlog}
                </Link>
            </main>
        );
    }

    if (!post) {
        return <main className="container-page py-section-lg" data-testid="blog-post-loading">Loading…</main>;
    }

    const title = lang === "id" ? post.title_id : post.title_en;
    const content = lang === "id" ? post.content_id : post.content_en;
    const excerpt = lang === "id" ? post.excerpt_id : post.excerpt_en;

    return (
        <main data-testid="blog-post-page">
            <SEO title={title} description={excerpt} />
            <article className="container-page pt-10 pb-section-lg max-w-3xl">
                <Link to="/blog" className="inline-flex items-center text-sm text-ink-steel hover:text-ink-deep mb-8" data-testid="blog-post-back">
                    <ArrowLeft className="w-4 h-4 mr-1" /> {b.backToBlog}
                </Link>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-cobalt">
                    <Calendar className="w-3.5 h-3.5" />
                    <time>{new Date(post.created_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
                    {post.tags && post.tags.length > 0 && (
                        <span className="text-ink-stone">· {post.tags.join(" · ")}</span>
                    )}
                </div>
                <h1 className="mt-4 text-hero text-ink-deep" data-testid="blog-post-title">{title}</h1>
                <p className="mt-5 text-lg text-ink-charcoal leading-relaxed">{excerpt}</p>

                {post.cover_image && (
                    <div className="mt-10 card-feature-photo aspect-[16/9]">
                        <img src={post.cover_image} alt={title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="prose mt-10 text-ink-charcoal leading-relaxed text-base whitespace-pre-line" data-testid="blog-post-content">
                    {content}
                </div>
            </article>
        </main>
    );
}
