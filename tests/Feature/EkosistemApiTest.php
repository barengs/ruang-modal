<?php

namespace Tests\Feature;

use App\Models\PasarProduct;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EkosistemApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_hybrid_monolith_root_serves_react_spa(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('<div id="root"></div>', false);
    }

    public function test_public_can_submit_modal_tumbuh_and_pasar(): void
    {
        $modalRes = $this->postJson('/api/public/modal', [
            'nama' => 'Budi Santoso',
            'email' => 'budi@alumni.sch.id',
            'whatsapp' => '081234567890',
            'sekolah' => 'SMAN 1 Tuban',
            'tahun_lulus' => '2025',
            'kompetensi' => 'Tata Boga',
            'jalur' => 'Usaha',
            'status_aktivitas' => 'Merintis usaha',
            'jenis_bantuan' => 'Mesin/peralatan usaha',
            'estimasi_biaya' => 2500000,
            'rincian_kebutuhan' => 'Oven gas 1 deck',
            'rencana_deskripsi' => 'Produksi roti rumahan',
        ]);
        $modalRes->assertStatus(201)->assertJsonStructure(['kode', 'message']);

        $tumbuhRes = $this->postJson('/api/public/tumbuh', [
            'nama' => 'Siti Aminah',
            'email' => 'siti@alumni.sch.id',
            'whatsapp' => '081234567891',
            'sekolah' => 'SMAN 1 Lamongan',
            'bidang_minat' => 'Branding dan pemasaran',
            'topik_pendampingan' => 'Strategi jualan online',
            'kebutuhan_jadwal' => 'Sabtu sore',
        ]);
        $tumbuhRes->assertStatus(201)->assertJsonStructure(['kode', 'message']);

        $pasarRes = $this->postJson('/api/public/pasar', [
            'nama_alumni' => 'Rudi Hartono',
            'email' => 'rudi@alumni.sch.id',
            'whatsapp' => '081234567892',
            'sekolah' => 'SMAN 1 Ngawi',
            'nama_produk' => 'Keripik Tempe Renyah',
            'kategori' => 'Kuliner',
            'deskripsi' => 'Keripik tempe gurih berbagai rasa.',
            'harga' => 'Rp15.000',
            'kontak_link' => '081234567892',
        ]);
        $pasarRes->assertStatus(201);

        // Before moderation, product must NOT appear in public showcase
        $publicPasar = $this->getJson('/api/public/pasar');
        $publicPasar->assertOk()->assertJsonPath('total', 0);
    }

    public function test_jwt_auth_and_spatie_permission_rbac(): void
    {
        // Login as Admin
        $login = $this->postJson('/api/auth/login', [
            'email' => 'admin@doubletrack.sch.id',
            'password' => 'password123',
        ]);
        $login->assertOk()->assertJsonStructure(['access_token', 'token_type', 'user' => ['roles', 'permissions']]);
        $adminToken = $login->json('access_token');

        // Admin can access dashboard
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure(['counts', 'charts' => ['monthly_submissions', 'modal_by_status', 'pasar_by_category']]);

        // Admin CANNOT access user management (403 Forbidden via Spatie Permission)
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/users')
            ->assertStatus(403);

        // Admin moderates a Pasar product to Tayang -> becomes visible publicly
        $product = PasarProduct::create([
            'kode' => PasarProduct::generateKode(),
            'nama_alumni' => 'Ani',
            'email' => 'ani@alumni.sch.id',
            'whatsapp' => '081234567899',
            'sekolah' => 'SMAN 1 Tuban',
            'nama_produk' => 'Batik Tulis Tuban',
            'kategori' => 'Fashion',
            'deskripsi' => 'Batik tulis asli karya alumni.',
            'harga' => 'Rp250.000',
            'kontak_link' => '081234567899',
            'status_publikasi' => 'Menunggu Moderasi',
        ]);

        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->patchJson("/api/admin/pasar/{$product->id}", [
                'status_publikasi' => 'Tayang',
                'catatan_admin' => 'Lolos kurasi',
            ])
            ->assertOk();

        $this->getJson('/api/public/pasar')
            ->assertOk()
            ->assertJsonPath('total', 1);
    }

    public function test_petugas_monitoring_permissions_and_super_admin_access(): void
    {
        $petugasLogin = $this->postJson('/api/auth/login', [
            'email' => 'petugas@doubletrack.sch.id',
            'password' => 'password123',
        ]);
        $petugasToken = $petugasLogin->json('access_token');

        // Petugas can create monitoring
        $this->withHeader('Authorization', "Bearer {$petugasToken}")
            ->postJson('/api/admin/monitoring', [
                'nama_alumni' => 'Rina Sari Dewi',
                'modul' => 'Modal',
                'tanggal_pantau' => '2026-11-20',
                'status_produktif' => 'Usaha aktif',
                'pendapatan_omzet' => 'Rp4.000.000',
            ])
            ->assertStatus(201);

        // Petugas CANNOT view Ruang Modal applications (403)
        $this->withHeader('Authorization', "Bearer {$petugasToken}")
            ->getJson('/api/admin/modal')
            ->assertStatus(403);

        // Super Admin CAN access users & roles
        $superLogin = $this->postJson('/api/auth/login', [
            'email' => 'superadmin@doubletrack.sch.id',
            'password' => 'password123',
        ]);
        $superToken = $superLogin->json('access_token');

        $this->withHeader('Authorization', "Bearer {$superToken}")
            ->getJson('/api/admin/users')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$superToken}")
            ->getJson('/api/admin/roles')
            ->assertOk();
    }

    public function test_separated_alumni_and_users_permissions_in_role_management(): void
    {
        $adminLogin = $this->postJson('/api/auth/login', [
            'email' => 'admin@doubletrack.sch.id',
            'password' => 'password123',
        ]);
        $adminToken = $adminLogin->json('access_token');

        // Admin CAN access Data Alumni
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/alumni')
            ->assertOk();

        // Admin CANNOT access Data Pengelola (Users)
        $this->withHeader('Authorization', "Bearer {$adminToken}")
            ->getJson('/api/admin/users')
            ->assertStatus(403);

        $superLogin = $this->postJson('/api/auth/login', [
            'email' => 'superadmin@doubletrack.sch.id',
            'password' => 'password123',
        ]);
        $superToken = $superLogin->json('access_token');

        // Super Admin CAN access both Data Alumni and Data Pengelola
        $this->withHeader('Authorization', "Bearer {$superToken}")
            ->getJson('/api/admin/alumni')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$superToken}")
            ->getJson('/api/admin/users')
            ->assertOk();

        // Check that permissions are present in roles endpoint
        $rolesResponse = $this->withHeader('Authorization', "Bearer {$superToken}")
            ->getJson('/api/admin/roles')
            ->assertOk();

        $allPerms = $rolesResponse->json('all_permissions');
        $this->assertContains('alumni.view', $allPerms);
        $this->assertContains('alumni.create', $allPerms);
        $this->assertContains('alumni.update', $allPerms);
        $this->assertContains('alumni.delete', $allPerms);
        $this->assertContains('users.view', $allPerms);
        $this->assertContains('users.create', $allPerms);
        $this->assertContains('users.update', $allPerms);
        $this->assertContains('users.delete', $allPerms);

        // Test updating role permissions succeeds without validation error
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->where('guard_name', 'api')->first();
        $updateRes = $this->withHeader('Authorization', "Bearer {$superToken}")
            ->patchJson("/api/admin/roles/{$adminRole->id}/permissions", [
                'permissions' => [
                    'dashboard.view',
                    'alumni.view',
                    'alumni.create',
                    'alumni.update',
                    'alumni.delete',
                    'users.view',
                ],
            ]);
        $updateRes->assertOk()
            ->assertJsonPath('data.permissions', [
                'dashboard.view',
                'alumni.view',
                'alumni.create',
                'alumni.update',
                'alumni.delete',
                'users.view',
            ]);

        // Test GET /api/admin/modal/{id}
        $app = \App\Models\ModalApplication::first();
        if ($app) {
            $this->withHeader('Authorization', "Bearer {$superToken}")
                ->getJson("/api/admin/modal/{$app->id}")
                ->assertOk()
                ->assertJsonStructure(['data' => ['id', 'kode', 'nama', 'histories']]);
        }
    }

    public function test_applicant_and_admin_can_update_modal_attachment(): void
    {
        $app = \App\Models\ModalApplication::create([
            'nama' => 'Ahmad Dahlan',
            'email' => 'ahmad@alumni.sch.id',
            'whatsapp' => '081234567899',
            'sekolah' => 'SMAN 1 Tuban',
            'tahun_lulus' => '2024',
            'kompetensi' => 'Teknik Elektro',
            'jalur' => 'Usaha',
            'status_aktivitas' => 'Merintis usaha',
            'jenis_bantuan' => 'Peralatan solder',
            'estimasi_biaya' => 1500000,
            'rincian_kebutuhan' => 'Solder station',
            'rencana_deskripsi' => 'Servis elektronik',
            'kode' => \App\Models\ModalApplication::generateKode(),
            'status_seleksi' => 'Perlu Perbaikan',
        ]);

        \Illuminate\Support\Facades\Storage::fake('public');
        $fakePdf = \Illuminate\Http\UploadedFile::fake()->create('revisi_rab.pdf', 300, 'application/pdf');

        // 1. Guest update with wrong email should fail 403
        $this->postJson("/api/public/modal/{$app->id}/lampiran", [
            'dokumen_lampiran' => $fakePdf,
            'email' => 'wrong@email.com',
        ])->assertStatus(403);

        // 2. Guest update with matching email should succeed
        $resGuest = $this->postJson("/api/public/modal/{$app->id}/lampiran", [
            'dokumen_lampiran' => $fakePdf,
            'email' => 'ahmad@alumni.sch.id',
            'catatan' => 'Revisi spesifikasi solder station dan invoice pembanding',
        ]);
        $resGuest->assertOk()
            ->assertJsonPath('message', 'Dokumen lampiran berhasil diperbarui.');

        $app->refresh();
        $this->assertNotNull($app->dokumen_lampiran);
        $this->assertStringContainsString('proposal-modal-', $app->dokumen_lampiran);

        // History entry should exist
        $history = $app->histories()->latest()->first();
        $this->assertNotNull($history);
        $this->assertStringContainsString('Revisi spesifikasi solder station', $history->catatan);
    }
}
