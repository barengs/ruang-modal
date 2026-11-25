<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicChatController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'guest_name' => ['required', 'string', 'max:150'],
            'guest_whatsapp' => ['nullable', 'string', 'max:40'],
            'guest_sekolah' => ['nullable', 'string', 'max:180'],
            'topik' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $session = ChatSession::create([
            'session_token' => Str::random(48),
            'guest_name' => trim($validated['guest_name']),
            'guest_whatsapp' => $validated['guest_whatsapp'] ?? null,
            'guest_sekolah' => $validated['guest_sekolah'] ?? null,
            'topik' => $validated['topik'] ?: 'Umum',
            'status' => 'aktif',
            'unread_admin_count' => 1,
            'unread_guest_count' => 0,
            'last_message_at' => now(),
        ]);

        // Pesan pertama dari pengguna
        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_type' => 'guest',
            'sender_name' => $session->guest_name,
            'message' => trim($validated['message']),
            'is_read' => false,
        ]);

        // Sambutan otomatis dari sistem/pengelola
        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_type' => 'admin',
            'sender_name' => 'Helpdesk Double Track',
            'message' => "Halo {$session->guest_name}! Terima kasih telah menghubungi Live Chat Ekosistem Alumni SMA Double Track. Pesan Anda telah masuk dan pengelola akan segera membalas di sini.",
            'is_read' => true,
        ]);

        return response()->json([
            'session' => $session->load('messages'),
        ], 201);
    }

    public function show(Request $request, string $token): JsonResponse
    {
        $session = ChatSession::where('session_token', $token)->first();

        if (! $session) {
            return response()->json([
                'message' => 'Sesi percakapan tidak ditemukan.',
            ], 404);
        }

        // Jika widget pengguna sedang terbuka (?mark_read=1), tandai pesan balasan admin sebagai sudah dibaca
        if ($request->boolean('mark_read') && $session->unread_guest_count > 0) {
            $session->update(['unread_guest_count' => 0]);
            $session->messages()
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }

        return response()->json([
            'session' => $session->load('messages'),
        ]);
    }

    public function sendMessage(Request $request, string $token): JsonResponse
    {
        $session = ChatSession::where('session_token', $token)->firstOrFail();

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $msg = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_type' => 'guest',
            'sender_name' => $session->guest_name,
            'message' => trim($validated['message']),
            'is_read' => false,
        ]);

        $session->update([
            'status' => 'aktif',
            'unread_admin_count' => $session->unread_admin_count + 1,
            'last_message_at' => now(),
        ]);

        return response()->json([
            'message' => $msg,
            'session' => $session->fresh('messages'),
        ], 201);
    }
}
