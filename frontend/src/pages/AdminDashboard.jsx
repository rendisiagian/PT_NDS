import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
    Inbox, FileText, LogOut, Eye, Trash2, Plus, Edit3, X, Check,
    Settings as SettingsIcon, Layers, Image as ImageIcon, ChevronDown, ChevronUp, Save, RefreshCw,
} from "lucide-react";
import SEO from "@/components/SEO";
import Logo from "@/components/Logo";
import MediaPicker from "@/components/MediaPicker";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useSite } from "@/contexts/SiteContext";
import { SETTINGS_GROUPS, COLLECTION_SCHEMAS } from "@/lib/cmsSchemas";
import { resolveMediaUrl } from "@/lib/media";

const EMPTY_POST = {
    title_id: "", title_en: "", excerpt_id: "", excerpt_en: "",
    content_id: "", content_en: "", cover_image: "", tags: [], published: true,
};

const TABS = [
    { key: "inquiries", label: "Pesan Masuk", Icon: Inbox },
    { key: "settings", label: "Konten Halaman", Icon: SettingsIcon },
    { key: "collections", label: "Layanan/Mesin/dll", Icon: Layers },
    { key: "blog", label: "Blog", Icon: FileText },
    { key: "media", label: "Media", Icon: ImageIcon },
];

export default function AdminDashboard() {
    const { user, checking, logout } = useAuth();
    const [tab, setTab] = useState("inquiries");

    if (checking) return <div className="container-page py-section">Loading…</div>;
    if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

    return (
        <main data-testid="admin-dashboard">
            <SEO title="Admin Dashboard" description="Internal admin dashboard" />
            <div className="border-b border-hairline-soft bg-canvas sticky top-0 z-30">
                <div className="container-page flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center"><Logo size={36} withWordmark /></Link>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-sm text-ink-steel">{user.email}</span>
                        <button onClick={logout} className="btn-pill-ghost" data-testid="admin-logout">
                            <LogOut className="w-4 h-4 mr-1" /> Keluar
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-page py-section">
                <h1 className="text-display text-ink-deep">Dasbor</h1>

                <div className="mt-6 flex gap-2 flex-wrap" role="tablist">
                    {TABS.map((tb) => (
                        <button
                            key={tb.key}
                            className={tab === tb.key ? "pill-tab-active" : "pill-tab"}
                            onClick={() => setTab(tb.key)}
                            data-testid={`admin-tab-${tb.key}`}
                        >
                            <tb.Icon className="w-4 h-4 mr-1.5 inline" /> {tb.label}
                        </button>
                    ))}
                </div>

                <div className="mt-8">
                    {tab === "inquiries" && <InquiriesPanel />}
                    {tab === "settings" && <SettingsPanel />}
                    {tab === "collections" && <CollectionsPanel />}
                    {tab === "blog" && <BlogPanel />}
                    {tab === "media" && <MediaPanel />}
                </div>
            </div>
        </main>
    );
}

// =====================================================================
// Inquiries Panel
// =====================================================================
function InquiriesPanel() {
    const { lang } = useLang();
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

    const markRead = async (id) => { await api.patch(`/admin/inquiries/${id}/read`); load(); };
    const del = async (id) => {
        if (!window.confirm("Yakin ingin menghapus pesan ini?")) return;
        await api.delete(`/admin/inquiries/${id}`); load();
    };

    if (loading) return <p className="text-ink-steel">Loading…</p>;
    if (items.length === 0) return <p className="text-ink-steel" data-testid="admin-inquiries-empty">Belum ada pesan masuk.</p>;

    return (
        <div className="space-y-4" data-testid="admin-inquiries-list">
            {items.map((it) => (
                <article key={it.id} className="card-feature" data-testid={`inquiry-${it.id}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-ink-deep">{it.subject}</h3>
                                {!it.is_read && (
                                    <span className="inline-block rounded-pill bg-cobalt text-canvas text-[10px] font-bold uppercase tracking-widest px-2 py-0.5">New</span>
                                )}
                            </div>
                            <p className="text-sm text-ink-steel mt-0.5">
                                {it.name} · <a href={`mailto:${it.email}`} className="hover:text-cobalt">{it.email}</a>
                                {it.phone && <> · {it.phone}</>}
                                {it.company && <> · {it.company}</>}
                            </p>
                            <p className="text-xs text-ink-stone mt-1">{new Date(it.created_at).toLocaleString(lang === "id" ? "id-ID" : "en-US")}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {!it.is_read && (
                                <button onClick={() => markRead(it.id)} className="btn-pill-ghost text-xs" data-testid={`inquiry-mark-read-${it.id}`}>
                                    <Eye className="w-3.5 h-3.5 mr-1" /> Tandai dibaca
                                </button>
                            )}
                            <button onClick={() => del(it.id)} className="btn-pill-ghost text-xs text-critical" data-testid={`inquiry-delete-${it.id}`}>
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-ink-charcoal leading-relaxed whitespace-pre-line">{it.message}</p>
                </article>
            ))}
        </div>
    );
}

// =====================================================================
// Settings Panel (key/value site content)
// =====================================================================
function SettingsPanel() {
    const { refresh: refreshSite } = useSite();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [openGroup, setOpenGroup] = useState(SETTINGS_GROUPS[0].page);
    const [savedKey, setSavedKey] = useState("");

    const load = () => {
        setLoading(true);
        api.get("/admin/site/settings")
            .then((r) => setData(r.data || {}))
            .catch(() => setData({}))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const update = (key, newVal) => setData((d) => ({ ...d, [key]: newVal }));

    const save = async (key) => {
        await api.put(`/admin/site/settings/${key}`, { value: data[key] });
        setSavedKey(key);
        await refreshSite();
        setTimeout(() => setSavedKey((cur) => (cur === key ? "" : cur)), 1800);
    };

    if (loading) return <p className="text-ink-steel">Loading…</p>;

    return (
        <div className="space-y-4" data-testid="admin-settings-panel">
            <p className="text-sm text-ink-steel">
                Ubah teks dan gambar yang muncul di setiap halaman website. Perubahan tersimpan dan langsung tampil setelah klik <span className="font-bold">Simpan</span>.
            </p>

            {SETTINGS_GROUPS.map((group) => {
                const isOpen = openGroup === group.page;
                return (
                    <div key={group.page} className="card-feature p-0 overflow-hidden">
                        <button
                            onClick={() => setOpenGroup(isOpen ? "" : group.page)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left"
                            data-testid={`settings-group-${group.page}`}
                        >
                            <span className="text-lg font-bold text-ink-deep">{group.page}</span>
                            {isOpen ? <ChevronUp className="w-5 h-5 text-ink-steel" /> : <ChevronDown className="w-5 h-5 text-ink-steel" />}
                        </button>
                        {isOpen && (
                            <div className="px-6 pb-6 space-y-6 border-t border-hairline-soft pt-6">
                                {group.items.map((field) => (
                                    <SettingField
                                        key={field.key}
                                        field={field}
                                        value={data[field.key]}
                                        onChange={(v) => update(field.key, v)}
                                        onSave={() => save(field.key)}
                                        saved={savedKey === field.key}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function SettingField({ field, value, onChange, onSave, saved }) {
    const { key, label, type, placeholder } = field;
    const v = value || (type === "shorttext" ? { value: "" }
        : type === "list" ? { value: [] }
        : type === "image" ? { url: "" }
        : { id: "", en: "" });

    return (
        <div className="space-y-2" data-testid={`setting-${key}`}>
            <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold text-ink-deep">{label}</label>
                <button onClick={onSave} className={`btn-pill-ghost text-xs ${saved ? "text-success" : ""}`} data-testid={`setting-save-${key}`}>
                    {saved ? <><Check className="w-3.5 h-3.5 mr-1" /> Tersimpan</> : <><Save className="w-3.5 h-3.5 mr-1" /> Simpan</>}
                </button>
            </div>

            {type === "text" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BilingualInput placeholder={placeholder} sub="ID" value={v.id || ""} onChange={(x) => onChange({ ...v, id: x })} />
                    <BilingualInput placeholder={placeholder} sub="EN" value={v.en || ""} onChange={(x) => onChange({ ...v, en: x })} />
                </div>
            )}
            {type === "textarea" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BilingualTextarea sub="ID" value={v.id || ""} onChange={(x) => onChange({ ...v, id: x })} />
                    <BilingualTextarea sub="EN" value={v.en || ""} onChange={(x) => onChange({ ...v, en: x })} />
                </div>
            )}
            {type === "shorttext" && (
                <input
                    type="text"
                    placeholder={placeholder}
                    value={v.value || ""}
                    onChange={(e) => onChange({ value: e.target.value })}
                    className="cms-input"
                />
            )}
            {type === "list" && (
                <textarea
                    rows={Math.max(3, (Array.isArray(v.value) ? v.value.length : 0) + 1)}
                    placeholder={placeholder || "Satu item per baris"}
                    value={(Array.isArray(v.value) ? v.value : []).join("\n")}
                    onChange={(e) => onChange({ value: e.target.value.split("\n").map((x) => x.trimEnd()).filter((x) => x !== "") })}
                    className="cms-input min-h-[120px]"
                />
            )}
            {type === "image" && (
                <MediaPicker
                    label=""
                    value={v.url || ""}
                    onChange={(url) => onChange({ url })}
                    testid={`setting-image-${key}`}
                />
            )}
            <style>{`
                .cms-input { width: 100%; background: #fff; color: #1C1E21; border: 1px solid #CED0D4; border-radius: 8px; padding: 10px 12px; font-size: 14px; line-height: 1.45; transition: border-color .15s ease; }
                .cms-input:focus { outline: none; border: 2px solid #0064E0; padding: 9px 11px; }
            `}</style>
        </div>
    );
}

function BilingualInput({ value, onChange, sub, placeholder }) {
    return (
        <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-stone block mb-1">{sub}</span>
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="cms-input" />
        </div>
    );
}
function BilingualTextarea({ value, onChange, sub }) {
    return (
        <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-stone block mb-1">{sub}</span>
            <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="cms-input min-h-[90px]" />
        </div>
    );
}

// =====================================================================
// Collections Panel (services, machines, sectors, testimonials, etc.)
// =====================================================================
function CollectionsPanel() {
    const collectionKeys = Object.keys(COLLECTION_SCHEMAS);
    const [active, setActive] = useState(collectionKeys[0]);

    return (
        <div data-testid="admin-collections-panel">
            <p className="text-sm text-ink-steel mb-4">Kelola daftar item: Layanan, Mesin, Sektor Portofolio, Testimonial, Langkah Proses, Nilai Perusahaan, dan Spesifikasi Mesin.</p>
            <div className="flex gap-2 flex-wrap mb-6">
                {collectionKeys.map((k) => (
                    <button
                        key={k}
                        className={active === k ? "pill-tab-active" : "pill-tab"}
                        onClick={() => setActive(k)}
                        data-testid={`collection-tab-${k}`}
                    >
                        {COLLECTION_SCHEMAS[k].label}
                    </button>
                ))}
            </div>
            <CollectionEditor key={active} name={active} schema={COLLECTION_SCHEMAS[active]} />
        </div>
    );
}

function CollectionEditor({ name, schema }) {
    const { refresh: refreshSite } = useSite();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({});

    const blankDraft = useMemo(() => {
        const obj = {};
        schema.fields.forEach((f) => {
            obj[f.key] = f.type === "number" ? 0 : "";
        });
        return obj;
    }, [schema]);

    const load = () => {
        setLoading(true);
        api.get(`/admin/collections/${name}`)
            .then((r) => setItems(r.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, [name]);

    const startNew = () => {
        setEditingId("new");
        setDraft({ ...blankDraft, order: items.length });
    };
    const startEdit = (it) => {
        setEditingId(it.id);
        setDraft({ ...blankDraft, ...it });
    };
    const cancel = () => { setEditingId(null); setDraft({}); };
    const save = async () => {
        if (editingId === "new") {
            await api.post(`/admin/collections/${name}`, draft);
        } else {
            await api.put(`/admin/collections/${name}/${editingId}`, draft);
        }
        cancel();
        load();
        refreshSite();
    };
    const del = async (id) => {
        if (!window.confirm("Yakin ingin menghapus?")) return;
        await api.delete(`/admin/collections/${name}/${id}`);
        load();
        refreshSite();
    };

    return (
        <div data-testid={`collection-editor-${name}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-heading-lg text-ink-deep">{schema.label}</h3>
                {editingId === null && (
                    <button onClick={startNew} className="btn-pill-primary" data-testid="collection-new-btn">
                        <Plus className="w-4 h-4 mr-1" /> Tambah baru
                    </button>
                )}
            </div>

            {editingId !== null && (
                <div className="card-feature mb-6" data-testid="collection-editor-form">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-ink-deep">{editingId === "new" ? "Tambah baru" : "Edit"}</h4>
                        <div className="flex gap-2">
                            <button onClick={cancel} className="btn-pill-ghost"><X className="w-4 h-4 mr-1" /> Batal</button>
                            <button onClick={save} className="btn-pill-cta" data-testid="collection-save-btn"><Check className="w-4 h-4 mr-1" /> Simpan</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {schema.fields.map((f) => (
                            <CollectionField
                                key={f.key}
                                field={f}
                                value={draft[f.key]}
                                onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v }))}
                            />
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-ink-steel">Loading…</p>
            ) : items.length === 0 ? (
                <p className="text-ink-steel" data-testid={`collection-empty-${name}`}>Belum ada item.</p>
            ) : (
                <div className="space-y-2">
                    {items.map((it) => (
                        <div key={it.id} className="card-feature flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`collection-row-${it.id}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                {it.image && (
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-soft border border-hairline shrink-0">
                                        <img src={resolveMediaUrl(it.image)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h4 className="text-base font-bold text-ink-deep truncate">{it[schema.titleField] || "—"}</h4>
                                    {it.title_en && it.title_en !== it[schema.titleField] && (
                                        <p className="text-xs text-ink-stone truncate">{it.title_en}</p>
                                    )}
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-cobalt mt-0.5">Urutan {it.order ?? 0}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(it)} className="btn-pill-ghost text-xs" data-testid={`collection-edit-${it.id}`}><Edit3 className="w-3.5 h-3.5 mr-1" /> Edit</button>
                                <button onClick={() => del(it.id)} className="btn-pill-ghost text-xs text-critical" data-testid={`collection-delete-${it.id}`}><Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CollectionField({ field, value, onChange }) {
    return (
        <div className={field.type === "textarea" || field.type === "image" ? "sm:col-span-2" : ""}>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-steel block mb-1.5">{field.label}{field.required && <span className="text-critical">*</span>}</span>
            {field.type === "text" && (
                <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="cms-input" />
            )}
            {field.type === "textarea" && (
                <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} className="cms-input min-h-[90px]" />
            )}
            {field.type === "number" && (
                <input type="number" value={value ?? 0} onChange={(e) => onChange(parseInt(e.target.value || "0", 10))} className="cms-input" />
            )}
            {field.type === "select" && (
                <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="cms-input">
                    <option value="">— Pilih —</option>
                    {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            )}
            {field.type === "image" && (
                <MediaPicker value={value || ""} onChange={onChange} label="" />
            )}
            <style>{`
                .cms-input { width: 100%; background: #fff; color: #1C1E21; border: 1px solid #CED0D4; border-radius: 8px; padding: 10px 12px; font-size: 14px; line-height: 1.45; transition: border-color .15s ease; }
                .cms-input:focus { outline: none; border: 2px solid #0064E0; padding: 9px 11px; }
            `}</style>
        </div>
    );
}

// =====================================================================
// Blog Panel
// =====================================================================
function BlogPanel() {
    const { lang } = useLang();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(EMPTY_POST);
    const [tagInput, setTagInput] = useState("");

    const load = () => {
        setLoading(true);
        api.get("/admin/blog").then((r) => setPosts(r.data || [])).catch(() => setPosts([])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing("new"); setDraft(EMPTY_POST); setTagInput(""); };
    const startEdit = (post) => { setEditing(post.id); setDraft({ ...EMPTY_POST, ...post }); setTagInput((post.tags || []).join(", ")); };
    const cancel = () => { setEditing(null); setDraft(EMPTY_POST); };
    const save = async () => {
        const payload = { ...draft, tags: tagInput.split(",").map((x) => x.trim()).filter(Boolean) };
        if (editing === "new") await api.post("/admin/blog", payload);
        else await api.put(`/admin/blog/${editing}`, payload);
        cancel(); load();
    };
    const del = async (id) => {
        if (!window.confirm("Yakin ingin menghapus artikel ini?")) return;
        await api.delete(`/admin/blog/${id}`); load();
    };

    return (
        <div data-testid="admin-blog-panel">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg text-ink-deep">Artikel Blog</h2>
                {editing === null && (
                    <button onClick={startNew} className="btn-pill-primary" data-testid="admin-new-post-btn"><Plus className="w-4 h-4 mr-1" /> Artikel baru</button>
                )}
            </div>

            {editing !== null && (
                <div className="card-feature mb-8" data-testid="admin-post-editor">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-ink-deep">{editing === "new" ? "Artikel Baru" : "Edit Artikel"}</h3>
                        <div className="flex gap-2">
                            <button onClick={cancel} className="btn-pill-ghost"><X className="w-4 h-4 mr-1" /> Batal</button>
                            <button onClick={save} className="btn-pill-cta" data-testid="admin-post-save"><Check className="w-4 h-4 mr-1" /> Simpan</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <EditField label="Judul (ID)" value={draft.title_id} onChange={(v) => setDraft({ ...draft, title_id: v })} testid="post-title-id" />
                        <EditField label="Title (EN)" value={draft.title_en} onChange={(v) => setDraft({ ...draft, title_en: v })} testid="post-title-en" />
                        <EditField label="Ringkasan (ID)" value={draft.excerpt_id} onChange={(v) => setDraft({ ...draft, excerpt_id: v })} textarea rows={2} />
                        <EditField label="Excerpt (EN)" value={draft.excerpt_en} onChange={(v) => setDraft({ ...draft, excerpt_en: v })} textarea rows={2} />
                        <EditField label="Konten (ID)" value={draft.content_id} onChange={(v) => setDraft({ ...draft, content_id: v })} textarea rows={8} full />
                        <EditField label="Content (EN)" value={draft.content_en} onChange={(v) => setDraft({ ...draft, content_en: v })} textarea rows={8} full />
                        <div className="sm:col-span-2">
                            <MediaPicker
                                label="Cover Image"
                                value={draft.cover_image || ""}
                                onChange={(url) => setDraft({ ...draft, cover_image: url })}
                                testid="post-cover"
                            />
                        </div>
                        <EditField label="Tags (pisah dengan koma)" value={tagInput} onChange={setTagInput} full />
                        <label className="flex items-center gap-2 sm:col-span-2 mt-2">
                            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
                            <span className="text-sm text-ink-deep">Tayangkan (uncheck = simpan sebagai draf)</span>
                        </label>
                    </div>
                </div>
            )}

            {loading ? <p className="text-ink-steel">Loading…</p>
                : posts.length === 0 ? <p className="text-ink-steel" data-testid="admin-posts-empty">Belum ada artikel.</p>
                : (
                    <div className="space-y-3">
                        {posts.map((p) => (
                            <div key={p.id} className="card-feature flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" data-testid={`admin-post-row-${p.id}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    {p.cover_image && (
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-soft border border-hairline shrink-0">
                                            <img src={resolveMediaUrl(p.cover_image)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-ink-deep truncate">{lang === "id" ? p.title_id : p.title_en}</h3>
                                            <span className={`inline-block rounded-pill text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${p.published ? "bg-success text-canvas" : "bg-hairline text-ink"}`}>{p.published ? "Tayang" : "Draf"}</span>
                                        </div>
                                        <p className="text-xs text-ink-stone mt-1">/{p.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(p)} className="btn-pill-ghost text-xs"><Edit3 className="w-3.5 h-3.5 mr-1" /> Edit</button>
                                    <button onClick={() => del(p.id)} className="btn-pill-ghost text-xs text-critical"><Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            <style>{`
                .cms-input { width: 100%; background: #fff; color: #1C1E21; border: 1px solid #CED0D4; border-radius: 8px; padding: 10px 12px; font-size: 14px; line-height: 1.45; transition: border-color .15s ease; }
                .cms-input:focus { outline: none; border: 2px solid #0064E0; padding: 9px 11px; }
            `}</style>
        </div>
    );
}

function EditField({ label, value, onChange, textarea, rows = 3, full, testid }) {
    return (
        <label className={`block ${full ? "sm:col-span-2" : ""}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-ink-steel mb-1.5 block">{label}</span>
            {textarea
                ? <textarea value={value || ""} rows={rows} onChange={(e) => onChange(e.target.value)} className="cms-input min-h-[90px]" data-testid={testid} />
                : <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="cms-input" data-testid={testid} />}
        </label>
    );
}

// =====================================================================
// Media Panel
// =====================================================================
function MediaPanel() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get("/admin/media").then((r) => setItems(r.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const upload = async (file) => {
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        await api.post("/admin/media", fd, { headers: { "Content-Type": "multipart/form-data" } });
        load();
    };
    const del = async (id) => {
        if (!window.confirm("Hapus gambar ini? Pastikan tidak digunakan di konten lain.")) return;
        await api.delete(`/admin/media/${id}`); load();
    };
    const copy = (url) => {
        const full = resolveMediaUrl(url);
        navigator.clipboard.writeText(full);
    };

    return (
        <div data-testid="admin-media-panel">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg text-ink-deep">Media Library</h2>
                <label className="btn-pill-primary cursor-pointer" data-testid="media-upload-btn">
                    <Plus className="w-4 h-4 mr-1" /> Unggah gambar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
            </div>

            <p className="text-sm text-ink-steel mb-4">Maksimal 5 MB per file. Format: JPEG, PNG, WebP, GIF, SVG.</p>

            {loading ? <p className="text-ink-steel">Loading…</p>
                : items.length === 0 ? <p className="text-ink-steel">Belum ada media.</p>
                : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.map((m) => (
                            <div key={m.id} className="card-feature p-3" data-testid={`media-item-${m.id}`}>
                                <div className="aspect-square rounded-lg overflow-hidden bg-surface-soft mb-2">
                                    <img src={resolveMediaUrl(m.url)} alt={m.filename} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs font-bold text-ink-deep truncate" title={m.filename}>{m.filename}</p>
                                <p className="text-[11px] text-ink-stone mt-0.5">{Math.round((m.size || 0) / 1024)} KB</p>
                                <div className="mt-2 flex gap-1">
                                    <button onClick={() => copy(m.url)} className="btn-pill-ghost text-[11px] flex-1">Salin URL</button>
                                    <button onClick={() => del(m.id)} className="btn-pill-ghost text-[11px] text-critical"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
