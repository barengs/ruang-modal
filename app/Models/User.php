<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name',
    'email',
    'password',
    'whatsapp',
    'sekolah',
    'tahun_lulus',
    'kompetensi',
    'nama_usaha',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected string $guard_name = 'api';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'roles' => $this->getRoleNames()->values()->all(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }

    public function modalApplications(): HasMany
    {
        return $this->hasMany(ModalApplication::class, 'user_id');
    }

    public function tumbuhRequests(): HasMany
    {
        return $this->hasMany(TumbuhRequest::class, 'user_id');
    }

    public function pasarProducts(): HasMany
    {
        return $this->hasMany(PasarProduct::class, 'user_id');
    }

    public function monitorings(): HasMany
    {
        return $this->hasMany(Monitoring::class, 'user_id');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class, 'user_id');
    }
}
