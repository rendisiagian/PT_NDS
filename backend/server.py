"""
PT. NURI DWI SUKSES - Company Website Backend
FastAPI + MongoDB + JWT Authentication
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import uuid
import logging
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
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
ACCESS_TOKEN_MIN = 60 * 24  # 24 hours for admin convenience

app = FastAPI(title="PT. NURI DWI SUKSES API", version="1.0.0")
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


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value[:80] or str(uuid.uuid4())[:8]


def doc_iso(d: dict) -> dict:
    """Convert datetime fields to ISO strings for storage."""
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
# Routes - Public
# -----------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {
        "company": "PT. NURI DWI SUKSES",
        "status": "online",
        "version": "1.0.0",
    }


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
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=ACCESS_TOKEN_MIN * 60,
        path="/",
    )
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name", "Admin"),
            "role": user.get("role", "admin"),
        },
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


# -----------------------------------------------------------------------------
# Startup: indexes + seed admin + seed initial blog content
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


@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.inquiries.create_index("id", unique=True)
    await db.inquiries.create_index([("created_at", -1)])
    await db.blog_posts.create_index("id", unique=True)
    await db.blog_posts.create_index("slug", unique=True)

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

    # Seed initial blog posts (only if none exist)
    count = await db.blog_posts.count_documents({})
    if count == 0:
        for p in INITIAL_POSTS:
            slug = slugify(p["title_en"])
            post = BlogPost(slug=slug, **p)
            await db.blog_posts.insert_one(doc_iso(post.model_dump()))
        logger.info(f"Seeded {len(INITIAL_POSTS)} initial blog posts")


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
