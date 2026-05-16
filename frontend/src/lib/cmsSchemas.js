/**
 * Declarative schemas for the admin CMS.
 * - SETTINGS_GROUPS: groups site_settings keys into pages with field metadata
 * - COLLECTION_SCHEMAS: defines fields for each CMS collection
 *
 * Field type vocabulary:
 *  text      - single-line bilingual ({id, en})
 *  textarea  - multi-line bilingual ({id, en})
 *  shorttext - non-translated short string ({value})
 *  list      - array of strings, separate ID and EN keys (e.g. mission_id, mission_en)
 *  image     - URL string in {url}
 */

export const SETTINGS_GROUPS = [
    {
        page: "Home (Beranda)",
        items: [
            { key: "site_logo", label: "Logo situs", type: "image" },
            { key: "hero_badge", label: "Badge atas hero", type: "text" },
            { key: "hero_title", label: "Judul Hero", type: "textarea" },
            { key: "hero_sub", label: "Sub-judul Hero", type: "textarea" },
            { key: "hero_image", label: "Foto Hero", type: "image" },
            { key: "cta_banner_title", label: "Judul CTA Banner", type: "text" },
            { key: "cta_banner_body", label: "Isi CTA Banner", type: "textarea" },
            { key: "cta_banner_btn", label: "Tombol CTA Banner", type: "text" },
            { key: "promo_text", label: "Teks Promo (paling atas)", type: "text" },
            { key: "promo_cta", label: "Tombol Promo", type: "text" },
        ],
    },
    {
        page: "About (Tentang)",
        items: [
            { key: "about_title", label: "Judul About", type: "textarea" },
            { key: "about_sub", label: "Sub-judul About", type: "textarea" },
            { key: "ceo_name", label: "Nama CEO", type: "shorttext" },
            { key: "ceo_role", label: "Jabatan CEO", type: "text" },
            { key: "kata_sambutan_id", label: "Kata Sambutan (ID)", type: "list", placeholder: "Satu paragraf per baris" },
            { key: "kata_sambutan_en", label: "Welcome Speech (EN)", type: "list", placeholder: "One paragraph per line" },
            { key: "vision_text", label: "Visi", type: "textarea" },
            { key: "mission_id", label: "Misi (ID)", type: "list" },
            { key: "mission_en", label: "Mission (EN)", type: "list" },
        ],
    },
    {
        page: "Services",
        items: [
            { key: "services_title", label: "Judul halaman Services", type: "textarea" },
            { key: "services_sub", label: "Sub-judul halaman Services", type: "textarea" },
        ],
    },
    {
        page: "Machines (Mesin)",
        items: [
            { key: "machines_title", label: "Judul halaman Machines", type: "textarea" },
            { key: "machines_sub", label: "Sub-judul halaman Machines", type: "textarea" },
        ],
    },
    {
        page: "Portfolio",
        items: [
            { key: "portfolio_title", label: "Judul halaman Portfolio", type: "textarea" },
            { key: "portfolio_sub", label: "Sub-judul halaman Portfolio", type: "textarea" },
        ],
    },
    {
        page: "Contact (Kontak)",
        items: [
            { key: "contact_title", label: "Judul halaman Kontak", type: "textarea" },
            { key: "contact_sub", label: "Sub-judul halaman Kontak", type: "textarea" },
            { key: "contact_address", label: "Alamat", type: "textarea" },
            { key: "contact_email", label: "Email", type: "shorttext" },
            { key: "contact_phone", label: "Telepon", type: "shorttext", placeholder: "+62..." },
            { key: "contact_whatsapp", label: "WhatsApp", type: "shorttext", placeholder: "628123..." },
            { key: "contact_instagram", label: "Instagram username", type: "shorttext", placeholder: "nuridwisukses" },
            { key: "contact_hours", label: "Jam operasional", type: "text" },
            { key: "contact_maps_query", label: "Lokasi peta (alamat untuk Google Maps)", type: "shorttext" },
            { key: "contact_map_lat", label: "Koordinat peta: latitude", type: "shorttext", placeholder: "-6.23" },
            { key: "contact_map_lng", label: "Koordinat peta: longitude", type: "shorttext", placeholder: "106.59" },
        ],
    },
];

/* Lucide icon names commonly used for service cards */
export const ICON_OPTIONS = [
    "FileCheck2", "Droplets", "Beaker", "Layers3", "Truck", "Search",
    "Sparkles", "Leaf", "Headphones", "Cpu", "Settings", "Shield",
    "Zap", "Award", "BarChart3", "Boxes", "Printer", "PackageCheck",
    "Image", "FileText", "ClipboardCheck",
];

export const COLLECTION_SCHEMAS = {
    services: {
        label: "Layanan",
        titleField: "title_id",
        fields: [
            { key: "title_id", label: "Judul (ID)", type: "text", required: true },
            { key: "title_en", label: "Title (EN)", type: "text", required: true },
            { key: "desc_id", label: "Deskripsi (ID)", type: "textarea", required: true },
            { key: "desc_en", label: "Description (EN)", type: "textarea", required: true },
            { key: "icon", label: "Ikon (Lucide)", type: "select", options: ICON_OPTIONS },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    machines: {
        label: "Mesin",
        titleField: "title_id",
        fields: [
            { key: "badge_id", label: "Badge (ID)", type: "text" },
            { key: "badge_en", label: "Badge (EN)", type: "text" },
            { key: "title_id", label: "Judul (ID)", type: "text", required: true },
            { key: "title_en", label: "Title (EN)", type: "text", required: true },
            { key: "desc_id", label: "Deskripsi (ID)", type: "textarea", required: true },
            { key: "desc_en", label: "Description (EN)", type: "textarea", required: true },
            { key: "image", label: "Gambar mesin", type: "image" },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    machine_specs: {
        label: "Spesifikasi Mesin",
        titleField: "key_id",
        fields: [
            { key: "key_id", label: "Label (ID)", type: "text", required: true },
            { key: "key_en", label: "Label (EN)", type: "text", required: true },
            { key: "value_id", label: "Nilai (ID)", type: "text", required: true },
            { key: "value_en", label: "Value (EN)", type: "text", required: true },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    portfolio_sectors: {
        label: "Sektor Portofolio",
        titleField: "title_id",
        fields: [
            { key: "title_id", label: "Judul (ID)", type: "text", required: true },
            { key: "title_en", label: "Title (EN)", type: "text", required: true },
            { key: "desc_id", label: "Deskripsi (ID)", type: "textarea", required: true },
            { key: "desc_en", label: "Description (EN)", type: "textarea", required: true },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    testimonials: {
        label: "Testimonial",
        titleField: "name",
        fields: [
            { key: "quote_id", label: "Kutipan (ID)", type: "textarea", required: true },
            { key: "quote_en", label: "Quote (EN)", type: "textarea", required: true },
            { key: "name", label: "Nama", type: "text", required: true },
            { key: "role_id", label: "Jabatan/Perusahaan (ID)", type: "text" },
            { key: "role_en", label: "Role/Company (EN)", type: "text" },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    process_steps: {
        label: "Langkah Proses",
        titleField: "title_id",
        fields: [
            { key: "title_id", label: "Judul (ID)", type: "text", required: true },
            { key: "title_en", label: "Title (EN)", type: "text", required: true },
            { key: "desc_id", label: "Deskripsi (ID)", type: "textarea", required: true },
            { key: "desc_en", label: "Description (EN)", type: "textarea", required: true },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
    values: {
        label: "Nilai Perusahaan",
        titleField: "title_id",
        fields: [
            { key: "title_id", label: "Judul (ID)", type: "text", required: true },
            { key: "title_en", label: "Title (EN)", type: "text", required: true },
            { key: "desc_id", label: "Deskripsi (ID)", type: "textarea", required: true },
            { key: "desc_en", label: "Description (EN)", type: "textarea", required: true },
            { key: "order", label: "Urutan", type: "number" },
        ],
    },
};
