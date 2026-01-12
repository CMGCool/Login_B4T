<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Target;
use Illuminate\Http\Request;

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

        $target->update($validated);

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
        $target->delete();

        return response()->json([
            'message' => 'Target berhasil dihapus'
        ], 200);
    }
}
