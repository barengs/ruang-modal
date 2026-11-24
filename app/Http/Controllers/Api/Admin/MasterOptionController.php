<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MasterOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MasterOptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MasterOption::query()
            ->orderBy('group_key')
            ->orderBy('urutan')
            ->orderBy('id');

        if ($group = $request->string('group_key')->trim()->toString()) {
            $query->where('group_key', $group);
        }

        return response()->json([
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_key' => ['required', 'string', 'max:80'],
            'label' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:300'],
            'urutan' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $maxOrder = MasterOption::where('group_key', $validated['group_key'])->max('urutan') ?? 0;

        $option = MasterOption::create([
            'group_key' => $validated['group_key'],
            'label' => trim($validated['label']),
            'description' => $validated['description'] ?? null,
            'urutan' => $validated['urutan'] ?? ($maxOrder + 1),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'data' => $option,
            'message' => "Pilihan master data '{$option->label}' berhasil ditambahkan.",
        ], 201);
    }

    public function update(Request $request, MasterOption $masterOption): JsonResponse
    {
        $validated = $request->validate([
            'group_key' => ['sometimes', 'required', 'string', 'max:80'],
            'label' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string', 'max:300'],
            'urutan' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
        ]);

        $masterOption->update([
            'group_key' => $validated['group_key'] ?? $masterOption->group_key,
            'label' => trim($validated['label']),
            'description' => $validated['description'] ?? null,
            'urutan' => $validated['urutan'] ?? $masterOption->urutan,
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'data' => $masterOption,
            'message' => "Pilihan master data '{$masterOption->label}' berhasil diperbarui.",
        ]);
    }

    public function destroy(MasterOption $masterOption): JsonResponse
    {
        $label = $masterOption->label;
        $masterOption->delete();

        return response()->json([
            'message' => "Pilihan master data '{$label}' berhasil dihapus.",
        ]);
    }
}
