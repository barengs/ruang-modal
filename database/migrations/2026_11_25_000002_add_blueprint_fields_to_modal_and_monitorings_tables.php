<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modal_applications', function (Blueprint $table) {
            if (! Schema::hasColumn('modal_applications', 'guru_pendamping')) {
                $table->string('guru_pendamping', 150)->nullable()->after('rencana_deskripsi');
                $table->string('dokumen_lampiran', 255)->nullable()->after('guru_pendamping');
                $table->boolean('komitmen_pendampingan')->default(true)->after('dokumen_lampiran');

                // Rubrik Penilaian 5 Indikator (Bobot 100%)
                $table->unsignedTinyInteger('skor_kompetensi')->nullable()->after('catatan_admin');
                $table->unsignedTinyInteger('skor_rencana')->nullable()->after('skor_kompetensi');
                $table->unsignedTinyInteger('skor_kebutuhan')->nullable()->after('skor_rencana');
                $table->unsignedTinyInteger('skor_dampak')->nullable()->after('skor_kebutuhan');
                $table->unsignedTinyInteger('skor_komitmen')->nullable()->after('skor_dampak');
                $table->decimal('skor_total', 5, 2)->nullable()->after('skor_komitmen');

                // Pengadaan, Penyaluran & Berita Acara Serah Terima (BAST)
                $table->unsignedBigInteger('nominal_disetujui')->nullable()->after('skor_total');
                $table->text('rincian_bantuan_disalurkan')->nullable()->after('nominal_disetujui');
                $table->string('nomor_bast', 100)->nullable()->after('rincian_bantuan_disalurkan');
                $table->date('tanggal_penyaluran')->nullable()->after('nomor_bast');
            }
        });

        Schema::table('monitorings', function (Blueprint $table) {
            if (! Schema::hasColumn('monitorings', 'tahap_pantau')) {
                $table->string('tahap_pantau', 100)->nullable()->after('tanggal_pantau');
                $table->string('pemanfaatan_bantuan', 120)->nullable()->after('tahap_pantau');
            }
        });
    }

    public function down(): void
    {
        Schema::table('modal_applications', function (Blueprint $table) {
            if (Schema::hasColumn('modal_applications', 'guru_pendamping')) {
                $table->dropColumn([
                    'guru_pendamping',
                    'dokumen_lampiran',
                    'komitmen_pendampingan',
                    'skor_kompetensi',
                    'skor_rencana',
                    'skor_kebutuhan',
                    'skor_dampak',
                    'skor_komitmen',
                    'skor_total',
                    'nominal_disetujui',
                    'rincian_bantuan_disalurkan',
                    'nomor_bast',
                    'tanggal_penyaluran',
                ]);
            }
        });

        Schema::table('monitorings', function (Blueprint $table) {
            if (Schema::hasColumn('monitorings', 'tahap_pantau')) {
                $table->dropColumn(['tahap_pantau', 'pemanfaatan_bantuan']);
            }
        });
    }
};
