# Ekosistem Alumni SMA Double Track — Laravel + React (Hybrid Monolith)

Aplikasi web **Ekosistem Alumni SMA Double Track** (**Ruang Modal**, **Ruang Tumbuh**, **Ruang Pasar**, dan **Monitoring**) yang telah dimigrasi dari Google Apps Script ke arsitektur **Hybrid Monolith** berbasis **Laravel + React.js + Vite**.

> File Google Apps Script lama tetap disimpan sebagai arsip di folder `legacy-gas/`.

## Teknologi yang Digunakan

- **Backend:** Laravel 13 (PHP 8.3+), REST API (`/api/*`)
- **Autentikasi:** JWT Auth (`php-open-source-saver/jwt-auth`)
- **Otorisasi (RBAC):** Spatie Laravel Permission (`spatie/laravel-permission`)
- **Frontend:** React.js 18 + React Router 6 di dalam `resources/js/` (Hybrid Monolith via Blade + Vite)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Tabel Data:** TanStack Table (`@tanstack/react-table`) — pencarian global, sorting, filter status, dan paginasi
- **Grafik Analitik:** TanStack Chart (`react-charts`) — tren pengajuan bulanan & distribusi kategori/status
- **UI Styling:** Tailwind CSS v4 dengan komponen & sistem grid bergaya **Bootstrap** (`.bs-container`, `.bs-row`, `.bs-card`, `.bs-btn-*`, `.bs-form-control`, `.bs-table`, `.bs-badge`, `.bs-modal-*`)

## Fitur Utama

### Portal Publik (Tanpa Login)
1. **Beranda:** Ringkasan statistik, kartu layanan, dan etalase produk/jasa alumni dengan pencarian & filter kategori.
2. **Ruang Modal:** Formulir pengajuan bantuan alat kerja/modal usaha lengkap dengan nomor resi otomatis (`RM-...`).
3. **Ruang Tumbuh:** Formulir permintaan mentoring & pendampingan (`RT-...`).
4. **Ruang Pasar:** Etalase produk/jasa alumni berstatus `Tayang` dan formulir pendaftaran produk/jasa baru (`RP-...`).

### Panel Pengelola (JWT Auth + Spatie Permission)
1. **Dashboard Analitik:** Kartu KPI + grafik interaktif **TanStack Chart** (tren 6 bulan terakhir, distribusi status Ruang Modal, distribusi kategori Ruang Pasar).
2. **Manajemen Ruang Modal, Ruang Tumbuh, Ruang Pasar:** Tabel **TanStack Table** dengan modal proses verifikasi/moderasi dan catatan admin.
3. **Monitoring:** Pencatatan perkembangan produktivitas & omzet alumni lintas modul.
4. **Manajemen User & Role (Super Admin):** Pembuatan akun pengelola, penetapan role, dan pengaturan matriks permission secara dinamis.

## Akun Demo (Hasil Seeder)

| Role | Email | Password |
| :--- | :--- | :--- |
| `super-admin` | `superadmin@doubletrack.sch.id` | `password123` |
| `admin` | `admin@doubletrack.sch.id` | `password123` |
| `petugas-monitoring` | `petugas@doubletrack.sch.id` | `password123` |

## Cara Menjalankan Proyek

1. **Install dependensi backend & frontend:**
   ```bash
   composer install
   npm install
   ```
2. **Siapkan environment & database (default SQLite sudah siap pakai):**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   php artisan migrate:fresh --seed
   ```
   *(Jika ingin menggunakan MySQL/PostgreSQL, sesuaikan variabel `DB_*` di `.env` sebelum menjalankan migrasi.)*

3. **Jalankan mode pengembangan (Laravel + Vite):**
   ```bash
   php artisan serve
   # di terminal terpisah:
   npm run dev
   ```
   Atau build untuk produksi dan jalankan langsung via Laravel:
   ```bash
   npm run build
   php artisan serve
   ```
   Buka `http://127.0.0.1:8000` di browser.

4. **Jalankan pengujian otomatis:**
   ```bash
   php artisan test
   ```
