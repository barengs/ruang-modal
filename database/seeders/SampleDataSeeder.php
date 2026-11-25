<?php

namespace Database\Seeders;

use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\Testimonial;
use App\Models\TumbuhRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'alumni', 'guard_name' => 'api']);

        $adminId = User::where('email', 'admin@doubletrack.sch.id')->value('id');
        $petugasId = User::where('email', 'petugas@doubletrack.sch.id')->value('id');
        $adminName = User::where('id', $adminId)->value('name') ?? 'Admin Pengelola';

        // 1. Master Data Akun Alumni (sumber relasi untuk Ruang Modal, Tumbuh, Pasar, Monitoring, & Testimoni)
        $alumniProfiles = [
            [
                'name' => 'Rina Sari Dewi',
                'email' => 'rina.sari@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567801',
                'sekolah' => 'SMAN 1 Tuban',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Tata Boga',
                'nama_usaha' => 'Dapur Rina — Bakery & Kue Kering',
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'fauzi.ahmad@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567802',
                'sekolah' => 'SMAN 2 Bojonegoro',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Teknik Kendaraan Ringan',
                'nama_usaha' => 'Fauzi Auto Care — Servis Panggilan',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.nur@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567803',
                'sekolah' => 'SMAN 1 Lamongan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Tata Busana',
                'nama_usaha' => 'Nura Atelier — Jahit Custom & Kemeja Linen',
            ],
            [
                'name' => 'Bagus Pratama',
                'email' => 'bagus.pratama@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567804',
                'sekolah' => 'SMAN 1 Ngawi',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Multimedia & Desain Grafis',
                'nama_usaha' => 'Pratama Visual — Foto Produk UMKM',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi.lestari@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567805',
                'sekolah' => 'SMAN 1 Pacitan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Tata Kecantikan',
                'nama_usaha' => 'Glow by Dewi — Jasa Makeup Wisuda & Lamaran',
            ],
            [
                'name' => 'Dimas Saputra',
                'email' => 'dimas.saputra@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081345678901',
                'sekolah' => 'SMAN 1 Sampang',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Multimedia & Desain Grafis',
                'nama_usaha' => 'Dimas Kuliner & Katalog Digital UMKM',
            ],
            [
                'name' => 'Nadia Putri',
                'email' => 'nadia.putri@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081345678902',
                'sekolah' => 'SMAN 1 Sumenep',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Tata Boga',
                'nama_usaha' => 'Nadia Snack & Camilan Madura',
            ],
            [
                'name' => 'Rizky Ramadhan',
                'email' => 'rizky.r@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081345678903',
                'sekolah' => 'SMAN 2 Bangkalan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Multimedia & Desain Grafis',
                'nama_usaha' => 'Rizky Creative Studio',
            ],
            [
                'name' => 'Ayu Wulandari',
                'email' => 'ayu.wulan@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081345678904',
                'sekolah' => 'SMAN 1 Bondowoso',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Tata Boga',
                'nama_usaha' => 'Ayu Bakery Bondowoso',
            ],
            [
                'name' => 'Hendra Wijaya',
                'email' => 'hendra.w@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567806',
                'sekolah' => 'SMAN 1 Trenggalek',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Kriya & Kerajinan',
                'nama_usaha' => 'Wijaya Craft — Hampers Anyaman Bambu',
            ],
            [
                'name' => 'Fajar Nugroho',
                'email' => 'fajar.n@alumni.sch.id',
                'password' => 'password123',
                'whatsapp' => '081234567807',
                'sekolah' => 'SMAN 1 Magetan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Teknik Komputer & Jaringan',
                'nama_usaha' => 'Fajar Tech — Servis Laptop & Web UMKM',
            ],
        ];

        /** @var array<string, User> $alumniByEmail */
        $alumniByEmail = [];
        /** @var array<string, User> $alumniByName */
        $alumniByName = [];

        foreach ($alumniProfiles as $profile) {
            $user = User::updateOrCreate(
                ['email' => $profile['email']],
                $profile
            );
            $user->syncRoles(['alumni']);

            $alumniByEmail[$user->email] = $user;
            $alumniByName[$user->name] = $user;
        }

        // 2. Seed Data Ruang Modal (berelasi dengan user_id alumni)
        if (ModalApplication::count() === 0) {
            $modals = [
                [
                    'kode' => 'RM-20260712-A1B2C3D4',
                    'email' => 'rina.sari@alumni.sch.id',
                    'jalur' => 'Usaha',
                    'status_aktivitas' => 'Merintis usaha',
                    'jenis_bantuan' => 'Mesin/peralatan usaha',
                    'rincian_kebutuhan' => '1 unit Oven Listrik 60L, 1 unit Stand Mixer kapasitas 5L, loyang stainless 6 pcs',
                    'estimasi_biaya' => 3500000,
                    'rencana_deskripsi' => 'Memperluas produksi kue kering dan roti rumahan untuk pesanan katering sekolah dan toko lokal. Target omzet Rp4.500.000/bulan.',
                    'status_seleksi' => 'Disetujui',
                    'catatan_admin' => 'Proposal lengkap dan usaha sudah berjalan aktif. Disetujui tahap 1.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(4),
                ],
                [
                    'kode' => 'RM-20260818-E5F6G7H8',
                    'email' => 'fauzi.ahmad@alumni.sch.id',
                    'jalur' => 'Kerja',
                    'status_aktivitas' => 'Sudah bekerja',
                    'jenis_bantuan' => 'Peralatan kerja',
                    'rincian_kebutuhan' => '1 set kunci ring pas lengkap, dongkrak buaya 2 ton, kompresor mini portable',
                    'estimasi_biaya' => 2750000,
                    'rencana_deskripsi' => 'Menunjang layanan servis panggilan motor/mobil di akhir pekan selain kerja di bengkel rekanan.',
                    'status_seleksi' => 'Disetujui',
                    'catatan_admin' => 'Terverifikasi oleh guru pendamping sekolah.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(3),
                ],
                [
                    'kode' => 'RM-20260925-I9J0K1L2',
                    'email' => 'siti.nur@alumni.sch.id',
                    'jalur' => 'Usaha',
                    'status_aktivitas' => 'Usaha berjalan',
                    'jenis_bantuan' => 'Modal produksi/bahan baku',
                    'rincian_kebutuhan' => 'Kain katun combed 30s (50m), benang jahit, resleting, label woven brand sendiri',
                    'estimasi_biaya' => 2200000,
                    'rencana_deskripsi' => 'Produksi koleksi gamis dan kemeja kasual anak muda untuk pemasaran via Shopee dan Instagram.',
                    'status_seleksi' => 'Menunggu Seleksi',
                    'catatan_admin' => null,
                    'reviewed_by' => null,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(2),
                ],
                [
                    'kode' => 'RM-20261014-M3N4O5P6',
                    'email' => 'bagus.pratama@alumni.sch.id',
                    'jalur' => 'Usaha',
                    'status_aktivitas' => 'Merintis usaha',
                    'jenis_bantuan' => 'Peralatan pemasaran',
                    'rincian_kebutuhan' => 'Lighting softbox 2 set, tripod heavy duty, mic wireless dual channel',
                    'estimasi_biaya' => 1900000,
                    'rencana_deskripsi' => 'Membuka jasa foto produk UMKM dan konten reels untuk pelaku usaha di wilayah Ngawi dan Madiun.',
                    'status_seleksi' => 'Perlu Perbaikan',
                    'catatan_admin' => 'Mohon lampirkan rincian harga per item dan portofolio 3 proyek terakhir.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonth(),
                ],
                [
                    'kode' => 'RM-20261108-Q7R8S9T0',
                    'email' => 'dewi.lestari@alumni.sch.id',
                    'jalur' => 'Usaha',
                    'status_aktivitas' => 'Belum bekerja',
                    'jenis_bantuan' => 'Kombinasi',
                    'rincian_kebutuhan' => 'Kit makeup wisuda lengkap, ring light 45cm, koper makeup organizer',
                    'estimasi_biaya' => 3100000,
                    'rencana_deskripsi' => 'Membuka layanan jasa MUA wisuda, lamaran, dan acara sekolah di Pacitan.',
                    'status_seleksi' => 'Menunggu Seleksi',
                    'catatan_admin' => null,
                    'reviewed_by' => null,
                    'created_at' => Carbon::now('Asia/Jakarta')->subDays(10),
                ],
            ];

            foreach ($modals as $m) {
                $alumni = $alumniByEmail[$m['email']];
                $created = ModalApplication::create([
                    ...$m,
                    'user_id' => $alumni->id,
                    'nama' => $alumni->name,
                    'email' => $alumni->email,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                    'tahun_lulus' => $alumni->tahun_lulus,
                    'kompetensi' => $alumni->kompetensi,
                ]);

                $createdAt = isset($m['created_at']) ? Carbon::parse($m['created_at']) : now();

                $created->histories()->create([
                    'status_seleksi' => 'Menunggu Seleksi',
                    'catatan' => 'Pengajuan Ruang Modal dikirim oleh pemohon.',
                    'actor_type' => 'pemohon',
                    'actor_name' => $created->nama,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                if ($created->status_seleksi !== 'Menunggu Seleksi' || ! empty($created->catatan_admin)) {
                    $reviewAt = $createdAt->copy()->addDays(2);
                    $created->histories()->create([
                        'status_seleksi' => $created->status_seleksi,
                        'catatan' => $created->catatan_admin ?: 'Status seleksi diperbarui oleh pengelola.',
                        'actor_type' => 'admin',
                        'actor_name' => $adminName,
                        'created_at' => $reviewAt,
                        'updated_at' => $reviewAt,
                    ]);
                }
            }
        }

        // 3. Seed Data Ruang Tumbuh (berelasi dengan user_id alumni)
        if (TumbuhRequest::count() === 0) {
            $tumbuhs = [
                [
                    'kode' => 'RT-20260725-RN112233',
                    'email' => 'rina.sari@alumni.sch.id',
                    'bidang_minat' => 'Legalitas usaha',
                    'topik_pendampingan' => 'Pendampingan izin PIRT dan sertifikasi halal produk roti & kue kering Dapur Rina',
                    'kebutuhan_jadwal' => 'Kamis sore pukul 15.30 WIB via Zoom.',
                    'status' => 'Selesai',
                    'catatan_admin' => 'Sertifikat PIRT dan Halal Self-Declare telah terbit.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(3)->subDays(10),
                ],
                [
                    'kode' => 'RT-20260805-AA11BB22',
                    'email' => 'dimas.saputra@alumni.sch.id',
                    'bidang_minat' => 'Branding dan pemasaran',
                    'topik_pendampingan' => 'Strategi konten TikTok & katalog WhatsApp Business untuk produk kuliner',
                    'kebutuhan_jadwal' => 'Rabu atau Sabtu sore pukul 15.00–17.00 WIB via Zoom.',
                    'status' => 'Disetujui',
                    'catatan_admin' => 'Dijadwalkan bersama mentor pemasaran digital minggu depan.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(3),
                ],
                [
                    'kode' => 'RT-20260919-CC33DD44',
                    'email' => 'nadia.putri@alumni.sch.id',
                    'bidang_minat' => 'Legalitas usaha',
                    'topik_pendampingan' => 'Pengurusan NIB OSS, PIRT, dan sertifikasi halal self-declare',
                    'kebutuhan_jadwal' => 'Fleksibel hari kerja pagi, butuh panduan langkah demi langkah.',
                    'status' => 'Selesai',
                    'catatan_admin' => 'NIB sudah terbit, proses halal dalam pendampingan PPH.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(2),
                ],
                [
                    'kode' => 'RT-20261022-EE55FF66',
                    'email' => 'rizky.r@alumni.sch.id',
                    'bidang_minat' => 'Persiapan kerja',
                    'topik_pendampingan' => 'Review CV ATS, portofolio desain, dan simulasi wawancara kerja',
                    'kebutuhan_jadwal' => 'Akhir pekan pukul 10.00 WIB.',
                    'status' => 'Menunggu',
                    'catatan_admin' => null,
                    'reviewed_by' => null,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonth(),
                ],
                [
                    'kode' => 'RT-20261115-GG77HH88',
                    'email' => 'ayu.wulan@alumni.sch.id',
                    'bidang_minat' => 'Keuangan usaha',
                    'topik_pendampingan' => 'Menghitung HPP produk roti dan pembukuan arus kas sederhana',
                    'kebutuhan_jadwal' => 'Selasa/Kamis malam pukul 19.00 WIB.',
                    'status' => 'Menunggu',
                    'catatan_admin' => null,
                    'reviewed_by' => null,
                    'created_at' => Carbon::now('Asia/Jakarta')->subDays(5),
                ],
            ];

            foreach ($tumbuhs as $t) {
                $alumni = $alumniByEmail[$t['email']];
                TumbuhRequest::create([
                    ...$t,
                    'user_id' => $alumni->id,
                    'nama' => $alumni->name,
                    'email' => $alumni->email,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                ]);
            }
        }

        // 4. Seed Data Ruang Pasar (berelasi dengan user_id alumni)
        if (PasarProduct::count() === 0) {
            $pasars = [
                [
                    'kode' => 'RP-20260720-PA110011',
                    'email' => 'rina.sari@alumni.sch.id',
                    'nama_produk' => 'Dapur Rina — Nastar Wisman & Roti Sobek Premium',
                    'kategori' => 'Kuliner',
                    'thumbnail' => '/images/etalase/kuliner.webp',
                    'deskripsi' => 'Kue kering nastar butter wisman dan roti sobek lembut tanpa pengawet. Cocok untuk hantaran, rapat kantor, dan camilan keluarga. Tersedia kemasan toples 500gr dan box isi 12.',
                    'harga' => 'Mulai Rp45.000',
                    'kontak_link' => '081234567801',
                    'status_publikasi' => 'Tayang',
                    'catatan_admin' => 'Produk terverifikasi, layak tayang di etalase.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(4),
                ],
                [
                    'kode' => 'RP-20260828-PA220022',
                    'email' => 'siti.nur@alumni.sch.id',
                    'nama_produk' => 'Nura Atelier — Jahit Custom & Kemeja Linen Kasual',
                    'kategori' => 'Fashion',
                    'thumbnail' => '/images/etalase/fashion.webp',
                    'deskripsi' => 'Menerima jahit seragam komunitas, kebaya wisuda, serta ready stock kemeja linen breathable ukuran S–XXL dengan jahitan butik rapi.',
                    'harga' => 'Rp125.000 – Rp275.000',
                    'kontak_link' => '081234567803',
                    'status_publikasi' => 'Tayang',
                    'catatan_admin' => 'Tayang di etalase.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(3),
                ],
                [
                    'kode' => 'RP-20260930-PA330033',
                    'email' => 'bagus.pratama@alumni.sch.id',
                    'nama_produk' => 'Pratama Visual — Jasa Foto Produk UMKM & Desain Feed',
                    'kategori' => 'Jasa kreatif',
                    'thumbnail' => '/images/etalase/jasa-kreatif.webp',
                    'deskripsi' => 'Paket foto katalog produk makanan/fashion (15 foto edited high-res) dan desain 12 konten Instagram/TikTok untuk menaikkan daya tarik toko online Anda.',
                    'harga' => 'Mulai Rp150.000 / paket',
                    'kontak_link' => '081234567804',
                    'status_publikasi' => 'Tayang',
                    'catatan_admin' => 'Konten jelas dan informatif.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(2),
                ],
                [
                    'kode' => 'RP-20261019-PA440044',
                    'email' => 'dewi.lestari@alumni.sch.id',
                    'nama_produk' => 'Glow by Dewi — Jasa Makeup Wisuda & Lamaran',
                    'kategori' => 'Kecantikan',
                    'thumbnail' => '/images/etalase/kecantikan.webp',
                    'deskripsi' => 'Layanan makeup flawless tahan lama untuk wisuda, lamaran, bridesmaid, dan photoshoot. Bisa home service area Pacitan kota.',
                    'harga' => 'Mulai Rp200.000',
                    'kontak_link' => '081234567805',
                    'status_publikasi' => 'Tayang',
                    'catatan_admin' => 'Disetujui tayang.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonth(),
                ],
                [
                    'kode' => 'RP-20261112-PA550055',
                    'email' => 'hendra.w@alumni.sch.id',
                    'nama_produk' => 'Wijaya Craft — Hampers Anyaman Bambu & Souvenir',
                    'kategori' => 'Kerajinan',
                    'thumbnail' => '/images/etalase/kerajinan.webp',
                    'deskripsi' => 'Kerajinan besek hampers premium, tatakan gelas, dan souvenir pernikahan ramah lingkungan berbahan bambu lokal Trenggalek.',
                    'harga' => 'Mulai Rp35.000',
                    'kontak_link' => '081234567806',
                    'status_publikasi' => 'Menunggu Moderasi',
                    'catatan_admin' => null,
                    'reviewed_by' => null,
                    'created_at' => Carbon::now('Asia/Jakarta')->subDays(7),
                ],
                [
                    'kode' => 'RP-20261118-PA660066',
                    'email' => 'fajar.n@alumni.sch.id',
                    'nama_produk' => 'Fajar Tech — Servis Laptop & Pembuatan Landing Page UMKM',
                    'kategori' => 'Teknologi',
                    'thumbnail' => '/images/etalase/teknologi.webp',
                    'deskripsi' => 'Upgrade SSD/RAM, instalasi software legal, serta pembuatan website profil usaha dan katalog online responsif untuk UMKM.',
                    'harga' => 'Mulai Rp100.000',
                    'kontak_link' => '081234567807',
                    'status_publikasi' => 'Tayang',
                    'catatan_admin' => 'Terverifikasi.',
                    'reviewed_by' => $adminId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subDays(4),
                ],
            ];

            foreach ($pasars as $p) {
                $alumni = $alumniByEmail[$p['email']];
                PasarProduct::create([
                    ...$p,
                    'user_id' => $alumni->id,
                    'nama_alumni' => $alumni->name,
                    'email' => $alumni->email,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                ]);
            }
        }

        // 5. Seed Data Monitoring (berelasi dengan user_id alumni & ref_kode ajuan)
        if (Monitoring::count() === 0) {
            $monitorings = [
                [
                    'kode' => 'MON-20260910-M0011223',
                    'ref_kode' => 'RM-20260712-A1B2C3D4',
                    'email' => 'rina.sari@alumni.sch.id',
                    'modul' => 'Modal',
                    'tanggal_pantau' => Carbon::now('Asia/Jakarta')->subMonths(2)->format('Y-m-d'),
                    'status_produktif' => 'Usaha aktif berkembang',
                    'pendapatan_omzet' => 'Rp4.800.000 / bulan',
                    'pendapatan_nominal' => 4800000,
                    'catatan' => 'Oven dan mixer digunakan rutin, sudah menerima pesanan tetap dari 3 koperasi sekolah.',
                    'petugas' => 'Petugas Monitoring',
                    'created_by' => $petugasId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonths(2),
                ],
                [
                    'kode' => 'MON-20261015-M0044556',
                    'ref_kode' => 'RM-20260818-E5F6G7H8',
                    'email' => 'fauzi.ahmad@alumni.sch.id',
                    'modul' => 'Modal',
                    'tanggal_pantau' => Carbon::now('Asia/Jakarta')->subMonth()->format('Y-m-d'),
                    'status_produktif' => 'Bekerja & usaha sampingan aktif',
                    'pendapatan_omzet' => 'Rp3.600.000 / bulan',
                    'pendapatan_nominal' => 3600000,
                    'catatan' => 'Peralatan kerja menambah pendapatan servis panggilan akhir pekan sekitar Rp1,2 juta/bulan.',
                    'petugas' => 'Petugas Monitoring',
                    'created_by' => $petugasId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subMonth(),
                ],
                [
                    'kode' => 'MON-20261110-M0077889',
                    'ref_kode' => 'RP-20260828-PA220022',
                    'email' => 'siti.nur@alumni.sch.id',
                    'modul' => 'Pasar',
                    'tanggal_pantau' => Carbon::now('Asia/Jakarta')->subDays(8)->format('Y-m-d'),
                    'status_produktif' => 'Pesanan meningkat dari Etalase',
                    'pendapatan_omzet' => 'Rp5.250.000 / bulan',
                    'pendapatan_nominal' => 5250000,
                    'catatan' => 'Mendapat 18 pesanan baru setelah tampil di Etalase Ruang Pasar.',
                    'petugas' => 'Petugas Monitoring',
                    'created_by' => $petugasId,
                    'created_at' => Carbon::now('Asia/Jakarta')->subDays(8),
                ],
            ];

            foreach ($monitorings as $mon) {
                $alumni = $alumniByEmail[$mon['email']];
                unset($mon['email']);
                Monitoring::create([
                    ...$mon,
                    'user_id' => $alumni->id,
                    'nama_alumni' => $alumni->name,
                ]);
            }
        }

        // 6. Sinkronkan relasi user_id & data Blueprint (Rubrik Skor, BAST, Tahap Monitoring) untuk data eksisting
        $blueprintUpdates = [
            'RM-20260712-A1B2C3D4' => [
                'guru_pendamping' => 'Drs. Hendro Wibowo, M.Pd.',
                'komitmen_pendampingan' => true,
                'status_seleksi' => 'Disalurkan',
                'skor_kompetensi' => 92,
                'skor_rencana' => 90,
                'skor_kebutuhan' => 88,
                'skor_dampak' => 90,
                'skor_komitmen' => 95,
                'skor_total' => 90.40,
                'nominal_disetujui' => 3500000,
                'rincian_bantuan_disalurkan' => '1 unit Oven Listrik 60L, 1 unit Stand Mixer kapasitas 5L, loyang stainless 6 pcs',
                'nomor_bast' => 'BAST/DT-RM/2026/08/C3D4',
                'tanggal_penyaluran' => Carbon::now('Asia/Jakarta')->subMonths(3)->format('Y-m-d'),
            ],
            'RM-20260818-E5F6G7H8' => [
                'guru_pendamping' => 'Ir. Bambang Sutrisno',
                'komitmen_pendampingan' => true,
                'status_seleksi' => 'Disalurkan',
                'skor_kompetensi' => 90,
                'skor_rencana' => 86,
                'skor_kebutuhan' => 88,
                'skor_dampak' => 85,
                'skor_komitmen' => 90,
                'skor_total' => 87.50,
                'nominal_disetujui' => 2750000,
                'rincian_bantuan_disalurkan' => '1 set kunci ring pas lengkap, dongkrak buaya 2 ton, kompresor mini portable',
                'nomor_bast' => 'BAST/DT-RM/2026/09/G7H8',
                'tanggal_penyaluran' => Carbon::now('Asia/Jakarta')->subMonths(2)->format('Y-m-d'),
            ],
            'RM-20260925-I9J0K1L2' => [
                'guru_pendamping' => 'Hj. Sri Wahyuni, S.Pd.',
                'komitmen_pendampingan' => true,
            ],
            'RM-20261014-M3N4O5P6' => [
                'guru_pendamping' => 'Arif Rahman Hakim, S.Kom.',
                'komitmen_pendampingan' => true,
                'skor_kompetensi' => 85,
                'skor_rencana' => 70,
                'skor_kebutuhan' => 72,
                'skor_dampak' => 78,
                'skor_komitmen' => 85,
                'skor_total' => 76.60,
            ],
            'RM-20261108-Q7R8S9T0' => [
                'guru_pendamping' => 'Dra. Ratna Kusumawati',
                'komitmen_pendampingan' => true,
            ],
        ];

        foreach ($blueprintUpdates as $kode => $fields) {
            ModalApplication::where('kode', $kode)->update($fields);
        }

        $monitoringBlueprintUpdates = [
            'MON-20260910-M0011223' => [
                'tahap_pantau' => 'Bulan 3-4 (Produktivitas & Pemasaran)',
                'pemanfaatan_bantuan' => 'Digunakan sesuai tujuan',
            ],
            'MON-20261015-M0044556' => [
                'tahap_pantau' => 'Bulan 1-2 (Implementasi)',
                'pemanfaatan_bantuan' => 'Digunakan sesuai tujuan',
            ],
            'MON-20261110-M0077889' => [
                'tahap_pantau' => 'Bulan 5-6 (Evaluasi & Keberlanjutan)',
                'pemanfaatan_bantuan' => 'Digunakan sesuai tujuan',
            ],
        ];

        foreach ($monitoringBlueprintUpdates as $monKode => $mFields) {
            Monitoring::where('kode', $monKode)->update($mFields);
        }

        foreach ($alumniByEmail as $email => $alumni) {
            ModalApplication::where('email', $email)
                ->orWhere('nama', $alumni->name)
                ->update([
                    'user_id' => $alumni->id,
                    'nama' => $alumni->name,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                    'tahun_lulus' => $alumni->tahun_lulus,
                    'kompetensi' => $alumni->kompetensi,
                ]);

            TumbuhRequest::where('email', $email)
                ->orWhere('nama', $alumni->name)
                ->update([
                    'user_id' => $alumni->id,
                    'nama' => $alumni->name,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                ]);

            PasarProduct::where('email', $email)
                ->orWhere('nama_alumni', $alumni->name)
                ->update([
                    'user_id' => $alumni->id,
                    'nama_alumni' => $alumni->name,
                    'whatsapp' => $alumni->whatsapp,
                    'sekolah' => $alumni->sekolah,
                ]);

            Monitoring::where('nama_alumni', $alumni->name)
                ->update([
                    'user_id' => $alumni->id,
                ]);

            Testimonial::where('nama', $alumni->name)
                ->update([
                    'user_id' => $alumni->id,
                ]);
        }
    }
}
