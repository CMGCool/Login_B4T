<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Illuminate\Http\Request;

class LayananController extends Controller
{   
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (!in_array(auth()->user()->role, ['admin', 'super_admin'])) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke resource ini'
                ], 403);
            }
            return $next($request);
        });
    }

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
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return response()->json(['message' => 'Use POST to create'], 405);
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

        return response()->json([
            'message' => 'Layanan berhasil dibuat',
            'data' => $layanan
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $layanan = Layanan::find($id);

        if (!$layanan) {
            return response()->json([
                'message' => 'Layanan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail layanan berhasil diambil',
            'data' => $layanan
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        return response()->json(['message' => 'Use PUT to update'], 405);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $layanan = Layanan::find($id);

        if (!$layanan) {
            return response()->json([
                'message' => 'Layanan tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'nama_layanan' => 'sometimes|string|max:255',
            'tanggal_layanan' => 'sometimes|date',
            'pembayaran' => 'sometimes|integer|min:0',
        ]);

        $layanan->update($validated);

        return response()->json([
            'message' => 'Layanan berhasil diperbarui',
            'data' => $layanan
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $layanan = Layanan::find($id);

        if (!$layanan) {
            return response()->json([
                'message' => 'Layanan tidak ditemukan'
            ], 404);
        }

        $layanan->delete();

        return response()->json([
            'message' => 'Layanan berhasil dihapus'
        ], 200);
    }
}
