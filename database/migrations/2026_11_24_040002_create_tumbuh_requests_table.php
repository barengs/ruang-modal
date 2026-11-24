<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tumbuh_requests', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 32)->unique();
            $table->string('nama', 150);
            $table->string('email', 150);
            $table->string('whatsapp', 40);
            $table->string('sekolah', 180);
            $table->string('bidang_minat', 100);
            $table->string('topik_pendampingan', 500);
            $table->text('kebutuhan_jadwal');
            $table->string('status', 50)->default('Menunggu')->index();
            $table->text('catatan_admin')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tumbuh_requests');
    }
};
