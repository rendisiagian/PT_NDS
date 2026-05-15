import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Inbox, FileText, LogOut, Eye, Trash2, Plus, Edit3, X, Check } from "lucide-react";
import SEO from "@/components/SEO";
import Logo from "@/components/Logo";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

const EMPTY_POST = {
    title_id: "",
    title_en: "",
    excerpt_id: "",
    excerpt_en: "",
    content_id: "",
    content_en: "",
    cover_image: "",
    tags: [],
    published: true,
};

export default function AdminDashboard() {
    const { t } = useLang();
    const a = t.admin;
    const { user, checking, logout } = useAuth();
    const [tab, setTab] = useState("inquiries");

    if (checking) return <div className="container-page py-section">Loading…</div>;
    if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

    return (
        <main data-testid="admin-dashboard">
            <SEO title={a.dashboard} description="Admin dashboard" />
            <div className="border-b border-hairline-soft bg-canvas">
                <div className="container-page flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center"><Logo size={36} withWordmark /></Link>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-ink-steel">{user.email}</span>
                        <button onClick={logout} className="btn-pill-ghost" data-testid="admin-logout">
                            <LogOut className="w-4 h-4 mr-1" /> {a.logout}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-page py-section">
                <h1 className="text-display text-ink-deep">{a.dashboard}</h1>

                <div className="mt-6 flex gap-2 flex-wrap">
                    <button
                        className={tab === "inquiries" ? "pill-tab-active" : "pill-tab"}
                        onClick={() => setTab("inquiries")}
                        data-testid="admin-tab-inquiries"
                    >
                        <Inbox className="w-4 h-4 mr-1.5 inline" /> {a.tabInquiries}
                    </button>
                    <button
                        className={tab === "blog" ? "pill-tab-active" : "pill-tab"}
                        onClick={() => setTab("blog")}
                        data-testid="admin-tab-blog"
                    >
                        <FileText className="w-4 h-4 mr-1.5 inline" /> {a.tabBlog}
                    </button>
                </div>

                <div className="mt-8">
                    {tab === "inquiries" ? <InquiriesPanel /> : <BlogPanel />}
                </div>
            </div>
        </main>
    );
}

function InquiriesPanel() {
    const { t, lang } = useLang();
    const a = t.admin;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get("/admin/inquiries")
            .then((r) => setItems(r.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        await api.patch(`/admin/inquiries/${id}/read`);
        load();
    };
    const del = async (id) => {
        if (!window.confirm(a.confirmDelete)) return;
        await api.delete(`/admin/inquiries/${id}`);
        load();
    };

    if (loading) return <p className="text-ink-steel">Loading…</p>;
    if (items.length === 0) return <p className="text-ink-steel" data-testid="admin-inquiries-empty">{a.emptyInquiries}</p>;

    return (
        <div className="space-y-4" data-testid="admin-inquiries-list">
            {items.map((it) => (
                <article key={it.id} className="card-feature" data-testid={`inquiry-${it.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-ink-deep">{it.subject}</h3>
                                {!it.is_read && (
                                    <span className="inline-block rounded-pill bg-cobalt text-canvas text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">
                                        New
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-ink-steel mt-0.5">
                                {it.name} · <a href={`mailto:${it.email}`} className="hover:text-cobalt">{it.email}</a>
                                {it.phone && <> · {it.phone}</>}
                                {it.company && <> · {it.company}</>}
                            </p>
                            <p className="text-xs text-ink-stone mt-1">
                                {new Date(it.created_at).toLocaleString(lang === "id" ? "id-ID" : "en-US")}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {!it.is_read && (
                                <button onClick={() => markRead(it.id)} className="btn-pill-ghost text-xs" data-testid={`inquiry-mark-read-${it.id}`}>
                                    <Eye className="w-3.5 h-3.5 mr-1" /> {a.markRead}
                                </button>
                            )}
                            <button onClick={() => del(it.id)} className="btn-pill-ghost text-xs text-critical" data-testid={`inquiry-delete-${it.id}`}>
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> {a.delete}
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-ink-charcoal leading-relaxed whitespace-pre-line">{it.message}</p>
                </article>
            ))}
        </div>
    );
}

function BlogPanel() {
    const { t, lang } = useLang();
    const a = t.admin;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // post being edited or new
    const [draft, setDraft] = useState(EMPTY_POST);
    const [tagInput, setTagInput] = useState("");

    const load = () => {
        setLoading(true);
        api.get("/admin/blog")
            .then((r) => setPosts(r.data || []))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => {
        setEditing("new");
        setDraft(EMPTY_POST);
        setTagInput("");
    };
    const startEdit = (post) => {
        setEditing(post.id);
        setDraft({ ...EMPTY_POST, ...post });
        setTagInput((post.tags || []).join(", "));
    };
    const cancel = () => { setEditing(null); setDraft(EMPTY_POST); };

    const save = async () => {
        const payload = { ...draft, tags: tagInput.split(",").map((x) => x.trim()).filter(Boolean) };
        if (editing === "new") {
            await api.post("/admin/blog", payload);
        } else {
            await api.put(`/admin/blog/${editing}`, payload);
        }
        cancel();
        load();
    };
    const del = async (id) => {
        if (!window.confirm(a.confirmDelete)) return;
        await api.delete(`/admin/blog/${id}`);
        load();
    };

    return (
        <div data-testid="admin-blog-panel">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg text-ink-deep">{a.tabBlog}</h2>
                {editing === null && (
                    <button onClick={startNew} className="btn-pill-primary" data-testid="admin-new-post-btn">
                        <Plus className="w-4 h-4 mr-1" /> {a.newPost}
                    </button>
                )}
            </div>

            {editing !== null && (
                <div className="card-feature mb-8" data-testid="admin-post-editor">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-ink-deep">{editing === "new" ? a.newPost : a.edit}</h3>
                        <div className="flex gap-2">
                            <button onClick={cancel} className="btn-pill-ghost"><X className="w-4 h-4 mr-1" /> {a.cancel}</button>
                            <button onClick={save} className="btn-pill-cta" data-testid="admin-post-save"><Check className="w-4 h-4 mr-1" /> {a.save}</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EditField label="Title (ID)" value={draft.title_id} onChange={(v) => setDraft({ ...draft, title_id: v })} testid="post-title-id" />
                        <EditField label="Title (EN)" value={draft.title_en} onChange={(v) => setDraft({ ...draft, title_en: v })} testid="post-title-en" />
                        <EditField label="Excerpt (ID)" value={draft.excerpt_id} onChange={(v) => setDraft({ ...draft, excerpt_id: v })} textarea rows={2} />
                        <EditField label="Excerpt (EN)" value={draft.excerpt_en} onChange={(v) => setDraft({ ...draft, excerpt_en: v })} textarea rows={2} />
                        <EditField label="Content (ID)" value={draft.content_id} onChange={(v) => setDraft({ ...draft, content_id: v })} textarea rows={8} full />
                        <EditField label="Content (EN)" value={draft.content_en} onChange={(v) => setDraft({ ...draft, content_en: v })} textarea rows={8} full />
                        <EditField label="Cover Image URL" value={draft.cover_image || ""} onChange={(v) => setDraft({ ...draft, cover_image: v })} full />
                        <EditField label="Tags (comma separated)" value={tagInput} onChange={setTagInput} full />
                        <label className="flex items-center gap-2 sm:col-span-2 mt-2">
                            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
                            <span className="text-sm text-ink-deep">{a.published}</span>
                        </label>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-ink-steel">Loading…</p>
            ) : posts.length === 0 ? (
                <p className="text-ink-steel" data-testid="admin-posts-empty">{a.emptyPosts}</p>
            ) : (
                <div className="space-y-3">
                    {posts.map((p) => (
                        <div key={p.id} className="card-feature flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`admin-post-row-${p.id}`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-ink-deep">{lang === "id" ? p.title_id : p.title_en}</h3>
                                    <span className={`inline-block rounded-pill text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${p.published ? "bg-success text-canvas" : "bg-hairline text-ink"}`}>
                                        {p.published ? a.published : a.draft}
                                    </span>
                                </div>
                                <p className="text-xs text-ink-stone mt-1">/{p.slug}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(p)} className="btn-pill-ghost text-xs"><Edit3 className="w-3.5 h-3.5 mr-1" /> {a.edit}</button>
                                <button onClick={() => del(p.id)} className="btn-pill-ghost text-xs text-critical"><Trash2 className="w-3.5 h-3.5 mr-1" /> {a.delete}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EditField({ label, value, onChange, textarea, rows = 3, full, testid }) {
    return (
        <label className={`block ${full ? "sm:col-span-2" : ""}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-steel mb-1.5 block">{label}</span>
            {textarea ? (
                <textarea
                    value={value || ""}
                    rows={rows}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-canvas text-ink border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cobalt focus:border-2"
                    data-testid={testid}
                />
            ) : (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-canvas text-ink border border-hairline rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cobalt focus:border-2"
                    data-testid={testid}
                />
            )}
        </label>
    );
}
