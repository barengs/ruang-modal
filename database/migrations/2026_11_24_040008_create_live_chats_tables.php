<?php

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_token', 64)->unique();
            $table->string('guest_name', 150);
            $table->string('guest_email', 150)->nullable();
            $table->string('guest_whatsapp', 40)->nullable();
            $table->string('guest_sekolah', 180)->nullable();
            $table->string('topik', 100)->default('Umum')->index();
            $table->string('status', 30)->default('aktif')->index();
            $table->unsignedInteger('unread_admin_count')->default(0);
            $table->unsignedInteger('unread_guest_count')->default(0);
            $table->timestamp('last_message_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_session_id')
                ->constrained('chat_sessions')
                ->cascadeOnDelete();
            $table->string('sender_type', 20)->index(); // 'guest' | 'admin'
            $table->string('sender_name', 150);
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // Register chat.manage permission
        if (Schema::hasTable('permissions') && Schema::hasTable('roles')) {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
            $perm = Permission::firstOrCreate([
                'name' => 'chat.manage',
                'guard_name' => 'api',
            ]);

            foreach (['super-admin', 'admin', 'verifikator'] as $roleName) {
                $role = Role::where('name', $roleName)->where('guard_name', 'api')->first();
                if ($role && ! $role->hasPermissionTo($perm)) {
                    $role->givePermissionTo($perm);
                }
            }
        }

        // Seed sample live chat conversations if users exist
        if (Schema::hasTable('users')) {
            $admin = User::where('email', 'admin@doubletrack.sch.id')->first();
            $adminName = $admin?->name ?? 'Admin Pengelola';

            $s1 = ChatSession::create([
                'session_token' => Str::random(40),
                'guest_name' => 'Bagus Pratama',
                'guest_whatsapp' => '081234567804',
                'guest_sekolah' => 'SMAN 1 Ngawi',
                'topik' => 'Ruang Modal',
                'status' => 'aktif',
                'unread_admin_count' => 1,
                'unread_guest_count' => 0,
                'last_message_at' => now()->subMinutes(12),
            ]);

            ChatMessage::create([
                'chat_session_id' => $s1->id,
                'sender_type' => 'guest',
                'sender_name' => 'Bagus Pratama',
                'message' => 'Halo kak, pengajuan Ruang Modal saya (RM-20261014-M3N4O5P6) statusnya Perlu Perbaikan. Untuk lampiran portofolio dikirim ke mana ya?',
                'is_read' => true,
                'created_at' => now()->subMinutes(25),
            ]);

            ChatMessage::create([
                'chat_session_id' => $s1->id,
                'sender_type' => 'admin',
                'sender_name' => $adminName,
                'sender_id' => $admin?->id,
                'message' => 'Halo Bagus! Kamu bisa melampirkan tautan Google Drive portofolio pada deskripsi rencana atau konfirmasi melalui nomor WhatsApp pengelola.',
                'is_read' => true,
                'created_at' => now()->subMinutes(18),
            ]);

            ChatMessage::create([
                'chat_session_id' => $s1->id,
                'sender_type' => 'guest',
                'sender_name' => 'Bagus Pratama',
                'message' => 'Baik kak, link Google Drive sudah saya siapkan. Apakah bisa saya kirimkan di chat ini juga?',
                'is_read' => false,
                'created_at' => now()->subMinutes(12),
            ]);

            $s2 = ChatSession::create([
                'session_token' => Str::random(40),
                'guest_name' => 'Dewi Lestari',
                'guest_whatsapp' => '081234567805',
                'guest_sekolah' => 'SMAN 1 Pacitan',
                'topik' => 'Ruang Tumbuh',
                'status' => 'aktif',
                'unread_admin_count' => 0,
                'unread_guest_count' => 0,
                'last_message_at' => now()->subHours(2),
            ]);

            ChatMessage::create([
                'chat_session_id' => $s2->id,
                'sender_type' => 'guest',
                'sender_name' => 'Dewi Lestari',
                'message' => 'Selamat siang, apakah jadwal mentoring branding untuk usaha jasa MUA bulan ini masih dibuka?',
                'is_read' => true,
                'created_at' => now()->subHours(2)->subMinutes(10),
            ]);

            ChatMessage::create([
                'chat_session_id' => $s2->id,
                'sender_type' => 'admin',
                'sender_name' => $adminName,
                'sender_id' => $admin?->id,
                'message' => 'Selamat siang Dewi, masih dibuka! Silakan isi formulir pada menu Pengajuan > Ruang Tumbuh ya.',
                'is_read' => true,
                'created_at' => now()->subHours(2),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
    }
};
