<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitorings', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 32)->unique();
            $table->string('ref_kode', 100)->nullable()->index();
            $table->string('nama_alumni', 150);
            $table->string('modul', 50)->index(); // Modal | Tumbuh | Pasar
            $table->date('tanggal_pantau');
            $table->string('status_produktif', 100);
            $table->string('pendapatan_omzet', 100)->nullable();
            $table->unsignedBigInteger('pendapatan_nominal')->default(0);
            $table->text('catatan')->nullable();
            $table->string('petugas', 150)->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitorings');
    }
};
