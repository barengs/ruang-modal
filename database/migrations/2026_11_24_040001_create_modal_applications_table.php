<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modal_applications', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 32)->unique();
            $table->string('nama', 150);
            $table->string('email', 150);
            $table->string('whatsapp', 40);
            $table->string('sekolah', 180);
            $table->string('tahun_lulus', 10);
            $table->string('kompetensi', 120);
            $table->string('jalur', 30); // Kerja | Usaha
            $table->string('status_aktivitas', 80)->nullable();
            $table->string('jenis_bantuan', 80);
            $table->text('rincian_kebutuhan');
            $table->unsignedBigInteger('estimasi_biaya')->default(0);
            $table->text('rencana_deskripsi');
            $table->string('status_seleksi', 50)->default('Menunggu Seleksi')->index();
            $table->text('catatan_admin')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modal_applications');
    }
};
