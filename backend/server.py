"""
PT. NURI DWI SUKSES - Company Website Backend
FastAPI + MongoDB + JWT Authentication + CMS
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import base64
import logging
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Any, Dict

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File
from fastapi.responses import Response as FastAPIResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr


# -----------------------------------------------------------------------------
# Config & DB
# -----------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60 * 24

app = FastAPI(title="PT. NURI DWI SUKSES API", version="2.0.0")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("nuri")


# -----------------------------------------------------------------------------
# Auth helpers
# -----------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def slugify(value: str) -> str:
    value = (value or "").lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value[:80] or str(uuid.uuid4())[:8]


def doc_iso(d: dict) -> dict:
    out = dict(d)
    for k, v in out.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
    return out


def parse_dates(d: dict, fields: List[str]) -> dict:
    for f in fields:
        if f in d and isinstance(d[f], str):
            try:
                d[f] = datetime.fromisoformat(d[f])
            except Exception:
                pass
    return d


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class ContactInquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=160)
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=5, max_length=4000)


class ContactInquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BlogPostCreate(BaseModel):
    title_id: str = Field(min_length=2, max_length=240)
    title_en: str = Field(min_length=2, max_length=240)
    excerpt_id: str = Field(max_length=600)
    excerpt_en: str = Field(max_length=600)
    content_id: str
    content_en: str
    cover_image: Optional[str] = None
    tags: List[str] = []
    published: bool = True


class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title_id: str
    title_en: str
    excerpt_id: str
    excerpt_en: str
    content_id: str
    content_en: str
    cover_image: Optional[str] = None
    tags: List[str] = []
    published: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SiteSettingUpdate(BaseModel):
    value: Any


class CollectionItem(BaseModel):
    """Flexible collection item — fields vary per collection name."""
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order: int = 0


# -----------------------------------------------------------------------------
# Collections registry (allowlist + simple validation)
# -----------------------------------------------------------------------------
ALLOWED_COLLECTIONS = {
    "services",
    "machines",
    "machine_specs",
    "portfolio_sectors",
    "testimonials",
    "process_steps",
    "values",
}


# -----------------------------------------------------------------------------
# Routes - Public
# -----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"company": "PT. NURI DWI SUKSES", "status": "online", "version": "2.0.0"}


@api_router.get("/stats")
async def public_stats():
    return {
        "founded": "2023-05-22",
        "years_active": max(1, datetime.now(timezone.utc).year - 2023),
        "machines": 3,
        "service_area": "Indonesia",
    }


# ---- Contact ----------------------------------------------------------------
@api_router.post("/contact", response_model=ContactInquiry)
async def submit_inquiry(payload: ContactInquiryCreate):
    inquiry = ContactInquiry(**payload.model_dump())
    await db.inquiries.insert_one(doc_iso(inquiry.model_dump()))
    logger.info(f"New inquiry from {inquiry.email}: {inquiry.subject}")
    return inquiry


# ---- Blog (public) ----------------------------------------------------------
@api_router.get("/blog", response_model=List[BlogPost])
async def list_published_posts():
    cursor = db.blog_posts.find({"published": True}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(200)
    for d in docs:
        parse_dates(d, ["created_at", "updated_at"])
    return docs


@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    parse_dates(doc, ["created_at", "updated_at"])
    return doc


# ---- Site Settings & Collections (public read) -----------------------------
@api_router.get("/site/settings")
async def get_settings():
    cursor = db.site_settings.find({}, {"_id": 0})
    docs = await cursor.to_list(1000)
    return {d["key"]: d.get("value") for d in docs}


@api_router.get("/site/collections/{name}")
async def get_collection(name: str):
    if name not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    coll_name = f"cms_{name}"
    cursor = db[coll_name].find({}, {"_id": 0}).sort("order", 1)
    return await cursor.to_list(1000)


@api_router.get("/site/all")
async def get_all_site_content():
    """One-shot fetch of everything dynamic. Used by the frontend on load."""
    settings_cursor = db.site_settings.find({}, {"_id": 0})
    settings_docs = await settings_cursor.to_list(1000)
    settings = {d["key"]: d.get("value") for d in settings_docs}

    collections: Dict[str, List[dict]] = {}
    for name in ALLOWED_COLLECTIONS:
        cursor = db[f"cms_{name}"].find({}, {"_id": 0}).sort("order", 1)
        collections[name] = await cursor.to_list(1000)

    return {"settings": settings, "collections": collections}


# ---- Media (public read) ----------------------------------------------------
@api_router.get("/media/{media_id}")
async def get_media(media_id: str):
    doc = await db.media.find_one({"id": media_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Media not found")
    try:
        data = base64.b64decode(doc["data_base64"])
    except Exception:
        raise HTTPException(status_code=500, detail="Corrupt media")
    headers = {"Cache-Control": "public, max-age=31536000, immutable"}
    return FastAPIResponse(content=data, media_type=doc.get("mime", "application/octet-stream"), headers=headers)


# -----------------------------------------------------------------------------
# Routes - Auth
# -----------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=False,
        samesite="lax", max_age=ACCESS_TOKEN_MIN * 60, path="/",
    )
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserPublic)
async def me(current_admin: dict = Depends(get_current_admin)):
    return UserPublic(**current_admin)


# -----------------------------------------------------------------------------
# Routes - Admin (protected)
# -----------------------------------------------------------------------------
# ---- Inquiries -------------------------------------------------------------
@api_router.get("/admin/inquiries", response_model=List[ContactInquiry])
async def list_inquiries(current_admin: dict = Depends(get_current_admin)):
    cursor = db.inquiries.find({}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    for d in docs:
        parse_dates(d, ["created_at"])
    return docs


@api_router.patch("/admin/inquiries/{inquiry_id}/read")
async def mark_read(inquiry_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"is_read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"ok": True}


@api_router.delete("/admin/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await db.inquiries.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"ok": True}


# ---- Blog ------------------------------------------------------------------
@api_router.get("/admin/blog", response_model=List[BlogPost])
async def admin_list_posts(current_admin: dict = Depends(get_current_admin)):
    cursor = db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    for d in docs:
        parse_dates(d, ["created_at", "updated_at"])
    return docs


@api_router.post("/admin/blog", response_model=BlogPost)
async def admin_create_post(payload: BlogPostCreate, current_admin: dict = Depends(get_current_admin)):
    base_slug = slugify(payload.title_en or payload.title_id)
    slug = base_slug
    suffix = 1
    while await db.blog_posts.find_one({"slug": slug}):
        suffix += 1
        slug = f"{base_slug}-{suffix}"
    post = BlogPost(slug=slug, **payload.model_dump())
    await db.blog_posts.insert_one(doc_iso(post.model_dump()))
    return post


@api_router.put("/admin/blog/{post_id}", response_model=BlogPost)
async def admin_update_post(post_id: str, payload: BlogPostCreate, current_admin: dict = Depends(get_current_admin)):
    existing = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    updated = {**existing, **payload.model_dump(), "updated_at": datetime.now(timezone.utc).isoformat()}
    await db.blog_posts.update_one({"id": post_id}, {"$set": updated})
    parse_dates(updated, ["created_at", "updated_at"])
    return updated


@api_router.delete("/admin/blog/{post_id}")
async def admin_delete_post(post_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"ok": True}


# ---- Site Settings (key/value) ---------------------------------------------
@api_router.get("/admin/site/settings")
async def admin_get_settings(current_admin: dict = Depends(get_current_admin)):
    cursor = db.site_settings.find({}, {"_id": 0})
    docs = await cursor.to_list(1000)
    return {d["key"]: d.get("value") for d in docs}


@api_router.put("/admin/site/settings/{key}")
async def admin_update_setting(key: str, payload: SiteSettingUpdate, current_admin: dict = Depends(get_current_admin)):
    if not re.match(r"^[a-z][a-z0-9_]{0,80}$", key):
        raise HTTPException(status_code=400, detail="Invalid setting key")
    await db.site_settings.update_one(
        {"key": key},
        {"$set": {"key": key, "value": payload.value, "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True, "key": key, "value": payload.value}


# ---- Generic Collections CRUD ---------------------------------------------
@api_router.get("/admin/collections/{name}")
async def admin_list_collection(name: str, current_admin: dict = Depends(get_current_admin)):
    if name not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    cursor = db[f"cms_{name}"].find({}, {"_id": 0}).sort("order", 1)
    return await cursor.to_list(1000)


@api_router.post("/admin/collections/{name}")
async def admin_create_item(name: str, payload: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    if name not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    item = {**payload}
    item["id"] = str(uuid.uuid4())
    item.setdefault("order", 0)
    item["created_at"] = datetime.now(timezone.utc).isoformat()
    item["updated_at"] = item["created_at"]
    await db[f"cms_{name}"].insert_one(item)
    item.pop("_id", None)
    return item


@api_router.put("/admin/collections/{name}/{item_id}")
async def admin_update_item(name: str, item_id: str, payload: Dict[str, Any], current_admin: dict = Depends(get_current_admin)):
    if name not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    update = {k: v for k, v in payload.items() if k not in ("id", "_id", "created_at")}
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db[f"cms_{name}"].update_one({"id": item_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    doc = await db[f"cms_{name}"].find_one({"id": item_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/collections/{name}/{item_id}")
async def admin_delete_item(name: str, item_id: str, current_admin: dict = Depends(get_current_admin)):
    if name not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    result = await db[f"cms_{name}"].delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


# ---- Media ------------------------------------------------------------------
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}


@api_router.post("/admin/media")
async def admin_upload_media(file: UploadFile = File(...), current_admin: dict = Depends(get_current_admin)):
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File terlalu besar (maks 5MB)")
    mime = file.content_type or "application/octet-stream"
    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Tipe file tidak didukung: {mime}")
    media_id = str(uuid.uuid4())
    doc = {
        "id": media_id,
        "filename": file.filename,
        "mime": mime,
        "size": len(contents),
        "data_base64": base64.b64encode(contents).decode("utf-8"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.media.insert_one(doc)
    return {"id": media_id, "url": f"/api/media/{media_id}", "filename": file.filename, "size": len(contents), "mime": mime}


@api_router.get("/admin/media")
async def admin_list_media(current_admin: dict = Depends(get_current_admin)):
    cursor = db.media.find({}, {"_id": 0, "data_base64": 0}).sort("created_at", -1)
    docs = await cursor.to_list(500)
    return [{**d, "url": f"/api/media/{d['id']}"} for d in docs]


@api_router.delete("/admin/media/{media_id}")
async def admin_delete_media(media_id: str, current_admin: dict = Depends(get_current_admin)):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"ok": True}


# -----------------------------------------------------------------------------
# Seed data
# -----------------------------------------------------------------------------
INITIAL_POSTS = [
    {
        "title_id": "Mengenal Plat Polymer untuk Percetakan Modern",
        "title_en": "Understanding Polymer Plates for Modern Printing",
        "excerpt_id": "Plat polymer adalah komponen krusial dalam industri percetakan modern. Pelajari mengapa kualitas plat menentukan hasil cetak Anda.",
        "excerpt_en": "Polymer plates are a critical component in modern printing. Learn why plate quality determines your final print result.",
        "content_id": "Plat polymer modern menggabungkan presisi optik tinggi dengan ketahanan mekanik. Di PT. NURI DWI SUKSES, setiap plat diproses dengan mesin CTP CRON HDI-920 S+ untuk memastikan resolusi tinggi dan ketajaman titik raster yang konsisten. Plat berkualitas mengurangi waste, mempercepat make-ready, dan menghasilkan cetakan yang lebih tajam pada berbagai substrat — dari karton lipat sampai label fleksibel.",
        "content_en": "Modern polymer plates combine high optical precision with mechanical durability. At PT. NURI DWI SUKSES, every plate is processed with the CRON HDI-920 S+ CTP machine to ensure high resolution and consistent dot sharpness. Quality plates reduce waste, speed up make-ready, and produce sharper prints on a wide range of substrates — from folding cartons to flexible labels.",
        "tags": ["polymer", "printing", "quality"],
        "cover_image": "https://images.unsplash.com/photo-1601225998165-1be25cfd5d97?auto=format&fit=crop&w=1600&q=80",
    },
    {
        "title_id": "Computer-to-Plate (CTP): Kenapa Penting?",
        "title_en": "Computer-to-Plate (CTP): Why It Matters",
        "excerpt_id": "Teknologi CTP menggantikan output film tradisional dan memberi efisiensi serta presisi yang jauh lebih tinggi.",
        "excerpt_en": "CTP technology replaces traditional film output and delivers far higher efficiency and precision.",
        "content_id": "Computer-to-Plate (CTP) memungkinkan transfer gambar langsung dari komputer ke plat polymer menggunakan laser. Hasilnya: waktu produksi lebih singkat, registrasi warna lebih akurat, dan biaya consumable lebih rendah. Mesin CRON HDI-920 S+ yang kami gunakan dikenal stabil untuk produksi volume tinggi.",
        "content_en": "Computer-to-Plate (CTP) enables direct image transfer from computer to polymer plate using laser. The result: shorter production time, more accurate color registration, and lower consumable cost. The CRON HDI-920 S+ machine we use is known for stable, high-volume production.",
        "tags": ["ctp", "technology", "efficiency"],
        "cover_image": "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&w=1600&q=80",
    },
    {
        "title_id": "Waterwash vs Solvent: Mana yang Lebih Baik?",
        "title_en": "Waterwash vs Solvent: Which is Better?",
        "excerpt_id": "Pemilihan metode pencucian plat polymer berdampak pada kualitas cetak, lingkungan, dan biaya operasional.",
        "excerpt_en": "Choosing the polymer plate washing method impacts print quality, environmental footprint, and operational cost.",
        "content_id": "Kami mengoperasikan dua jalur pencucian: waterwash (berbasis air) dan solvent. Waterwash lebih ramah lingkungan dan cocok untuk sebagian besar pekerjaan komersial. Solvent memberi pembersihan lebih agresif untuk plat tertentu yang membutuhkan reslief lebih dalam. Tim kami memilih metode yang tepat untuk kebutuhan setiap klien.",
        "content_en": "We operate two washing lines: waterwash (water-based) and solvent. Waterwash is more eco-friendly and suitable for most commercial work. Solvent offers more aggressive cleaning for plates requiring deeper relief. Our team selects the right method for each client's needs.",
        "tags": ["waterwash", "solvent", "sustainability"],
        "cover_image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
    },
]


SEED_SETTINGS = {
    # Home hero
    "hero_badge": {"id": "Sejak 22 Mei 2023", "en": "Since May 22, 2023"},
    "hero_title": {"id": "Plat polymer presisi. Untuk percetakan yang menuntut hasil sempurna.", "en": "Precision polymer plates. For printers who demand perfect results."},
    "hero_sub": {"id": "Tepat. Cepat. Terukur. Kami memproses plat polymer dengan teknologi Computer-to-Plate (CTP) modern untuk hasil cetak yang konsisten setiap kali.", "en": "Accurate. Fast. Measurable. We process polymer plates with modern Computer-to-Plate (CTP) technology for consistent print quality, every time."},
    "hero_image": {"url": ""},
    "site_logo": {"url": "/logo_nds.jpg"},
    # CTA banner
    "cta_banner_title": {"id": "Siap menaikkan kualitas cetak Anda?", "en": "Ready to raise your print quality?"},
    "cta_banner_body": {"id": "Diskusikan kebutuhan plat polymer Anda dengan tim kami. Konsultasi gratis.", "en": "Discuss your polymer plate needs with our team. Free consultation."},
    "cta_banner_btn": {"id": "Mulai konsultasi", "en": "Start a conversation"},
    # Promo banner
    "promo_text": {"id": "Mitra plat polymer terpercaya untuk percetakan modern Indonesia", "en": "Trusted polymer plate partner for modern Indonesian printing"},
    "promo_cta": {"id": "Hubungi kami", "en": "Get in touch"},
    # About
    "about_title": {"id": "Dibangun untuk percetakan Indonesia.", "en": "Built for Indonesia's printing industry."},
    "about_sub": {"id": "PT. NURI DWI SUKSES didirikan pada 22 Mei 2023 dengan satu fokus: menjadi penyedia jasa pengadaan plat polymer yang konsisten, presisi, dan dapat diandalkan untuk industri percetakan nasional.", "en": "PT. NURI DWI SUKSES was founded on May 22, 2023 with one focus: to be a consistent, precise, and reliable polymer plate procurement partner for the national printing industry."},
    "ceo_name": {"value": "Daud Sinurat"},
    "ceo_role": {"id": "CEO, PT. NURI DWI SUKSES", "en": "CEO, PT. NURI DWI SUKSES"},
    "kata_sambutan_id": {"value": [
        "PT. NURI DWI SUKSES merupakan perusahaan yang bergerak di bidang usaha jasa pengadaan plat polymer untuk percetakan yang didukung oleh tim management dan operasional yang mempunyai pengalaman, keahlian dan dedikasi yang sangat luar biasa di bidang masing-masing.",
        "Dengan kepercayaan bahwa semua masalah atau issue yang muncul merupakan sebuah tantangan yang harus segera diselesaikan dan merupakan bagian dari tanggung jawab terhadap klien perusahaan.",
        "Melalui PT. NURI DWI SUKSES, kami akan terus mengembangkan inovasi meningkatkan kualitas serta mutu pelayanan dengan menerapkan sistem kerja yang tepat, cepat, terukur, efisien dan efektif pada setiap pelayanan yang kami berikan.",
        "Sehingga poin penting kami adalah menjaga kepercayaan dan kepuasan klien perusahaan melalui mutu dan kualitas pelayanan yang terbaik dari PT. NURI DWI SUKSES.",
        "Akhir kata dari kami berharap PT. NURI DWI SUKSES turut dapat membangun Tanah Air Indonesia dan menjadi salah satu perusahaan terbaik di dalam bidang pelayanan dan kinerja, serta produk Indonesia.",
    ]},
    "kata_sambutan_en": {"value": [
        "PT. NURI DWI SUKSES is a company engaged in polymer plate procurement services for the printing industry, supported by a management and operational team with extraordinary experience, expertise, and dedication in their respective fields.",
        "With the belief that any issue is a challenge to be addressed immediately and is part of our responsibility to our clients.",
        "Through PT. NURI DWI SUKSES, we will continue to innovate and improve the quality of our services by applying work systems that are accurate, fast, measurable, efficient, and effective in every service we deliver.",
        "Our key point is to maintain client trust and satisfaction through the best service quality from PT. NURI DWI SUKSES.",
        "Finally, we hope that PT. NURI DWI SUKSES can also contribute to building Indonesia and become one of the best companies in service, performance, and Indonesian-made products.",
    ]},
    "vision_text": {"id": "PT. NURI DWI SUKSES akan menjadi salah satu perusahaan jasa pengadaan plat polymer terbaik dengan menekankan pada pelayanan dan kualitas.", "en": "PT. NURI DWI SUKSES will become one of the best polymer plate procurement companies, emphasizing service and quality."},
    "mission_id": {"value": [
        "Meningkatkan daya saing perusahaan dalam jasa pengadaan plat polymer dengan mengembangkan pelayanan dan kualitas terbaik kepada konsumen.",
        "Meningkatkan pelatihan SDM untuk menghasilkan tenaga yang berkualitas dan menciptakan lingkungan kerja yang kondusif, serta menyediakan lapangan kerja yang luas.",
    ]},
    "mission_en": {"value": [
        "Increase company competitiveness in polymer plate procurement services by developing the best service and quality for consumers.",
        "Enhance HR training to produce quality personnel and create a conducive work environment, as well as provide broad employment opportunities.",
    ]},
    # Services page
    "services_title": {"id": "Jasa pengadaan plat polymer end-to-end.", "en": "End-to-end polymer plate procurement."},
    "services_sub": {"id": "Kami menangani seluruh siklus pengadaan plat — dari penerimaan file siap cetak, imaging CTP, pencucian, sampai pengiriman tepat waktu ke percetakan Anda.", "en": "We handle the full plate procurement cycle — from print-ready file intake, CTP imaging, washing, to on-time delivery to your press floor."},
    # Machines page
    "machines_title": {"id": "Teknologi yang menopang setiap plat.", "en": "The technology behind every plate."},
    "machines_sub": {"id": "Kami berinvestasi pada mesin-mesin yang dirancang untuk volume produksi tinggi tanpa kompromi kualitas.", "en": "We invest in machines built for high-volume production without compromising quality."},
    # Portfolio
    "portfolio_title": {"id": "Dipercaya percetakan yang menuntut hasil konsisten.", "en": "Trusted by printers who demand consistent results."},
    "portfolio_sub": {"id": "Setiap pekerjaan adalah komitmen kepada klien. Berikut beberapa kategori industri yang kami layani.", "en": "Every job is a commitment. Below are the industries we serve."},
    # Contact info
    "contact_title": {"id": "Mari diskusikan kebutuhan plat Anda.", "en": "Let's discuss your plate needs."},
    "contact_sub": {"id": "Tim kami siap memberikan konsultasi spesifikasi dan penawaran yang sesuai dengan kebutuhan percetakan Anda.", "en": "Our team is ready to provide specification consulting and quotes tailored to your printing operation."},
    "contact_address": {"id": "Jalan Rawa Indah No.12 Rt 04/03, Kel. Suka Asih, Kec. Pasar Kemis, Kab. Tangerang — Banten 15560", "en": "Jalan Rawa Indah No.12 Rt 04/03, Kel. Suka Asih, Kec. Pasar Kemis, Kab. Tangerang — Banten 15560"},
    "contact_email": {"value": "nuridwisukses07@gmail.com"},
    "contact_phone": {"value": ""},
    "contact_whatsapp": {"value": ""},
    "contact_instagram": {"value": ""},
    "contact_hours": {"id": "Senin – Sabtu, 08.00 – 17.00 WIB", "en": "Monday – Saturday, 08:00 – 17:00 WIB"},
    "contact_maps_query": {"value": "Pasar Kemis Tangerang Banten"},
    "contact_map_lat": {"value": ""},
    "contact_map_lng": {"value": ""},
}


SEED_COLLECTIONS = {
    "services": [
        {"icon": "FileCheck2", "title_id": "Imaging CTP (Computer-to-Plate)", "title_en": "CTP Imaging", "desc_id": "Transfer gambar langsung dari file digital ke plat polymer menggunakan laser presisi tinggi. Tidak lagi membutuhkan output film tradisional.", "desc_en": "Direct image transfer from your digital file to polymer plate using high-precision laser. No traditional film output needed."},
        {"icon": "Droplets", "title_id": "Pencucian Waterwash", "title_en": "Waterwash Cleaning", "desc_id": "Pencucian plat berbasis air yang ramah lingkungan dan menghasilkan permukaan plat yang bersih dan stabil.", "desc_en": "Water-based plate washing — eco-friendly with a clean, stable plate surface."},
        {"icon": "Beaker", "title_id": "Pencucian Solvent", "title_en": "Solvent Cleaning", "desc_id": "Untuk pekerjaan dengan permintaan relief mendalam atau plat dengan karakteristik khusus, kami menyediakan jalur solvent terpisah.", "desc_en": "For jobs requiring deeper relief or specialty plates, we maintain a separate solvent line."},
        {"icon": "Layers3", "title_id": "Konsultasi Spesifikasi Plat", "title_en": "Plate Specification Consulting", "desc_id": "Tim kami membantu menentukan jenis plat, ketebalan, dan parameter imaging yang paling sesuai dengan mesin cetak Anda.", "desc_en": "Our team helps you choose the plate type, thickness, and imaging parameters that match your press."},
        {"icon": "Truck", "title_id": "Pengiriman Terjadwal", "title_en": "Scheduled Delivery", "desc_id": "Distribusi plat ke percetakan di Tangerang, Jabodetabek, dan sekitarnya dengan komitmen jadwal yang jelas.", "desc_en": "Plate distribution to printers in Tangerang, Jabodetabek and beyond — with clear schedule commitment."},
        {"icon": "Search", "title_id": "Quality Control Setiap Plat", "title_en": "QC on Every Plate", "desc_id": "Pemeriksaan visual dan dimensional pada setiap plat sebelum dilepas ke pelanggan untuk mengurangi waste di sisi cetak.", "desc_en": "Visual and dimensional check on every plate before release to reduce press-side waste."},
    ],
    "machines": [
        {"badge_id": "Computer-to-Plate", "badge_en": "Computer-to-Plate", "title_id": "CRON HDI-920 S+ — CTP", "title_en": "CRON HDI-920 S+ — CTP", "desc_id": "Mesin Computer-to-Plate yang mengeksposisi gambar langsung dari komputer ke plat polymer menggunakan laser. Memberikan resolusi tinggi, registrasi akurat, dan kestabilan produksi untuk percetakan komersial dan packaging.", "desc_en": "Computer-to-Plate machine that exposes the image directly from computer to polymer plate using laser. Delivers high resolution, accurate registration, and production stability for commercial and packaging printing.", "image": "https://images.unsplash.com/photo-1530982011887-3cc11cc85693?auto=format&fit=crop&w=1600&q=80"},
        {"badge_id": "Eco-friendly", "badge_en": "Eco-friendly", "title_id": "Mesin Waterwash — Berbasis Air", "title_en": "Waterwash Machine — Water-based", "desc_id": "Mencuci plat polymer menggunakan air. Lebih ramah lingkungan, mengurangi penggunaan solvent, dan menghasilkan permukaan plat yang bersih untuk hasil cetak yang konsisten.", "desc_en": "Washes polymer plates using water. More environmentally friendly, reduces solvent use, and produces a clean plate surface for consistent print results.", "image": "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80"},
        {"badge_id": "Deep relief", "badge_en": "Deep relief", "title_id": "Mesin Waterwash — Berbasis Solvent", "title_en": "Waterwash Machine — Solvent", "desc_id": "Jalur pencucian dengan solvent untuk plat yang membutuhkan relief lebih dalam atau karakteristik khusus. Hasil cetak yang lebih tajam pada substrat tertentu.", "desc_en": "Solvent washing line for plates that require deeper relief or specialty characteristics. Sharper results on specific substrates.", "image": "https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=1600&q=80"},
    ],
    "machine_specs": [
        {"key_id": "Jenis plat", "key_en": "Plate type", "value_id": "Polymer untuk percetakan flexo & letterpress", "value_en": "Polymer for flexo & letterpress printing"},
        {"key_id": "Teknologi imaging", "key_en": "Imaging technology", "value_id": "Laser CTP (Computer-to-Plate)", "value_en": "Laser CTP (Computer-to-Plate)"},
        {"key_id": "Metode pencucian", "key_en": "Washing method", "value_id": "Waterwash (air) & Solvent", "value_en": "Waterwash (water) & Solvent"},
        {"key_id": "Volume harian", "key_en": "Daily volume", "value_id": "Skalabel sesuai kebutuhan klien", "value_en": "Scalable to client demand"},
        {"key_id": "Quality control", "key_en": "Quality control", "value_id": "Visual & dimensional pada setiap plat", "value_en": "Visual & dimensional on every plate"},
    ],
    "portfolio_sectors": [
        {"title_id": "Percetakan Komersial", "title_en": "Commercial Printing", "desc_id": "Brosur, katalog, dan materi pemasaran dengan kualitas warna yang konsisten.", "desc_en": "Brochures, catalogs, and marketing collateral with consistent color quality."},
        {"title_id": "Packaging Karton", "title_en": "Carton Packaging", "desc_id": "Plat untuk kotak lipat, label primer, dan packaging consumer goods.", "desc_en": "Plates for folding cartons, primary labels, and consumer goods packaging."},
        {"title_id": "Label Industri", "title_en": "Industrial Labels", "desc_id": "Label fleksibel dengan permintaan presisi tinggi dan volume tinggi.", "desc_en": "Flexible labels with high-precision, high-volume requirements."},
        {"title_id": "Cetak Buku & Edukasi", "title_en": "Book & Educational Printing", "desc_id": "Plat untuk buku teks, majalah, dan materi pendidikan.", "desc_en": "Plates for textbooks, magazines, and educational materials."},
        {"title_id": "Cetak Sekuriti", "title_en": "Security Printing", "desc_id": "Dukungan plat untuk kebutuhan dokumen sekuriti yang menuntut presisi.", "desc_en": "Plate support for security documents requiring precision."},
        {"title_id": "Cetak Promosi", "title_en": "Promotional Printing", "desc_id": "Material promosi point-of-sale dengan jadwal yang ketat.", "desc_en": "Point-of-sale promotional materials on tight schedules."},
    ],
    "testimonials": [
        {"quote_id": "Plat yang kami terima konsisten dari batch ke batch. Itu yang paling penting buat produksi kami.", "quote_en": "The plates we receive are consistent batch to batch. That's what matters most for our production.", "name": "Manajer Produksi", "role_id": "Percetakan Komersial, Tangerang", "role_en": "Commercial Printer, Tangerang"},
        {"quote_id": "Tim NURI responsif dan paham kebutuhan kami. Jadwal terjaga, dan komunikasinya jelas.", "quote_en": "The NURI team is responsive and understands our needs. Schedules are kept, and communication is clear.", "name": "Direktur Operasional", "role_id": "Percetakan Packaging", "role_en": "Packaging Printer"},
    ],
    "process_steps": [
        {"title_id": "Terima file", "title_en": "Receive file", "desc_id": "Anda kirim file siap cetak (PDF/TIFF) lewat kanal yang disepakati.", "desc_en": "You send a print-ready PDF/TIFF through the agreed channel."},
        {"title_id": "Pra-pemrosesan", "title_en": "Pre-processing", "desc_id": "Kami verifikasi separasi, raster, dan parameter imaging.", "desc_en": "We verify separations, raster, and imaging parameters."},
        {"title_id": "Imaging CTP", "title_en": "CTP imaging", "desc_id": "Plat polymer diekspos dengan laser pada mesin CRON HDI-920 S+.", "desc_en": "Polymer plate exposed by laser on the CRON HDI-920 S+."},
        {"title_id": "Pencucian", "title_en": "Washing", "desc_id": "Plat dicuci pada jalur waterwash atau solvent sesuai kebutuhan.", "desc_en": "Plate is washed on the waterwash or solvent line as required."},
        {"title_id": "QC & pengiriman", "title_en": "QC & delivery", "desc_id": "Pemeriksaan akhir lalu pengantaran terjadwal ke percetakan Anda.", "desc_en": "Final check, then scheduled delivery to your press."},
    ],
    "values": [
        {"title_id": "Tepat", "title_en": "Accurate", "desc_id": "Setiap pekerjaan dikerjakan dengan presisi sesuai standar.", "desc_en": "Every job is executed with precision to standard."},
        {"title_id": "Cepat", "title_en": "Fast", "desc_id": "Alur kerja yang efisien menjaga jadwal produksi klien.", "desc_en": "Efficient workflow protects your production schedule."},
        {"title_id": "Terukur", "title_en": "Measurable", "desc_id": "Hasil yang konsisten dan dapat dipertanggungjawabkan.", "desc_en": "Consistent, accountable results."},
        {"title_id": "Efektif", "title_en": "Effective", "desc_id": "Solusi yang tepat sasaran untuk setiap kebutuhan cetak.", "desc_en": "Right-sized solutions for every printing need."},
    ],
}


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)
    await db.inquiries.create_index([("created_at", -1)])
    await db.blog_posts.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.site_settings.create_index("key", unique=True)
    await db.media.create_index("id", unique=True)
    for name in ALLOWED_COLLECTIONS:
        await db[f"cms_{name}"].create_index("id", unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@nuridwisukses.co.id").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "NuriAdmin2024!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Administrator",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for: {admin_email}")

    # Seed blog (only if none exist)
    if await db.blog_posts.count_documents({}) == 0:
        for p in INITIAL_POSTS:
            slug = slugify(p["title_en"])
            post = BlogPost(slug=slug, **p)
            await db.blog_posts.insert_one(doc_iso(post.model_dump()))
        logger.info(f"Seeded {len(INITIAL_POSTS)} initial blog posts")

    # Seed site_settings (only missing keys — non-destructive)
    now_iso = datetime.now(timezone.utc).isoformat()
    for key, value in SEED_SETTINGS.items():
        existing_setting = await db.site_settings.find_one({"key": key})
        if existing_setting is None:
            await db.site_settings.insert_one({"key": key, "value": value, "updated_at": now_iso})
    logger.info("Seeded site_settings")

    # Seed CMS collections (only if collection is empty)
    for name, items in SEED_COLLECTIONS.items():
        coll = db[f"cms_{name}"]
        if await coll.count_documents({}) == 0:
            for idx, item in enumerate(items):
                doc = {**item, "id": str(uuid.uuid4()), "order": idx, "created_at": now_iso, "updated_at": now_iso}
                await coll.insert_one(doc)
            logger.info(f"Seeded collection cms_{name}: {len(items)} items")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# -----------------------------------------------------------------------------
# Mount router & CORS
# -----------------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
