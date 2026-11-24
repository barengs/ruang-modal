<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modal_application_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('modal_application_id')
                ->constrained('modal_applications')
                ->cascadeOnDelete();
            $table->string('status_seleksi', 50);
            $table->text('catatan')->nullable();
            $table->string('actor_type', 30)->default('pemohon');
            $table->string('actor_name', 150);
            $table->timestamps();
        });

        // Backfill existing modal_applications with history records
        $applications = DB::table('modal_applications')->get();
        $users = DB::table('users')->pluck('name', 'id');

        foreach ($applications as $app) {
            $createdAt = $app->created_at ? Carbon::parse($app->created_at) : now();

            DB::table('modal_application_histories')->insert([
                'modal_application_id' => $app->id,
                'status_seleksi' => 'Menunggu Seleksi',
                'catatan' => 'Pengajuan Ruang Modal dikirim oleh pemohon.',
                'actor_type' => 'pemohon',
                'actor_name' => $app->nama,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            if ($app->status_seleksi !== 'Menunggu Seleksi' || ! empty($app->catatan_admin)) {
                $reviewTime = $createdAt->copy()->addDays(2);
                if ($reviewTime->isFuture()) {
                    $reviewTime = now();
                }
                $reviewerName = ($app->reviewed_by && isset($users[$app->reviewed_by]))
                    ? $users[$app->reviewed_by]
                    : 'Admin Pengelola';

                DB::table('modal_application_histories')->insert([
                    'modal_application_id' => $app->id,
                    'status_seleksi' => $app->status_seleksi,
                    'catatan' => $app->catatan_admin ?: 'Status seleksi diperbarui oleh pengelola.',
                    'actor_type' => 'admin',
                    'actor_name' => $reviewerName,
                    'created_at' => $reviewTime,
                    'updated_at' => $reviewTime,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('modal_application_histories');
    }
};
