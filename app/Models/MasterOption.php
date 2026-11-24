<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MasterOption extends Model
{
    protected $fillable = [
        'group_key',
        'label',
        'description',
        'urutan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'urutan' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public static function defaultSeedData(): array
    {
        return [
            'jalur_pengajuan' => [
                ['label' => 'Kerja', 'description' => 'Jalur kesiapan kerja dan peralatan kerja profesi'],
                ['label' => 'Usaha', 'description' => 'Jalur rintisan dan pengembangan wirausaha mandiri'],
            ],
            'status_aktivitas' => [
                ['label' => 'Belum bekerja', 'description' => 'Lulusan baru atau sedang mencari pekerjaan'],
                ['label' => 'Sudah bekerja', 'description' => 'Sudah bekerja di industri/usaha rekanan'],
                ['label' => 'Merintis usaha', 'description' => 'Sedang memulai rintisan usaha baru'],
                ['label' => 'Usaha berjalan', 'description' => 'Memiliki usaha aktif yang sudah beroperasi'],
            ],
            'jenis_bantuan' => [
                ['label' => 'Peralatan kerja', 'description' => 'Bantuan perangkat atau perkakas penunjang kerja'],
                ['label' => 'Modal produksi/bahan baku', 'description' => 'Bantuan bahan baku awal untuk produksi usaha'],
                ['label' => 'Mesin/peralatan usaha', 'description' => 'Bantuan mesin atau alat produksi utama usaha'],
                ['label' => 'Peralatan pemasaran', 'description' => 'Bantuan perlengkapan display, kemasan, atau promosi'],
                ['label' => 'Kombinasi', 'description' => 'Kombinasi peralatan dan bahan produksi'],
            ],
            'kompetensi_dt' => [
                ['label' => 'Tata Boga', 'description' => 'Keterampilan pengolahan makanan, kue, dan kuliner'],
                ['label' => 'Tata Busana', 'description' => 'Keterampilan menjahit dan produksi pakaian/fashion'],
                ['label' => 'Tata Kecantikan', 'description' => 'Keterampilan tata rias wajah, rambut, dan kecantikan'],
                ['label' => 'Multimedia & Desain Grafis', 'description' => 'Keterampilan fotografi, videografi, dan desain visual'],
                ['label' => 'Teknik Kendaraan Ringan', 'description' => 'Keterampilan servis dan perawatan motor/mobil'],
                ['label' => 'Teknik Listrik & Elektronika', 'description' => 'Keterampilan instalasi listrik dan servis elektronik'],
                ['label' => 'Teknologi Informasi & Web', 'description' => 'Keterampilan servis komputer dan pembuatan website'],
                ['label' => 'Kriya & Kerajinan', 'description' => 'Keterampilan produk kerajinan tangan dan kriya lokal'],
            ],
            'bidang_minat' => [
                ['label' => 'Persiapan kerja', 'description' => 'Penyusunan CV, portofolio, dan simulasi wawancara'],
                ['label' => 'Pengembangan karier', 'description' => 'Konsultasi peningkatan kompetensi dan jenjang karier'],
                ['label' => 'Pengembangan usaha', 'description' => 'Strategi ekspansi dan manajemen operasional usaha'],
                ['label' => 'Produksi dan kualitas', 'description' => 'Standarisasi mutu produk dan efisiensi produksi'],
                ['label' => 'Legalitas usaha', 'description' => 'Pendampingan NIB OSS, PIRT, dan sertifikasi halal'],
                ['label' => 'Branding dan pemasaran', 'description' => 'Strategi pemasaran digital, media sosial, dan kemasan'],
                ['label' => 'Keuangan usaha', 'description' => 'Perhitungan HPP, arus kas, dan pembukuan UMKM'],
                ['label' => 'Kemitraan dan akses pasar', 'description' => 'Jejaring distribusi, reseller, dan kolaborasi B2B'],
            ],
            'kategori_pasar' => [
                ['label' => 'Kuliner', 'description' => 'Makanan olahan, minuman, katering, dan kue kering'],
                ['label' => 'Fashion', 'description' => 'Pakaian, busana muslim, jahit custom, dan aksesori'],
                ['label' => 'Jasa kreatif', 'description' => 'Fotografi, desain grafis, videografi, dan konten digital'],
                ['label' => 'Kecantikan', 'description' => 'Jasa makeup artist (MUA), perawatan, dan produk kecantikan'],
                ['label' => 'Kerajinan', 'description' => 'Hampers, anyaman, souvenir, dan produk kriya'],
                ['label' => 'Teknologi', 'description' => 'Servis laptop/HP, pembuatan website, dan solusi IT'],
                ['label' => 'Lainnya', 'description' => 'Produk dan layanan karya alumni kategori lainnya'],
            ],
            'topik_kontak' => [
                ['label' => 'Pengajuan Ruang Modal', 'description' => 'Pertanyaan seputar syarat dan seleksi Ruang Modal'],
                ['label' => 'Pendampingan Ruang Tumbuh', 'description' => 'Pertanyaan seputar jadwal dan sesi mentoring'],
                ['label' => 'Etalase Ruang Pasar', 'description' => 'Pertanyaan seputar kurasi dan penayangan produk'],
                ['label' => 'Kemitraan & Kolaborasi', 'description' => 'Penawaran kerja sama industri, mentor, atau sekolah'],
                ['label' => 'Kendala Teknis / Lainnya', 'description' => 'Laporan kendala teknis penggunaan portal'],
            ],
        ];
    }
}
