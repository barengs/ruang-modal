<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modal_application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modal_application_id')
                ->constrained('modal_applications')
                ->onDelete('cascade');
            $table->string('nama_file');
            $table->string('file_url');
            $table->string('file_path')->nullable();
            $table->string('jenis_dokumen', 80)->default('Proposal Usaha & RAB');
            $table->string('tipe_mime', 80)->nullable();
            $table->string('ekstensi', 20)->nullable();
            $table->unsignedBigInteger('ukuran_file')->nullable(); // dalam bytes
            $table->text('catatan')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['modal_application_id', 'created_at']);
        });

        // Migrasi data dokumen lampiran lama dari modal_applications ke tabel dokumen baru
        if (Schema::hasColumn('modal_applications', 'dokumen_lampiran')) {
            $applications = DB::table('modal_applications')
                ->whereNotNull('dokumen_lampiran')
                ->where('dokumen_lampiran', '!=', '')
                ->get();

            foreach ($applications as $app) {
                $raw = trim($app->dokumen_lampiran);
                if (empty($raw)) {
                    continue;
                }

                $decoded = json_decode($raw, true);
                if (is_array($decoded) && ! empty($decoded)) {
                    foreach ($decoded as $idx => $doc) {
                        if (is_array($doc) && ! empty($doc['url'])) {
                            $url = $doc['url'];
                            $name = $doc['name'] ?? basename($url);
                            $type = $doc['type'] ?? pathinfo($url, PATHINFO_EXTENSION);
                            $size = $doc['size'] ?? null;
                            DB::table('modal_application_documents')->insert([
                                'modal_application_id' => $app->id,
                                'nama_file' => $name,
                                'file_url' => $url,
                                'jenis_dokumen' => $idx === 0 ? 'Proposal Usaha & RAB' : 'Dokumen Pendukung',
                                'ekstensi' => strtolower($type),
                                'ukuran_file' => $size,
                                'created_at' => $app->created_at ?? now(),
                                'updated_at' => $app->updated_at ?? now(),
                            ]);
                        } elseif (is_string($doc) && ! empty($doc)) {
                            DB::table('modal_application_documents')->insert([
                                'modal_application_id' => $app->id,
                                'nama_file' => basename($doc),
                                'file_url' => $doc,
                                'jenis_dokumen' => $idx === 0 ? 'Proposal Usaha & RAB' : 'Dokumen Pendukung',
                                'ekstensi' => strtolower(pathinfo($doc, PATHINFO_EXTENSION)),
                                'created_at' => $app->created_at ?? now(),
                                'updated_at' => $app->updated_at ?? now(),
                            ]);
                        }
                    }
                } else {
                    DB::table('modal_application_documents')->insert([
                        'modal_application_id' => $app->id,
                        'nama_file' => basename($raw),
                        'file_url' => $raw,
                        'jenis_dokumen' => 'Proposal Usaha & RAB',
                        'ekstensi' => strtolower(pathinfo($raw, PATHINFO_EXTENSION)),
                        'created_at' => $app->created_at ?? now(),
                        'updated_at' => $app->updated_at ?? now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modal_application_documents');
    }
};
