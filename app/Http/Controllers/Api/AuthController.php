<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModalApplication;
use App\Models\Monitoring;
use App\Models\PasarProduct;
use App\Models\TumbuhRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class AuthController extends Controller
{
    public function socialLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'in:google,facebook'],
            'email' => ['required', 'email', 'max:150'],
            'name' => ['required', 'string', 'max:150'],
            'sekolah' => ['nullable', 'string', 'max:180'],
            'tahun_lulus' => ['nullable', 'string', 'max:10'],
            'kompetensi' => ['nullable', 'string', 'max:120'],
        ]);

        Role::firstOrCreate(['name' => 'alumni', 'guard_name' => 'api']);

        $email = strtolower(trim($validated['email']));
        $user = User::where('email', $email)->first();

        if (! $user) {
            $user = User::create([
                'name' => trim($validated['name']),
                'email' => $email,
                'password' => Str::random(24),
                'sekolah' => $validated['sekolah'] ?? 'Alumni SMA Double Track',
                'tahun_lulus' => $validated['tahun_lulus'] ?? date('Y'),
                'kompetensi' => $validated['kompetensi'] ?? 'Tata Boga',
            ]);
            $user->syncRoles(['alumni']);
        }

        // Link any existing submissions matching this email
        ModalApplication::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        TumbuhRequest::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        PasarProduct::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        Monitoring::where('nama_alumni', $user->name)->whereNull('user_id')->update(['user_id' => $user->id]);

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $this->formatUser($user),
            'provider' => $validated['provider'],
            'message' => 'Berhasil masuk dengan '.ucfirst($validated['provider']).'.',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', $request->filled('password_confirmation') ? 'confirmed' : 'nullable'],
            'password_confirmation' => ['nullable', 'string'],
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

        // Link any existing submissions with the same email to this new alumni account
        ModalApplication::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        TumbuhRequest::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        PasarProduct::where('email', $user->email)->whereNull('user_id')->update(['user_id' => $user->id]);
        Monitoring::where('nama_alumni', $user->name)->whereNull('user_id')->update(['user_id' => $user->id]);

        $token = auth('api')->login($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $this->formatUser($user),
            'message' => 'Pendaftaran akun alumni berhasil.',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau kata sandi tidak sesuai.',
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();

        return $this->respondWithToken($token);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Berhasil keluar dari sesi.',
        ]);
    }

    protected function respondWithToken(string $token): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $this->formatUser($user),
        ]);
    }

    protected function formatUser(User $user): array
    {
        $roles = $user->getRoleNames()->values()->all();
        $permissions = $user->getAllPermissions()->pluck('name')->values()->all();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'whatsapp' => $user->whatsapp,
            'sekolah' => $user->sekolah,
            'tahun_lulus' => $user->tahun_lulus,
            'kompetensi' => $user->kompetensi,
            'nama_usaha' => $user->nama_usaha,
            'roles' => $roles,
            'permissions' => $permissions,
            'is_alumni' => in_array('alumni', $roles, true) || empty($permissions),
        ];
    }
}
