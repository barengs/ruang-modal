<?php

use App\Models\MasterOption;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('master_options', function (Blueprint $table) {
            $table->id();
            $table->string('group_key', 80)->index();
            $table->string('label', 180);
            $table->string('description', 300)->nullable();
            $table->integer('urutan')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        // Seed default master options
        foreach (MasterOption::defaultSeedData() as $groupKey => $items) {
            foreach ($items as $idx => $item) {
                MasterOption::create([
                    'group_key' => $groupKey,
                    'label' => $item['label'],
                    'description' => $item['description'] ?? null,
                    'urutan' => $idx + 1,
                    'is_active' => true,
                ]);
            }
        }

        // Register master.manage permission for super-admin and admin if roles exist
        if (Schema::hasTable('permissions') && Schema::hasTable('roles')) {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
            $perm = Permission::firstOrCreate([
                'name' => 'master.manage',
                'guard_name' => 'api',
            ]);

            foreach (['super-admin', 'admin'] as $roleName) {
                $role = Role::where('name', $roleName)->where('guard_name', 'api')->first();
                if ($role && ! $role->hasPermissionTo($perm)) {
                    $role->givePermissionTo($perm);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('master_options');
    }
};
