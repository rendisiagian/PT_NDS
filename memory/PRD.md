# PT. NURI DWI SUKSES — Company Website PRD

## Original Problem Statement
> "Ini adalah company profile perusahaan saya. Saya ingin kamu buatkan saya website perusahaan menggunakan style MD seperti yang saya lampirkan. Saya juga ingin kamu kembangkan lebih jauh lagi agar website ini dapat dilirik bagi banyak orang. Gunakan kalimat yang secara profesional dan perhatikan SEO nya."

## User Choices Confirmed
- Language: **Bilingual** (Bahasa Indonesia + English toggle)
- Pages: Home, About, Services, Machines, Portfolio, Blog, Contact (all)
- Contact: **Store in MongoDB + admin panel** (not just mailto)
- Design: Meta design system (from `DESIGN.md` attachment)
- Logo: Recreated from PDF (NR mark, blue ring + orange sunburst + monogram)

## Architecture
- **Frontend**: React 19, React Router 7, Tailwind, Manrope font, shadcn/ui primitives.
- **Backend**: FastAPI, MongoDB (motor), JWT auth (PyJWT), bcrypt password hashing.
- **Auth**: Single seeded admin from `.env`; protected `/api/admin/*` endpoints.

## Implemented (2025-12)
### Frontend (Meta-style design system)
- Bilingual content via `LanguageContext` (`id` / `en`), persistent to localStorage
- Pages: Home, About, Services, Machines, Portfolio, Blog (list + detail), Contact
- Admin: Login + Dashboard (inquiries tab + blog CRUD tab)
- Navbar with pill-tab navigation + language toggle + mobile drawer
- Promo banner (dark, sticky above nav)
- Footer with company/services/resources columns
- SEO: dynamic `<title>`, meta description, Open Graph, Twitter cards, canonical, JSON-LD Organization schema, semantic HTML, `lang` attribute update
- Custom SVG logo (NR mark) component
- Photographic feature cards (rounded-4xl), pill buttons (black for marketing, cobalt for commerce/contact)

### Backend
- JWT auth with httpOnly cookie + Bearer header fallback
- Admin seeded from `.env` on startup (idempotent + auto-rehash on password change)
- `POST /api/contact` (public) — stores inquiry in MongoDB
- `GET /api/blog`, `GET /api/blog/{slug}` (public)
- `GET /api/stats` (public)
- Admin CRUD: `/api/admin/inquiries` (list, mark-read, delete), `/api/admin/blog` (list, create, update, delete)
- Slug auto-generation with collision suffix
- 3 initial bilingual blog posts seeded on first start

### Testing
- 24/24 backend pytest tests passed (auth, public, admin protected/unprotected, slug collision, validation)
- Frontend Home + Contact + Admin Login pages screenshot-verified

## Test Credentials
See `/app/memory/test_credentials.md`
- Admin email: `admin@nuridwisukses.co.id`
- Admin password: `NuriAdmin2024!`

## Backlog (P1/P2 — Deferred)
- **P1** Add real client logos & portfolio case studies once provided
- **P1** Hook up Google Analytics / GA4 for SEO traffic tracking
- **P1** Generate `sitemap.xml` and `robots.txt` for search engines
- **P2** Add WhatsApp / Instagram / phone contact (user said "nanti ditambahkan")
- **P2** Rate-limit + honeypot on `/api/contact` to deter spam
- **P2** Brute-force lockout on `/api/auth/login` (5-fail → 15 min)
- **P2** Replace `CORS_ORIGINS="*"` with explicit origins in production
- **P2** Email notification (e.g., Resend / SMTP) to forward inquiries to `nuridwisukses07@gmail.com`
- **P2** Image upload for blog covers (instead of pasted URLs)
- **P2** PDF brochure download CTA
- **P2** Replace stock Unsplash images with real factory photography
