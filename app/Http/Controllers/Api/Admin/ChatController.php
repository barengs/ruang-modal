<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index(): JsonResponse
    {
        $sessions = ChatSession::with('latestMessage')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get();

        $totalUnread = $sessions->sum('unread_admin_count');

        return response()->json([
            'data' => $sessions,
            'total_unread' => $totalUnread,
        ]);
    }

    public function show(ChatSession $chatSession): JsonResponse
    {
        if ($chatSession->unread_admin_count > 0) {
            $chatSession->update(['unread_admin_count' => 0]);
            $chatSession->messages()
                ->where('sender_type', 'guest')
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }

        return response()->json([
            'data' => $chatSession->load('messages'),
        ]);
    }

    public function reply(Request $request, ChatSession $chatSession): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $user = auth('api')->user();

        $msg = ChatMessage::create([
            'chat_session_id' => $chatSession->id,
            'sender_type' => 'admin',
            'sender_name' => $user?->name ?? 'Admin Pengelola',
            'sender_id' => $user?->id,
            'message' => trim($validated['message']),
            'is_read' => false,
        ]);

        $chatSession->update([
            'unread_admin_count' => 0,
            'unread_guest_count' => $chatSession->unread_guest_count + 1,
            'last_message_at' => now(),
        ]);

        $chatSession->messages()
            ->where('sender_type', 'guest')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => $msg,
            'data' => $chatSession->fresh(['messages', 'latestMessage']),
        ], 201);
    }

    public function updateStatus(Request $request, ChatSession $chatSession): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:aktif,selesai'],
        ]);

        $chatSession->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'data' => $chatSession->fresh(['messages', 'latestMessage']),
            'message' => 'Status percakapan berhasil diperbarui.',
        ]);
    }

    public function destroy(ChatSession $chatSession): JsonResponse
    {
        $chatSession->delete();

        return response()->json([
            'message' => 'Percakapan live chat berhasil dihapus.',
        ]);
    }
}
