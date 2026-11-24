<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('pasar_products', 'thumbnail')) {
            Schema::table('pasar_products', function (Blueprint $table) {
                $table->string('thumbnail', 500)->nullable()->after('kategori');
            });
        }

        $defaults = [
            'Kuliner' => '/images/etalase/kuliner.webp',
            'Fashion' => '/images/etalase/fashion.webp',
            'Jasa kreatif' => '/images/etalase/jasa-kreatif.webp',
            'Kecantikan' => '/images/etalase/kecantikan.webp',
            'Kerajinan' => '/images/etalase/kerajinan.webp',
            'Teknologi' => '/images/etalase/teknologi.webp',
        ];

        foreach ($defaults as $kategori => $thumb) {
            DB::table('pasar_products')
                ->where('kategori', $kategori)
                ->whereNull('thumbnail')
                ->update(['thumbnail' => $thumb]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('pasar_products', 'thumbnail')) {
            Schema::table('pasar_products', function (Blueprint $table) {
                $table->dropColumn('thumbnail');
            });
        }
    }
};
