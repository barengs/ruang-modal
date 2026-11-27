# Panduan & Pengaturan Agent (Ruang Modal DT)

Dokumen ini berisi informasi pengetahuan sistem, arsitektur aplikasi, dan SOP wajib bagi AI Agent dalam mengembangkan dan memelihara aplikasi **Ruang Modal & Ekosistem Alumni SMA Double Track**.

---

## 1. Keterangan Detil Aplikasi & Pengetahuan Sistem (Knowledge Base Pindah Device)

### A. Gambaran Umum & Pilar Aplikasi
Aplikasi ini merupakan ekosistem terintegrasi pemberdayaan alumni SMA Double Track (Jawa Timur) yang terdiri dari modul-modul utama:
1. **Ruang Modal**: Bantuan modal usaha bagi alumni (pengajuan proposal/RAB, kurasi & seleksi rubrik 5 indikator kelayakan, berita acara serah terima / BAST, pencairan bertahap, dan pelaporan penggunaan modal).
2. **Ruang Tumbuh**: Permintaan pendampingan, coaching, dan konsultasi usaha alumni bersama mentor ahli/guru pendamping.
3. **Ruang Pasar**: Etalase & marketplace produk alumni Double Track yang telah diverifikasi dan dimoderasi.
4. **Monitoring**: Pelaporan omzet berkala, kendala usaha, dan perkembangan usaha alumni pasca penyaluran bantuan modal.
5. **Live Chat**: Layanan pesan langsung antara alumni/pemohon dan pengelola/admin.
6. **Role Management & Pengguna**: RBAC dinamis berbasis Spatie Laravel Permission (Super Admin, Verifikator/Admin Modal, Admin Pasar, Admin Tumbuh, Petugas Monitoring, Alumni).

### B. Arsitektur & Teknologi (Tech Stack)
- **Arsitektur**: *Hybrid Monolith* (Laravel Backend menyajikan API dan sekaligus merender React SPA via Blade mount di `resources/views/app.blade.php`).
- **Backend**:
  - PHP 8.2+
  - Framework: Laravel 12
  - Autentikasi: JWT Auth (`tymon/jwt-auth`)
  - Otorisasi: Spatie Laravel Permission (Roles & Permissions)
  - Database: SQLite (default dev di `database/database.sqlite`) / MySQL
  - Media/File Upload: Disimpan di `public/uploads/` dan `storage/app/public/uploads/` dengan symlink `public/storage`.
- **Frontend**:
  - React 18 + Vite
  - State Management: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
  - Routing: React Router v6
  - Styling: Tailwind CSS + Desain token berbasis Bootstrap (`bs-card`, `bs-btn`, `bs-form-control`, warna identitas Double Track `#203880`, `#f8a000`, `#0068b0`)
  - Notifikasi: React Toastify (`react-toastify`)
  - Ikon: Lucide React (`lucide-react`)
  - Ekspor Dokumen: PDF & Excel generator kustom (`reportExporter.js`)

### C. Panduan Setup / Pindah Device (Fresh Setup Runbook)
Jika berpindah perangkat komputer atau clone repositori baru:
1. **Clone repository**:
   ```sh
   git clone https://github.com/barengs/ruang-modal.git
   cd ruang_modal_dt
   ```
2. **Install Dependensi Backend & Frontend**:
   ```sh
   composer install
   npm install
   ```
3. **Konfigurasi Environment**:
   ```sh
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   ```
4. **Setup Database & Storage Link**:
   ```sh
   touch database/database.sqlite
   php artisan migrate:fresh --seed
   php artisan storage:link
   ```
5. **Jalankan Aplikasi**:
   - Mode Development (Hot Reloading):
     ```sh
     # Terminal 1: Backend Server (http://127.0.0.1:8000)
     php artisan serve

     # Terminal 2: Frontend Vite HMR (http://localhost:5173)
     npm run dev
     ```
   - Mode Production / Bundled:
     ```sh
     npm run build
     php artisan serve
     ```

---

## 2. Aturan Pemeriksaan Struktur Data (Backend Changes SOP)

Setiap kali melakukan perubahan di bagian backend:
1. **Konsistensi Skema Database**:
   - Selalu periksa dan sinkronkan file migrasi (`database/migrations/`), definisi model Eloquent (`$fillable`, `$casts`, `$dates`, relasi), dan seeder (`database/seeders/`).
   - Pastikan tipe data kolom, index pencarian, dan aturan foreign key didefinisikan secara eksplisit.
2. **Kontrak API & Validasi Input**:
   - Setiap endpoint yang menerima data wajib memiliki validasi ketat (`$request->validate([...])`).
   - Format response JSON harus konsisten (`message`, data payload, atau error dictionary).
   - Jangan mengubah nama properti response JSON yang telah dikonsumsi oleh komponen frontend tanpa memperbarui sisi frontend secara bersamaan.
3. **Penyimpanan Berkas/Lampiran**:
   - Berkas upload harus divalidasi tipe MIME dan ukurannya (maksimal 5MB untuk dokumen/gambar).
   - Pastikan route catch-all SPA di `routes/web.php` tidak mencegat file upload statis (kecualikan `uploads|storage` pada regex).

---

## 3. Kewajiban Unit Testing & Verifikasi

1. **Jalankan Unit Test Sebelum Selesai**:
   - Setiap perubahan backend wajib diverifikasi dengan menjalankan pengujian PHPUnit:
     ```sh
     php artisan test
     ```
     Seluruh test harus berstatus **PASSED**.
2. **Penambahan Test Case Baru**:
   - Jika membuat endpoint API baru atau logika bisnis penting (seleksi rubrik, BAST, auth, approval, upload dokumen), wajib menambahkan minimal satu test case di `tests/Feature/EkosistemApiTest.php`.
3. **Verifikasi Build Frontend**:
   - Setiap perubahan frontend wajib diuji kompilasinya:
     ```sh
     npm run build
     ```
     Pastikan tidak ada error kompilasi JSX, modul hilang, atau dependensi rusak.

---

## 4. Kewajiban Commit ke Branch Aktif

1. **Commit Berkala & Rapi**:
   - Setiap perubahan yang telah selesai diuji dan memenuhi kriteria wajib di-commit ke branch yang sedang aktif.
2. **Format Pesan Commit (Conventional Commits)**:
   - Gunakan format standar: `<tipe>(<lingkup>): <deskripsi singkat perubahan>`
   - Contoh:
     - `feat(modal): tambah export pdf laporan seleksi rubrik`
     - `fix(auth): perbaiki validasi konfirmasi kata sandi`
     - `refactor(ui): rapikan layout detail ruang modal menjadi tabel`

---

## 5. Larangan Push ke Branch Main Tanpa Permintaan

1. **JANGAN LAKUKAN `git push` SECARA OTOMATIS**:
   - AI Agent **DILARANG** menjalankan `git push` ke branch `main` atau remote repository manapun kecuali jika pengguna/USER secara eksplisit meminta: *"tolong push"*, *"push ke github"*, atau instruksi serupa.
   - Semua pekerjaan cukup dikomit ke branch lokal yang sedang aktif agar pengguna dapat meninjau, menguji, dan memverifikasi perubahan terlebih dahulu.
