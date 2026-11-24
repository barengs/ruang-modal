<?php

namespace Database\Seeders;

use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        if (ModalApplication::count() > 0) {
            return;
        }

        $adminId = User::where('email', 'admin@doubletrack.sch.id')->value('id');
        $petugasId = User::where('email', 'petugas@doubletrack.sch.id')->value('id');

        $modals = [
            [
                'kode' => 'RM-20260712-A1B2C3D4',
                'nama' => 'Rina Sari Dewi',
                'email' => 'rina.sari@alumni.sch.id',
                'whatsapp' => '081234567801',
                'sekolah' => 'SMAN 1 Tuban',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Tata Boga',
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
                'nama' => 'Ahmad Fauzi',
                'email' => 'fauzi.ahmad@alumni.sch.id',
                'whatsapp' => '081234567802',
                'sekolah' => 'SMAN 2 Bojonegoro',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Teknik Kendaraan Ringan',
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
                'nama' => 'Siti Nurhaliza',
                'email' => 'siti.nur@alumni.sch.id',
                'whatsapp' => '081234567803',
                'sekolah' => 'SMAN 1 Lamongan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Tata Busana',
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
                'nama' => 'Bagus Pratama',
                'email' => 'bagus.pratama@alumni.sch.id',
                'whatsapp' => '081234567804',
                'sekolah' => 'SMAN 1 Ngawi',
                'tahun_lulus' => '2024',
                'kompetensi' => 'Multimedia & Desain Grafis',
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
                'nama' => 'Dewi Lestari',
                'email' => 'dewi.lestari@alumni.sch.id',
                'whatsapp' => '081234567805',
                'sekolah' => 'SMAN 1 Pacitan',
                'tahun_lulus' => '2025',
                'kompetensi' => 'Tata Kecantikan',
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
            ModalApplication::create($m);
        }

        $tumbuhs = [
            [
                'kode' => 'RT-20260805-AA11BB22',
                'nama' => 'Dimas Saputra',
                'email' => 'dimas.saputra@alumni.sch.id',
                'whatsapp' => '081345678901',
                'sekolah' => 'SMAN 1 Sampang',
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
                'nama' => 'Nadia Putri',
                'email' => 'nadia.putri@alumni.sch.id',
                'whatsapp' => '081345678902',
                'sekolah' => 'SMAN 1 Sumenep',
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
                'nama' => 'Rizky Ramadhan',
                'email' => 'rizky.r@alumni.sch.id',
                'whatsapp' => '081345678903',
                'sekolah' => 'SMAN 2 Bangkalan',
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
                'nama' => 'Ayu Wulandari',
                'email' => 'ayu.wulan@alumni.sch.id',
                'whatsapp' => '081345678904',
                'sekolah' => 'SMAN 1 Bondowoso',
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
            TumbuhRequest::create($t);
        }

        $pasars = [
            [
                'kode' => 'RP-20260720-PA110011',
                'nama_alumni' => 'Rina Sari Dewi',
                'email' => 'rina.sari@alumni.sch.id',
                'whatsapp' => '081234567801',
                'sekolah' => 'SMAN 1 Tuban',
                'nama_produk' => 'Dapur Rina — Nastar Wisman & Roti Sobek Premium',
                'kategori' => 'Kuliner',
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
                'nama_alumni' => 'Siti Nurhaliza',
                'email' => 'siti.nur@alumni.sch.id',
                'whatsapp' => '081234567803',
                'sekolah' => 'SMAN 1 Lamongan',
                'nama_produk' => 'Nura Atelier — Jahit Custom & Kemeja Linen Kasual',
                'kategori' => 'Fashion',
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
                'nama_alumni' => 'Bagus Pratama',
                'email' => 'bagus.pratama@alumni.sch.id',
                'whatsapp' => '081234567804',
                'sekolah' => 'SMAN 1 Ngawi',
                'nama_produk' => 'Pratama Visual — Jasa Foto Produk UMKM & Desain Feed',
                'kategori' => 'Jasa kreatif',
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
                'nama_alumni' => 'Dewi Lestari',
                'email' => 'dewi.lestari@alumni.sch.id',
                'whatsapp' => '081234567805',
                'sekolah' => 'SMAN 1 Pacitan',
                'nama_produk' => 'Glow by Dewi — Jasa Makeup Wisuda & Lamaran',
                'kategori' => 'Kecantikan',
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
                'nama_alumni' => 'Hendra Wijaya',
                'email' => 'hendra.w@alumni.sch.id',
                'whatsapp' => '081234567806',
                'sekolah' => 'SMAN 1 Trenggalek',
                'nama_produk' => 'Wijaya Craft — Hampers Anyaman Bambu & Souvenir',
                'kategori' => 'Kerajinan',
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
                'nama_alumni' => 'Fajar Nugroho',
                'email' => 'fajar.n@alumni.sch.id',
                'whatsapp' => '081234567807',
                'sekolah' => 'SMAN 1 Magetan',
                'nama_produk' => 'Fajar Tech — Servis Laptop & Pembuatan Landing Page UMKM',
                'kategori' => 'Teknologi',
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
            PasarProduct::create($p);
        }

        $monitorings = [
            [
                'kode' => 'MON-20260910-M0011223',
                'ref_kode' => 'RM-20260712-A1B2C3D4',
                'nama_alumni' => 'Rina Sari Dewi',
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
                'nama_alumni' => 'Ahmad Fauzi',
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
                'nama_alumni' => 'Siti Nurhaliza',
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
            Monitoring::create($mon);
        }
    }
}
