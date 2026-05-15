"""
PT. NURI DWI SUKSES - CMS endpoints regression tests
Covers: /api/site/*, /api/media/*, /api/admin/site/settings/*,
/api/admin/collections/*, /api/admin/media.
"""
import io
import os
import struct
import zlib
import requests
import pytest

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@nuridwisukses.co.id"
ADMIN_PASSWORD = "NuriAdmin2024!"

EXPECTED_SETTING_KEYS = {
    "hero_badge", "hero_title", "hero_sub", "hero_image",
    "cta_banner_title", "cta_banner_body", "cta_banner_btn",
    "promo_text", "promo_cta",
    "about_title", "about_sub", "ceo_name", "ceo_role",
    "kata_sambutan_id", "kata_sambutan_en",
    "vision_text", "mission_id", "mission_en",
    "services_title", "services_sub",
    "machines_title", "machines_sub",
    "portfolio_title", "portfolio_sub",
    "contact_title", "contact_sub", "contact_address",
    "contact_email", "contact_phone", "contact_whatsapp", "contact_instagram",
    "contact_hours", "contact_maps_query",
}

ALLOWED_COLLECTIONS = [
    "services", "machines", "machine_specs",
    "portfolio_sectors", "testimonials", "process_steps", "values",
]


def make_png_bytes():
    """Build a tiny valid 1x1 PNG in-memory."""
    sig = b"\x89PNG\r\n\x1a\n"

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff))
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\x00\x00"
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


# ------------------------ Fixtures ------------------------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json().get("token")


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ------------------------ Public: settings & collections ------------------------
class TestSitePublic:
    def test_settings_returns_all_seeded_keys(self):
        r = requests.get(f"{API}/site/settings")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)
        missing = EXPECTED_SETTING_KEYS - set(data.keys())
        assert not missing, f"Missing seeded settings keys: {missing}"
        assert len(EXPECTED_SETTING_KEYS) == 33
        # hero_title should be a bilingual dict
        assert isinstance(data["hero_title"], dict)
        assert "id" in data["hero_title"] and "en" in data["hero_title"]

    @pytest.mark.parametrize("name", ALLOWED_COLLECTIONS)
    def test_collection_endpoint(self, name):
        r = requests.get(f"{API}/site/collections/{name}")
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) > 0, f"{name} appears unseeded"
        # Check sorted by order ascending
        orders = [it.get("order", 0) for it in items]
        assert orders == sorted(orders), f"{name} not sorted by order ascending"
        # No _id leaks
        for it in items:
            assert "_id" not in it
            assert "id" in it

    def test_invalid_collection_404(self):
        r = requests.get(f"{API}/site/collections/invalid_name")
        assert r.status_code == 404

    def test_site_all_combines_settings_and_collections(self):
        r = requests.get(f"{API}/site/all")
        assert r.status_code == 200
        data = r.json()
        assert "settings" in data and "collections" in data
        assert len(EXPECTED_SETTING_KEYS - set(data["settings"].keys())) == 0
        assert set(data["collections"].keys()) == set(ALLOWED_COLLECTIONS)
        # services should have 6 seeded items
        assert len(data["collections"]["services"]) >= 6


# ------------------------ Admin: settings ------------------------
class TestAdminSettings:
    def test_unauth_get_settings(self):
        r = requests.get(f"{API}/admin/site/settings")
        assert r.status_code in (401, 403)

    def test_unauth_put_setting(self):
        r = requests.put(f"{API}/admin/site/settings/hero_title", json={"value": {"id": "X", "en": "Y"}})
        assert r.status_code in (401, 403)

    def test_update_hero_title_persists(self, admin_headers):
        new_val = {"id": "TEST_UPDATED_ID", "en": "TEST_UPDATED_EN"}
        r = requests.put(f"{API}/admin/site/settings/hero_title",
                         headers=admin_headers, json={"value": new_val})
        assert r.status_code == 200, r.text
        # Verify via public GET
        g = requests.get(f"{API}/site/settings")
        assert g.json()["hero_title"] == new_val

        # Restore original (best effort)
        original = {
            "id": "Plat polymer presisi. Untuk percetakan yang menuntut hasil sempurna.",
            "en": "Precision polymer plates. For printers who demand perfect results.",
        }
        requests.put(f"{API}/admin/site/settings/hero_title",
                     headers=admin_headers, json={"value": original})

    def test_invalid_key_rejected(self, admin_headers):
        r = requests.put(f"{API}/admin/site/settings/INVALID-KEY",
                         headers=admin_headers, json={"value": {"id": "x"}})
        assert r.status_code == 400


# ------------------------ Admin: collections CRUD ------------------------
class TestAdminCollections:
    def test_unauth_list(self):
        r = requests.get(f"{API}/admin/collections/services")
        assert r.status_code in (401, 403)

    def test_unauth_create(self):
        r = requests.post(f"{API}/admin/collections/services", json={"title_id": "x"})
        assert r.status_code in (401, 403)

    def test_disallowed_collection_returns_404(self, admin_headers):
        r = requests.post(f"{API}/admin/collections/random_name",
                          headers=admin_headers, json={"title": "x"})
        assert r.status_code == 404

    def test_full_crud_services(self, admin_headers):
        # CREATE
        payload = {
            "icon": "Star",
            "title_id": "TEST_Jasa Baru",
            "title_en": "TEST_New Service",
            "desc_id": "deskripsi tes",
            "desc_en": "test description",
            "order": 99,
        }
        c = requests.post(f"{API}/admin/collections/services",
                          headers=admin_headers, json=payload)
        assert c.status_code == 200, c.text
        item = c.json()
        assert "id" in item and isinstance(item["id"], str)
        assert item["title_en"] == "TEST_New Service"
        assert item.get("order") == 99
        item_id = item["id"]

        # Verify visible in public list (and no _id)
        pub = requests.get(f"{API}/site/collections/services").json()
        match = [x for x in pub if x["id"] == item_id]
        assert len(match) == 1 and "_id" not in match[0]

        # UPDATE
        upd = requests.put(f"{API}/admin/collections/services/{item_id}",
                           headers=admin_headers,
                           json={"title_en": "TEST_New Service UPDATED", "order": 100})
        assert upd.status_code == 200
        assert upd.json()["title_en"] == "TEST_New Service UPDATED"

        # Confirm persisted via public GET
        pub2 = requests.get(f"{API}/site/collections/services").json()
        match2 = [x for x in pub2 if x["id"] == item_id][0]
        assert match2["title_en"] == "TEST_New Service UPDATED"

        # DELETE
        d = requests.delete(f"{API}/admin/collections/services/{item_id}",
                            headers=admin_headers)
        assert d.status_code == 200
        # second delete -> 404
        d2 = requests.delete(f"{API}/admin/collections/services/{item_id}",
                             headers=admin_headers)
        assert d2.status_code == 404

    def test_update_invalid_id_404(self, admin_headers):
        r = requests.put(f"{API}/admin/collections/services/nonexistent-id",
                         headers=admin_headers, json={"title_en": "x"})
        assert r.status_code == 404


# ------------------------ Admin: media ------------------------
class TestAdminMedia:
    def test_unauth_upload(self):
        files = {"file": ("a.png", make_png_bytes(), "image/png")}
        r = requests.post(f"{API}/admin/media", files=files)
        assert r.status_code in (401, 403)

    def test_unauth_list(self):
        r = requests.get(f"{API}/admin/media")
        assert r.status_code in (401, 403)

    def test_upload_image_and_fetch(self, admin_headers):
        png = make_png_bytes()
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = requests.post(f"{API}/admin/media", headers=admin_headers, files=files)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "id" in body
        assert body["url"] == f"/api/media/{body['id']}"
        assert body["size"] == len(png)
        media_id = body["id"]

        # Public fetch returns binary
        g = requests.get(f"{API}/media/{media_id}")
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("image/png")
        assert g.content == png

        # List should include it (without base64)
        lst = requests.get(f"{API}/admin/media", headers=admin_headers)
        assert lst.status_code == 200
        items = lst.json()
        found = [m for m in items if m["id"] == media_id]
        assert len(found) == 1
        assert "data_base64" not in found[0]
        assert found[0]["size"] == len(png)
        assert found[0]["url"] == f"/api/media/{media_id}"

        # Delete
        d = requests.delete(f"{API}/admin/media/{media_id}", headers=admin_headers)
        assert d.status_code == 200
        d2 = requests.delete(f"{API}/admin/media/{media_id}", headers=admin_headers)
        assert d2.status_code == 404
        # Public fetch now 404
        g2 = requests.get(f"{API}/media/{media_id}")
        assert g2.status_code == 404

    def test_upload_rejects_non_image(self, admin_headers):
        files = {"file": ("a.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{API}/admin/media", headers=admin_headers, files=files)
        assert r.status_code == 400

    def test_get_media_invalid_id_404(self):
        r = requests.get(f"{API}/media/non-existent-id-xyz")
        assert r.status_code == 404
