# Panduan Menjalankan Sistem PT. NURI DWI SUKSES

Dokumen ini berisi langkah-langkah untuk menjalankan website PT. NDS di laptop lokal Anda.

## 1. Prasyarat Utama
- **MongoDB**: Harus terinstal dan berjalan di latar belakang (Port default: 27017).
- **Python 3.10+**: Untuk menjalankan backend (FastAPI).
- **Node.js**: Untuk menjalankan frontend (React).

---

## 2. Cara Menjalankan Backend
Buka terminal baru, lalu jalankan:
```powershell
cd C:\laragon\www\PT_NDS\backend
# Aktifkan virtual environment
venv\Scripts\activate
# Jalankan server
uvicorn server:app --reload
```
*Backend berjalan di: `http://localhost:8000`*

---

## 3. Cara Menjalankan Frontend
Buka terminal baru lagi (jangan tutup terminal backend), lalu jalankan:
```powershell
cd C:\laragon\www\PT_NDS\frontend
# Jalankan aplikasi
npm start
```
*Frontend berjalan di: `http://localhost:3000`*

---

## 4. Informasi Login Admin
Anda bisa mengelola konten website (Blog, Layanan, Foto Mesin, dll) melalui Dashboard Admin.
- **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email:** `admin@nuridwisukses.co.id`
- **Password:** `NuriAdmin2024!`

---

## 5. Troubleshooting (Penyelesaian Masalah)

### Error: "npm error ERESOLVE" saat install
Jika terjadi konflik versi saat `npm install`, selalu tambahkan flag berikut:
```powershell
npm install --legacy-peer-deps
```

### Error: "Cannot find module 'ajv/dist/compile/codegen'"
Jika frontend gagal start karena modul `ajv` hilang, jalankan:
```powershell
npm install ajv ajv-keywords --save-dev --legacy-peer-deps
```

### Reset Data
Data website disimpan di MongoDB. Jika Anda ingin mereset data ke kondisi awal (Seeding), hapus database `pt_nds_db` di MongoDB, lalu jalankan ulang backend. Sistem akan otomatis mengisi data awal kembali.

---
*Dibuat oleh Antigravity pada 17 Mei 2026*
