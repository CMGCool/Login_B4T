<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Target;
use Illuminate\Http\Request;

class TargetsController extends Controller
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
        $target = Target::all();
        return response()->json([
            'message' => 'Data target berhasil diambil',
            'data' => $target
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
            'bulan' => 'required|string|max:255',
            'target_perbulan' => 'required|integer|min:0',
            'tahun' => 'required|integer|min:0',
        ]);

        $target = Target::create($validated);

        return response()->json([
            'message' => 'Target berhasil dibuat',
            'data' => $target
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
        $target = Target::find($id);

        if (!$target) {
            return response()->json([
                'message' => 'Target tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail target berhasil diambil',
            'data' => $target
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
        $target = Target::find($id);

        if (!$target) {
            return response()->json([
                'message' => 'Target tidak ditemukan'
            ], 404);
        }

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

    
}
