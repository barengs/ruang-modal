<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ChatSession extends Model
{
    protected $fillable = [
        'session_token',
        'guest_name',
        'guest_email',
        'guest_whatsapp',
        'guest_sekolah',
        'topik',
        'status',
        'unread_admin_count',
        'unread_guest_count',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'unread_admin_count' => 'integer',
            'unread_guest_count' => 'integer',
            'last_message_at' => 'datetime',
        ];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->oldest('id');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(ChatMessage::class)->latestOfMany();
    }
}
