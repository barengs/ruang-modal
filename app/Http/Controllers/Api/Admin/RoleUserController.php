<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleUserController extends Controller
{
    public function users(): JsonResponse
    {
        $users = User::with('roles:id,name')
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'alumni'))
            ->latest()
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'roles' => $u->getRoleNames()->values()->all(),
                'permissions' => $u->getAllPermissions()->pluck('name')->values()->all(),
                'created_at' => $u->created_at?->toISOString(),
            ]);

        $availableRoles = Role::where('guard_name', 'api')
            ->where('name', '!=', 'alumni')
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'data' => $users,
            'available_roles' => $availableRoles,
        ]);
    }

    public function alumniList(): JsonResponse
    {
        $alumni = User::with([
            'roles:id,name',
            'modalApplications:id,user_id,kode,jenis_bantuan,estimasi_biaya,status_seleksi,created_at',
            'tumbuhRequests:id,user_id,kode,bidang_minat,topik_pendampingan,status,created_at',
            'pasarProducts:id,user_id,kode,nama_produk,kategori,harga,status_publikasi,created_at',
            'monitorings:id,user_id,kode,ref_kode,modul,status_produktif,pendapatan_omzet,tanggal_pantau',
        ])
            ->whereHas('roles', fn ($q) => $q->where('name', 'alumni'))
            ->latest()
            ->get()
            ->map(fn (User $u) => $this->formatAlumniRecord($u));

        return response()->json([
            'data' => $alumni,
        ]);
    }

    public function storeAlumni(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'kompetensi' => ['required', 'string', 'max:120'],
            'nama_usaha' => ['nullable', 'string', 'max:180'],
        ]);

        Role::firstOrCreate(['name' => 'alumni', 'guard_name' => 'api']);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
            'whatsapp' => trim($validated['whatsapp']),
            'sekolah' => trim($validated['sekolah']),
            'tahun_lulus' => trim($validated['tahun_lulus']),
            'kompetensi' => trim($validated['kompetensi']),
            'nama_usaha' => $validated['nama_usaha'] ?? null,
        ]);

        $user->syncRoles(['alumni']);

        return response()->json([
            'data' => $this->formatAlumniRecord($user),
            'message' => 'Data akun alumni berhasil ditambahkan.',
        ], 201);
    }

    public function updateAlumni(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'whatsapp' => ['required', 'string', 'max:40'],
            'sekolah' => ['required', 'string', 'max:180'],
            'tahun_lulus' => ['required', 'string', 'max:10'],
            'kompetensi' => ['required', 'string', 'max:120'],
            'nama_usaha' => ['nullable', 'string', 'max:180'],
        ]);

        $user->update($validated);

        return response()->json([
            'data' => $this->formatAlumniRecord($user),
            'message' => 'Data profil alumni berhasil diperbarui.',
        ]);
    }

    protected function formatAlumniRecord(User $u): array
    {
        $u->loadMissing([
            'modalApplications:id,user_id,kode,jenis_bantuan,estimasi_biaya,status_seleksi,created_at',
            'tumbuhRequests:id,user_id,kode,bidang_minat,topik_pendampingan,status,created_at',
            'pasarProducts:id,user_id,kode,nama_produk,kategori,harga,status_publikasi,created_at',
            'monitorings:id,user_id,kode,ref_kode,modul,status_produktif,pendapatan_omzet,tanggal_pantau',
        ]);

        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'whatsapp' => $u->whatsapp,
            'sekolah' => $u->sekolah,
            'tahun_lulus' => $u->tahun_lulus,
            'kompetensi' => $u->kompetensi,
            'nama_usaha' => $u->nama_usaha,
            'modal_count' => $u->modalApplications->count(),
            'tumbuh_count' => $u->tumbuhRequests->count(),
            'pasar_count' => $u->pasarProducts->count(),
            'monitoring_count' => $u->monitorings->count(),
            'modal_applications' => $u->modalApplications,
            'tumbuh_requests' => $u->tumbuhRequests,
            'pasar_products' => $u->pasarProducts,
            'monitorings' => $u->monitorings,
            'created_at' => $u->created_at?->toISOString(),
        ];
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'api')],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values()->all(),
                'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
                'created_at' => $user->created_at?->toISOString(),
            ],
            'message' => 'Pengguna baru berhasil ditambahkan.',
        ], 201);
    }

    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'api')],
        ]);

        $user->syncRoles([$validated['role']]);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values()->all(),
                'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
            ],
            'message' => 'Role pengguna berhasil diperbarui.',
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        if ($user->id === auth('api')->id()) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }

    public function roles(): JsonResponse
    {
        $this->ensureDefaultSystemPermissions();

        $roles = Role::where('guard_name', 'api')
            ->where('name', '!=', 'alumni')
            ->with('permissions:id,name')
            ->get()
            ->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'permissions' => $r->permissions->pluck('name')->values()->all(),
            ]);

        $allPermissions = Permission::where('guard_name', 'api')
            ->orderBy('name')
            ->pluck('name')
            ->values()
            ->all();

        return response()->json([
            'roles' => $roles,
            'all_permissions' => $allPermissions,
        ]);
    }

    public function storeRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'name')->where('guard_name', 'api'),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'max:100'],
        ]);

        $roleName = strtolower(trim(preg_replace('/\s+/', '-', $validated['name'])));

        if (Role::where('guard_name', 'api')->where('name', $roleName)->exists()) {
            return response()->json([
                'message' => "Role '{$roleName}' sudah terdaftar.",
            ], 422);
        }

        $role = Role::create([
            'name' => $roleName,
            'guard_name' => 'api',
        ]);

        if (! empty($validated['permissions'])) {
            $this->ensurePermissionsExist($validated['permissions']);
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->values()->all(),
            ],
            'message' => "Role baru '{$role->name}' berhasil ditambahkan.",
        ], 201);
    }

    public function updateRolePermissions(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'max:100'],
        ]);

        $this->ensurePermissionsExist($validated['permissions']);
        $role->syncPermissions($validated['permissions']);

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->values()->all(),
            ],
            'message' => "Permission untuk role {$role->name} berhasil diperbarui.",
        ]);
    }

    protected function ensurePermissionsExist(array $permissions): void
    {
        foreach ($permissions as $permName) {
            $name = trim((string) $permName);
            if ($name !== '') {
                Permission::firstOrCreate([
                    'name' => $name,
                    'guard_name' => 'api',
                ]);
            }
        }
    }

    protected function ensureDefaultSystemPermissions(): void
    {
        $systemPermissions = [
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
            'chat.manage',
            'master.manage',
            'alumni.view',
            'alumni.create',
            'alumni.update',
            'alumni.delete',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.manage',
            'roles.manage',
        ];

        $this->ensurePermissionsExist($systemPermissions);
    }

    public function deleteRole(Role $role): JsonResponse
    {
        if ($role->name === 'super-admin') {
            return response()->json([
                'message' => 'Role super-admin tidak dapat dihapus.',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => "Role '{$role->name}' berhasil dihapus.",
        ]);
    }
}
