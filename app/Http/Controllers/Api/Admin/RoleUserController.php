<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        $users = User::with('roles:id,name')->latest()->get()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'roles' => $u->getRoleNames()->values()->all(),
            'permissions' => $u->getAllPermissions()->pluck('name')->values()->all(),
            'created_at' => $u->created_at?->toISOString(),
        ]);

        $availableRoles = Role::where('guard_name', 'api')
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            'data' => $users,
            'available_roles' => $availableRoles,
        ]);
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
        $roles = Role::where('guard_name', 'api')
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
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'api')],
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
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'api')],
        ]);

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
