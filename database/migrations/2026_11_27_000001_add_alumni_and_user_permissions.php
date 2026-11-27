<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('permissions') && Schema::hasTable('roles')) {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();

            $newPermissions = [
                'alumni.view',
                'alumni.create',
                'alumni.update',
                'alumni.delete',
                'users.view',
                'users.create',
                'users.update',
                'users.delete',
            ];

            foreach ($newPermissions as $permName) {
                Permission::firstOrCreate([
                    'name' => $permName,
                    'guard_name' => 'api',
                ]);
            }

            // Super Admin gets all new permissions
            $superAdmin = Role::where('name', 'super-admin')->where('guard_name', 'api')->first();
            if ($superAdmin) {
                foreach ($newPermissions as $permName) {
                    $perm = Permission::where('name', $permName)->where('guard_name', 'api')->first();
                    if ($perm && ! $superAdmin->hasPermissionTo($perm)) {
                        $superAdmin->givePermissionTo($perm);
                    }
                }
            }

            // Admin role gets alumni full permissions
            $admin = Role::where('name', 'admin')->where('guard_name', 'api')->first();
            if ($admin) {
                $adminPerms = [
                    'alumni.view',
                    'alumni.create',
                    'alumni.update',
                    'alumni.delete',
                ];
                foreach ($adminPerms as $permName) {
                    $perm = Permission::where('name', $permName)->where('guard_name', 'api')->first();
                    if ($perm && ! $admin->hasPermissionTo($perm)) {
                        $admin->givePermissionTo($perm);
                    }
                }
            }

            app()[PermissionRegistrar::class]->forgetCachedPermissions();
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('permissions')) {
            $newPermissions = [
                'alumni.view',
                'alumni.create',
                'alumni.update',
                'alumni.delete',
                'users.view',
                'users.create',
                'users.update',
                'users.delete',
            ];

            Permission::whereIn('name', $newPermissions)
                ->where('guard_name', 'api')
                ->delete();

            app()[PermissionRegistrar::class]->forgetCachedPermissions();
        }
    }
};
