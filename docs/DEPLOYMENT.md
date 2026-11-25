# Panduan Deployment Docker & CI/CD (GitHub Actions)

Dokumen ini menjelaskan cara menjalankan dan men-deploy aplikasi **Ekosistem Alumni SMA Double Track** menggunakan **Docker**, **Docker Compose**, dan **GitHub Actions CI/CD**.

---

## 1. Arsitektur Container

Setup Docker dirancang dalam satu image produksi multi-stage (`Dockerfile`) yang ringkas dan siap pakai:
1. **Stage 1 (`frontend-builder` - Node 22 Alpine):** Menginstal dependensi NPM dan menjalankan `npm run build` (React 18 + Vite + Tailwind CSS v4).
2. **Stage 2 (`vendor-builder` - Composer 2):** Menginstal dependensi PHP Composer untuk produksi (`--no-dev --optimize-autoloader`).
3. **Stage 3 (`production` - PHP 8.4-FPM Alpine):**
   - Menjalankan **Nginx** + **PHP-FPM 8.4** + **Queue Worker (opsional)** di bawah **Supervisor**.
   - Dilengkapi ekstensi `pdo_mysql`, `pdo_sqlite`, `gd` (Freetype, JPEG, WebP untuk `intervention/image`), `intl`, `zip`, `bcmath`, dan `opcache` (dengan JIT).
   - Menggunakan script [`docker/entrypoint.sh`](../docker/entrypoint.sh) untuk menunggu koneksi database, membuat symlink storage, menjalankan migrasi (`php artisan migrate --force`), dan melakukan optimasi cache (`php artisan optimize`).

---

## 2. Menjalankan dengan Docker Secara Lokal / Mandiri

1. **Siapkan file `.env`:**
   ```bash
   cp .env.production.example .env
   ```
   Isi `APP_KEY` dan `JWT_SECRET` (atau generate dari lokal dengan `php artisan key:generate --show` dan `php artisan jwt:secret --show`).
   Untuk menjalankan seeder awal (akun demo & role Spatie), set `RUN_SEEDER=true` pada `.env` saat pertama kali dijalankan, lalu kembalikan ke `RUN_SEEDER=false` setelahnya.

2. **Build dan jalankan container (App + MySQL 8.4):**
   ```bash
   docker compose up -d --build
   ```

3. **Cek status & log:**
   ```bash
   docker compose ps
   docker compose logs -f app
   ```
   Aplikasi dapat diakses di `http://localhost:8083` (atau sesuai `APP_PORT` di `.env`).

---

## 3. Persiapan Server Produksi (VPS & Nginx Proxy Manager)

Berdasarkan pengaturan **Nginx Proxy Manager (NPM)** di VPS:
- `skorpluss.com` menggunakan port `8080`
- `fishpro.id` menggunakan port `8081`
- `api.fishpro.id` menggunakan port `8082`
- **`ruangmodal.id` & `www.ruangmodal.id`** diarahkan ke **`http://172.17.0.1:8083`**

Oleh karena itu, `docker-compose.prod.yml` dan `.env.production.example` sudah dikonfigurasi menggunakan **`APP_PORT=8083`** (`8083:80`) serta Laravel `trustProxies` sudah diaktifkan di [`bootstrap/app.php`](../bootstrap/app.php) agar header `X-Forwarded-Proto` (HTTPS Let's Encrypt dari NPM) dan IP asli pengunjung terbaca dengan benar.

Langkah persiapan pertama kali di VPS:

1. **Buat direktori aplikasi di `/var/www/ruang-modal`:**
   ```bash
   sudo mkdir -p /var/www/ruang-modal
   sudo chown -R $USER:$USER /var/www/ruang-modal
   cd /var/www/ruang-modal
   ```

2. **Buat file `.env` produksi di `/var/www/ruang-modal/.env`:**
   Salin isi dari [`.env.production.example`](../.env.production.example) dan sesuaikan:
   - `APP_KEY=base64:...` (generate dengan `php artisan key:generate --show`)
   - `JWT_SECRET=...` (generate dengan `php artisan jwt:secret --show`)
   - `APP_URL=https://ruangmodal.id`
   - `APP_PORT=8083`
   - `DB_PASSWORD` dan `DB_ROOT_PASSWORD` yang kuat
   - `RUN_SEEDER=true` *(aktifkan hanya pada deployment pertama agar role & akun awal terbuat, lalu ubah ke `false`)*

3. **Aktifkan SSL Let's Encrypt di Nginx Proxy Manager:**
   - Pada entri `ruangmodal.id` (`http://172.17.0.1:8083`) di Nginx Proxy Manager, buka tab **SSL** -> pilih **Request a new SSL Certificate** dengan **Force SSL** dan **HTTP/2 Support** aktif.

---

## 4. Konfigurasi GitHub Secrets untuk CI/CD

Buka repositori GitHub (`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`) dan tambahkan secret berikut:

| Nama Secret | Wajib | Contoh Nilai | Keterangan |
| :--- | :---: | :--- | :--- |
| `SSH_HOST` | Ya | `203.0.113.10` | IP publik atau hostname VPS produksi |
| `SSH_USER` | Ya | `root` / `ubuntu` | Username SSH di VPS (harus masuk grup `docker`) |
| `SSH_PRIVATE_KEY` | Ya | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private key SSH lokal Anda yang sudah terhubung ke VPS |
| `SSH_PORT` | Opsional | `22` | Port SSH server (default `22`) |
| `DEPLOY_PATH` | Opsional | `/var/www/ruang-modal` | Direktori target di VPS (default `/var/www/ruang-modal`) |
| `GHCR_TOKEN` | Opsional | `ghp_xxxxxxxxxxxx` | Personal Access Token (scope `read:packages`) jika repositori bersifat **Private** |

---

## 5. Alur Pipeline CI/CD (`.github/workflows/ci-cd.yml`)

Setiap `push` ke branch `main` atau `master` akan memicu 3 tahapan berurutan:
1. **`test`:** Menyiapkan PHP 8.4 & Node 22, mem-build aset React/Vite (`npm run build`), dan menjalankan seluruh pengujian (`php artisan test`).
2. **`build-and-push`:** Mem-build Docker image multi-stage dengan cache GitHub Actions dan mem-push image ke GitHub Container Registry (`ghcr.io/<owner>/<repo>:latest`).
3. **`deploy`:** Mengunggah `docker-compose.prod.yml` terbaru ke VPS via SCP, menarik image terbaru dari GHCR (`docker compose -f docker-compose.prod.yml pull`), dan memperbarui container (`docker compose -f docker-compose.prod.yml up -d --remove-orphans`).
