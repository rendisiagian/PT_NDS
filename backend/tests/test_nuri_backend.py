"""
PT. NURI DWI SUKSES - Backend regression tests
Covers: public endpoints, auth (login/me/logout), contact inquiries,
blog (public + admin CRUD), and admin inquiries management.
"""
import os
import uuid
import requests
import pytest

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@nuridwisukses.co.id"
ADMIN_PASSWORD = "NuriAdmin2024!"


# ------------------------- Fixtures -------------------------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json().get("token")


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ------------------------- Public endpoints -------------------------
class TestPublic:
    def test_root(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data["company"] == "PT. NURI DWI SUKSES"
        assert data["status"] == "online"
        assert "version" in data

    def test_stats(self, api_client):
        r = api_client.get(f"{API}/stats")
        assert r.status_code == 200
        data = r.json()
        assert data["founded"] == "2023-05-22"
        assert isinstance(data["years_active"], int) and data["years_active"] >= 1
        assert data["machines"] == 3
        assert data["service_area"] == "Indonesia"


# ------------------------- Contact -------------------------
class TestContact:
    def test_submit_valid_inquiry(self, api_client):
        payload = {
            "name": "TEST_John Doe",
            "email": "test_john@example.com",
            "phone": "+628123456789",
            "company": "Acme Print",
            "subject": "Need polymer plates",
            "message": "Hi, I need a quote for polymer plates for our flexo line.",
        }
        r = api_client.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == payload["email"]
        assert data["name"] == payload["name"]
        assert data["subject"] == payload["subject"]
        assert data["is_read"] is False
        assert isinstance(data["id"], str) and len(data["id"]) > 0
        # store id for cleanup via class scope
        TestContact._created_id = data["id"]

    def test_reject_invalid_email(self, api_client):
        payload = {
            "name": "TEST_Bad",
            "email": "not-an-email",
            "subject": "Hello",
            "message": "Test message body",
        }
        r = api_client.post(f"{API}/contact", json=payload)
        assert r.status_code == 422

    def test_reject_short_message(self, api_client):
        payload = {
            "name": "TEST_Short",
            "email": "short@example.com",
            "subject": "Hi",
            "message": "no",  # < 5 chars
        }
        r = api_client.post(f"{API}/contact", json=payload)
        assert r.status_code == 422


# ------------------------- Blog (public) -------------------------
class TestBlogPublic:
    def test_list_published(self, api_client):
        r = api_client.get(f"{API}/blog")
        assert r.status_code == 200
        posts = r.json()
        assert isinstance(posts, list)
        assert len(posts) >= 3, f"Expected at least 3 seeded posts, got {len(posts)}"
        # validate bilingual structure on first
        p = posts[0]
        for key in ["title_id", "title_en", "excerpt_id", "excerpt_en", "content_id", "content_en", "slug"]:
            assert key in p, f"missing field {key}"
        # Save a known slug for next test
        TestBlogPublic._slug = posts[0]["slug"]

    def test_get_single_post_valid(self, api_client):
        slug = getattr(TestBlogPublic, "_slug", None)
        if not slug:
            r = api_client.get(f"{API}/blog")
            slug = r.json()[0]["slug"]
        r = api_client.get(f"{API}/blog/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == slug
        assert data["published"] is True

    def test_get_single_post_invalid(self, api_client):
        r = api_client.get(f"{API}/blog/this-slug-definitely-does-not-exist-xyz")
        assert r.status_code == 404


# ------------------------- Auth -------------------------
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        # httponly cookie set
        cookies = r.cookies
        assert "access_token" in cookies, f"access_token cookie not set. Cookies={cookies}"

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass!"})
        assert r.status_code == 401

    def test_login_unknown_user(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "whatever"})
        assert r.status_code == 401

    def test_me_with_bearer(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_me_with_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        r2 = s.get(f"{API}/auth/me")
        assert r2.status_code == 200
        assert r2.json()["email"] == ADMIN_EMAIL

    def test_me_without_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ------------------------- Admin Inquiries -------------------------
class TestAdminInquiries:
    def test_list_inquiries_protected(self):
        r = requests.get(f"{API}/admin/inquiries")
        assert r.status_code in (401, 403)

    def test_list_inquiries_authed(self, admin_headers):
        r = requests.get(f"{API}/admin/inquiries", headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)

    def test_mark_read_and_delete_flow(self, api_client, admin_headers):
        # Create an inquiry
        payload = {
            "name": "TEST_FlowUser",
            "email": "flow@example.com",
            "subject": "Flow test",
            "message": "Inquiry for flow test purposes.",
        }
        c = api_client.post(f"{API}/contact", json=payload)
        assert c.status_code == 200
        inquiry_id = c.json()["id"]

        # Mark read
        r = requests.patch(f"{API}/admin/inquiries/{inquiry_id}/read", headers=admin_headers)
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # Verify persisted via list
        r2 = requests.get(f"{API}/admin/inquiries", headers=admin_headers)
        found = [i for i in r2.json() if i["id"] == inquiry_id]
        assert len(found) == 1
        assert found[0]["is_read"] is True

        # Delete
        d = requests.delete(f"{API}/admin/inquiries/{inquiry_id}", headers=admin_headers)
        assert d.status_code == 200
        # 404 on second delete
        d2 = requests.delete(f"{API}/admin/inquiries/{inquiry_id}", headers=admin_headers)
        assert d2.status_code == 404

    def test_delete_invalid_inquiry_404(self, admin_headers):
        r = requests.delete(f"{API}/admin/inquiries/non-existent-id-xyz", headers=admin_headers)
        assert r.status_code == 404


# ------------------------- Admin Blog CRUD -------------------------
class TestAdminBlog:
    def test_admin_blog_list_protected(self):
        r = requests.get(f"{API}/admin/blog")
        assert r.status_code in (401, 403)

    def test_admin_blog_list_includes_all(self, admin_headers):
        r = requests.get(f"{API}/admin/blog", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 3  # seeded

    def test_create_update_delete_post(self, admin_headers):
        unique = uuid.uuid4().hex[:8]
        title = f"TEST_Polymer Insights {unique}"
        payload = {
            "title_id": title,
            "title_en": title,
            "excerpt_id": "Ringkasan tes.",
            "excerpt_en": "Test excerpt.",
            "content_id": "Konten dalam Bahasa Indonesia untuk pengujian.",
            "content_en": "English content for testing purposes.",
            "tags": ["test", "polymer"],
            "published": True,
        }
        # Create #1
        r = requests.post(f"{API}/admin/blog", headers=admin_headers, json=payload)
        assert r.status_code == 200, r.text
        p1 = r.json()
        assert p1["title_en"] == title
        assert p1["slug"].startswith(f"test-polymer-insights-{unique}".lower())
        first_slug = p1["slug"]
        post_id = p1["id"]

        # Create #2 with same title -> slug must be auto-incremented
        r2 = requests.post(f"{API}/admin/blog", headers=admin_headers, json=payload)
        assert r2.status_code == 200
        p2 = r2.json()
        assert p2["slug"] != first_slug, "duplicate slug not handled"
        assert p2["slug"].endswith("-2"), f"expected -2 suffix, got {p2['slug']}"

        # GET public should find published one
        pub = requests.get(f"{API}/blog/{first_slug}")
        assert pub.status_code == 200

        # Update post
        upd_payload = dict(payload)
        upd_payload["title_en"] = title + " UPDATED"
        upd_payload["published"] = False
        u = requests.put(f"{API}/admin/blog/{post_id}", headers=admin_headers, json=upd_payload)
        assert u.status_code == 200
        assert u.json()["title_en"].endswith("UPDATED")
        assert u.json()["published"] is False

        # Now public should not see unpublished
        pub2 = requests.get(f"{API}/blog/{first_slug}")
        assert pub2.status_code == 404

        # Delete both
        for pid in [post_id, p2["id"]]:
            d = requests.delete(f"{API}/admin/blog/{pid}", headers=admin_headers)
            assert d.status_code == 200
        # second delete -> 404
        d2 = requests.delete(f"{API}/admin/blog/{post_id}", headers=admin_headers)
        assert d2.status_code == 404

    def test_admin_create_blog_requires_auth(self):
        r = requests.post(f"{API}/admin/blog", json={
            "title_id": "x", "title_en": "x", "excerpt_id": "", "excerpt_en": "",
            "content_id": "x", "content_en": "x"
        })
        assert r.status_code in (401, 403)

    def test_admin_update_blog_requires_auth(self):
        r = requests.put(f"{API}/admin/blog/anything", json={
            "title_id": "x", "title_en": "x", "excerpt_id": "", "excerpt_en": "",
            "content_id": "x", "content_en": "x"
        })
        assert r.status_code in (401, 403)

    def test_admin_delete_blog_requires_auth(self):
        r = requests.delete(f"{API}/admin/blog/anything")
        assert r.status_code in (401, 403)
