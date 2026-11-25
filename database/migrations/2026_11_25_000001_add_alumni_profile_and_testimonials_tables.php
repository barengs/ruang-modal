<?php

use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\Testimonial;
use App\Models\TumbuhRequest;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'whatsapp')) {
                $table->string('whatsapp', 40)->nullable()->after('email');
                $table->string('sekolah', 180)->nullable()->after('whatsapp');
                $table->string('tahun_lulus', 10)->nullable()->after('sekolah');
                $table->string('kompetensi', 120)->nullable()->after('tahun_lulus');
                $table->string('nama_usaha', 180)->nullable()->after('kompetensi');
            }
        });

        foreach (['modal_applications', 'tumbuh_requests', 'pasar_products', 'monitorings'] as $tableName) {
            if (Schema::hasTable($tableName) && ! Schema::hasColumn($tableName, 'user_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
                });
            }
        }

        if (! Schema::hasTable('testimonials')) {
            Schema::create('testimonials', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('nama', 150);
                $table->string('sekolah', 180);
                $table->string('angkatan', 10)->nullable();
                $table->string('kompetensi', 120)->nullable();
                $table->string('program', 80)->default('Penerima Ruang Modal');
                $table->string('usaha', 180)->nullable();
                $table->string('capaian', 180)->nullable();
                $table->text('kutipan');
                $table->boolean('is_approved')->default(true)->index();
                $table->timestamps();
            });
        }

        // Create alumni role and sample alumni user accounts
        if (Schema::hasTable('roles')) {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
            Role::firstOrCreate(['name' => 'alumni', 'guard_name' => 'api']);

            $demoAlumni = [
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
                    'name' => 'Bagus Pratama',
                    'email' => 'bagus.pratama@alumni.sch.id',
                    'password' => 'password123',
                    'whatsapp' => '081234567804',
                    'sekolah' => 'SMAN 1 Ngawi',
                    'tahun_lulus' => '2024',
                    'kompetensi' => 'Multimedia & Desain Grafis',
                    'nama_usaha' => 'Pratama Visual — Foto Produk UMKM',
                ],
            ];

            foreach ($demoAlumni as $al) {
                $u = User::updateOrCreate(
                    ['email' => $al['email']],
                    $al
                );
                $u->syncRoles(['alumni']);

                // Link existing submissions to this alumni user
                ModalApplication::where('email', $u->email)->update(['user_id' => $u->id]);
                TumbuhRequest::where('email', $u->email)->update(['user_id' => $u->id]);
                PasarProduct::where('email', $u->email)->update(['user_id' => $u->id]);
                Monitoring::where('nama_alumni', $u->name)->update(['user_id' => $u->id]);
            }
        }

        // Seed initial testimonials
        if (Testimonial::count() === 0) {
            $rinaId = User::where('email', 'rina.sari@alumni.sch.id')->value('id');
            $initialTestimonials = [
                [
                    'user_id' => $rinaId,
                    'nama' => 'Rina Sari Dewi',
                    'sekolah' => 'SMAN 1 Tuban',
                    'angkatan' => '2024',
                    'kompetensi' => 'Tata Boga',
                    'program' => 'Penerima Ruang Modal',
                    'usaha' => 'Dapur Rina — Bakery & Kue Kering',
                    'capaian' => 'Omzet Rp4.800.000 / bulan',
                    'kutipan' => 'Bantuan oven listrik 60L dan stand mixer dari Ruang Modal membuat kapasitas produksi roti sobek dan nastar saya meningkat tiga kali lipat. Kini saya rutin menyuplai 3 koperasi sekolah dan pesanan hantaran kantor.',
                    'is_approved' => true,
                ],
                [
                    'user_id' => null,
                    'nama' => 'Nadia Putri',
                    'sekolah' => 'SMAN 1 Sumenep',
                    'angkatan' => '2024',
                    'kompetensi' => 'Tata Boga',
                    'program' => 'Alumni Ruang Tumbuh',
                    'usaha' => 'Nadia Snack & Camilan Madura',
                    'capaian' => 'NIB OSS & Sertifikat Halal Terbit',
                    'kutipan' => 'Melalui pendampingan Ruang Tumbuh, saya dibimbing langkah demi langkah mengurus NIB, PIRT, hingga sertifikasi halal self-declare. Produk saya sekarang dipercaya masuk ke toko oleh-oleh modern di Sumenep.',
                    'is_approved' => true,
                ],
                [
                    'user_id' => null,
                    'nama' => 'Ahmad Fauzi',
                    'sekolah' => 'SMAN 2 Bojonegoro',
                    'angkatan' => '2025',
                    'kompetensi' => 'Teknik Kendaraan Ringan',
                    'program' => 'Penerima Ruang Modal',
                    'usaha' => 'Fauzi Auto Care — Servis Panggilan',
                    'capaian' => 'Pendapatan +Rp3.600.000 / bulan',
                    'kutipan' => 'Fasilitasi toolset kunci lengkap, dongkrak buaya, dan kompresor portable sangat membantu saya membuka layanan servis motor dan mobil panggilan di akhir pekan selain bekerja di bengkel rekanan.',
                    'is_approved' => true,
                ],
                [
                    'user_id' => null,
                    'nama' => 'Dimas Saputra',
                    'sekolah' => 'SMAN 1 Sampang',
                    'angkatan' => '2025',
                    'kompetensi' => 'Multimedia & Desain Grafis',
                    'program' => 'Alumni Ruang Tumbuh',
                    'usaha' => 'Kuliner & Katalog UMKM',
                    'capaian' => 'Penjualan Online Naik 180%',
                    'kutipan' => 'Sesi mentoring branding dan strategi konten TikTok bersama mentor Ruang Tumbuh membuka wawasan saya tentang cara membuat katalog WhatsApp Business dan video produk yang menarik pembeli baru.',
                    'is_approved' => true,
                ],
            ];

            foreach ($initialTestimonials as $t) {
                Testimonial::create($t);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');

        foreach (['modal_applications', 'tumbuh_requests', 'pasar_products', 'monitorings'] as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'user_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('user_id');
                });
            }
        }

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'whatsapp')) {
                $table->dropColumn(['whatsapp', 'sekolah', 'tahun_lulus', 'kompetensi', 'nama_usaha']);
            }
        });
    }
};
