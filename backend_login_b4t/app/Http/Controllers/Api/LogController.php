<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Tampilkan semua logs (hanya untuk admin & superadmin)
     */
    public function index(Request $request)
    {
        $query = Log::with('user')->orderBy('created_at', 'desc');

        // Filter berdasarkan action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter berdasarkan user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter berdasarkan model
        if ($request->has('model')) {
            $query->where('model', $request->model);
        }

        // Filter berdasarkan tanggal
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate($request->per_page ?? 50);

        return response()->json($logs);
    }

    /**
     * Tampilkan detail log
     */
    public function show($id)
    {
        $log = Log::with('user')->findOrFail($id);
        return response()->json($log);
    }

    /**
     * Hapus logs lama (cleanup)
     */
    public function cleanup(Request $request)
    {
        $days = $request->days ?? 90; // Default 90 hari

        $deleted = Log::where('created_at', '<', now()->subDays($days))->delete();

        return response()->json([
            'message' => "Deleted {$deleted} old log entries",
            'deleted_count' => $deleted
        ]);
    }
}
