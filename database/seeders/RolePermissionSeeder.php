<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'dashboard.view',
            'modal.view',
            'modal.update',
            'modal.delete',
            'tumbuh.view',
            'tumbuh.update',
            'tumbuh.delete',
            'pasar.view',
            'pasar.moderate',
            'pasar.delete',
            'monitoring.view',
            'monitoring.create',
            'monitoring.delete',
            'master.manage',
            'users.manage',
            'roles.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate([
                'name' => $perm,
                'guard_name' => 'api',
            ]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $superAdmin->syncPermissions($permissions);

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $admin->syncPermissions([
            'dashboard.view',
            'modal.view',
            'modal.update',
            'tumbuh.view',
            'tumbuh.update',
            'pasar.view',
            'pasar.moderate',
            'monitoring.view',
            'monitoring.create',
            'master.manage',
        ]);

        $verifikator = Role::firstOrCreate(['name' => 'verifikator', 'guard_name' => 'api']);
        $verifikator->syncPermissions([
            'dashboard.view',
            'modal.view',
            'modal.update',
            'tumbuh.view',
            'tumbuh.update',
            'pasar.view',
            'pasar.moderate',
        ]);

        $petugas = Role::firstOrCreate(['name' => 'petugas-monitoring', 'guard_name' => 'api']);
        $petugas->syncPermissions([
            'dashboard.view',
            'monitoring.view',
            'monitoring.create',
            'master.manage',
        ]);

        $users = [
            [
                'name' => 'Super Admin DT',
                'email' => 'superadmin@doubletrack.sch.id',
                'password' => 'password123',
                'role' => 'super-admin',
            ],
            [
                'name' => 'Admin Pengelola',
                'email' => 'admin@doubletrack.sch.id',
                'password' => 'password123',
                'role' => 'admin',
            ],
            [
                'name' => 'Petugas Monitoring',
                'email' => 'petugas@doubletrack.sch.id',
                'password' => 'password123',
                'role' => 'petugas-monitoring',
            ],
        ];

        foreach ($users as $u) {
            $user = User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => $u['password'],
                ]
            );
            $user->syncRoles([$u['role']]);
        }
    }
}
