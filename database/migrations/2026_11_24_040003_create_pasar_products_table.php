<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasar_products', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 32)->unique();
            $table->string('nama_alumni', 150);
            $table->string('email', 150);
            $table->string('whatsapp', 40);
            $table->string('sekolah', 180);
            $table->string('nama_produk', 180);
            $table->string('kategori', 100)->index();
            $table->string('thumbnail', 500)->nullable();
            $table->text('deskripsi');
            $table->string('harga', 100)->nullable();
            $table->string('kontak_link', 500);
            $table->string('status_publikasi', 50)->default('Menunggu Moderasi')->index();
            $table->text('catatan_admin')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasar_products');
    }
};
