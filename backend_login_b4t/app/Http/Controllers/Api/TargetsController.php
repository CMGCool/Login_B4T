<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Target;
use Illuminate\Http\Request;
use App\Services\LogService;

class TargetsController extends Controller
{
    // Middleware auth:sanctum dan role sudah ditangani di routes

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $target = Target::all();
        return response()->json([
            'message' => 'Data target berhasil diambil',
            'data' => $target
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->all();

        // kalau single object → ubah jadi array
        if (isset($data['bulan'])) {
            $data = [$data];
        }

        $validated = validator($data, [
            '*.bulan' => 'required|string|max:255',
            '*.target_perbulan' => 'required|integer|min:0',
            '*.tahun' => 'required|integer|min:0',
        ])->validate();

        Target::insert($validated);

        // Log create action untuk setiap target
        foreach ($validated as $data) {
            LogService::create([
                'action' => 'create',
                'model' => 'Target',
                'description' => 'Created new target',
                'new_values' => $data,
            ]);
        }

        return response()->json([
            'message' => 'Target berhasil dibuat',
            'jumlah_data' => count($validated),
            'data' => $validated
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  Target  $target
     * @return \Illuminate\Http\Response
     */
    public function show(Target $target)
    {
        return response()->json([
            'message' => 'Detail target berhasil diambil',
            'data' => $target
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Target  $target
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Target $target)
    {
        $validated = $request->validate([
            'bulan' => 'sometimes|string|max:255',
            'target_perbulan' => 'sometimes|integer|min:0',
            'tahun' => 'sometimes|integer|min:0',
        ]);

        // Simpan data lama sebelum update
        $oldData = $target->toArray();

        $target->update($validated);

        LogService::logCrud('update', Target::class, $target, $oldData);

        return response()->json([
            'message' => 'Target berhasil diperbarui',
            'data' => $target
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Target  $target
     * @return \Illuminate\Http\Response
     */
    public function destroy(Target $target)
    {
        // Simpan data sebelum dihapus
        $oldData = $target->toArray();
        $target->delete();
        LogService::logCrud('delete', Target::class, $target, $oldData);

        return response()->json([
            'message' => 'Target berhasil dihapus'
        ], 200);
    }
}
