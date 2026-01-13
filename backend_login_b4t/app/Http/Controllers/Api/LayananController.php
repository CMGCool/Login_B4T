<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use App\Services\LogService;
use Illuminate\Http\Request;

class LayananController extends Controller
{   
    // Middleware auth:sanctum dan role sudah ditangani di routes

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $layanan = Layanan::all();
        return response()->json([
            'message' => 'Data layanan berhasil diambil',
            'data' => $layanan
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
        $validated = $request->validate([
            'nama_layanan' => 'required|string|max:255',
            'tanggal_layanan' => 'required|date',
            'pembayaran' => 'required|integer|min:0',
        ]);

        $layanan = Layanan::create($validated);

        LogService::logCrud('create', Layanan::class, $layanan);

        return response()->json([
            'message' => 'Layanan berhasil dibuat',
            'data' => $layanan
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  Layanan  $layanan
     * @return \Illuminate\Http\Response
     */
    public function show(Layanan $layanan)
    {
        return response()->json([
            'message' => 'Detail layanan berhasil diambil',
            'data' => $layanan
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  Layanan  $layanan
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Layanan $layanan)
    {
        $validated = $request->validate([
            'nama_layanan' => 'sometimes|string|max:255',
            'tanggal_layanan' => 'sometimes|date',
            'pembayaran' => 'sometimes|integer|min:0',
        ]);

        // Simpan data lama sebelum update
        $oldData = $layanan->toArray();

        $layanan->update($validated);

        LogService::logCrud('update', Layanan::class, $layanan, $oldData);

        return response()->json([
            'message' => 'Layanan berhasil diperbarui',
            'data' => $layanan
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Layanan  $layanan
     * @return \Illuminate\Http\Response
     */
    public function destroy(Layanan $layanan)
    {
        // Simpan data sebelum dihapus
        $oldData = $layanan->toArray();

        $layanan->delete();

        LogService::logCrud('delete', Layanan::class, $layanan, $oldData);

        return response()->json([
            'message' => 'Layanan berhasil dihapus'
        ], 200);
    }
}
