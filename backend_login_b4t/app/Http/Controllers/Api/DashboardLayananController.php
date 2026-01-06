<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardLayananController extends Controller
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
     * Pie chart: komposisi layanan yang paling sering digunakan.
     */
    public function layananUsage()
    {
        $usage = Layanan::select('nama_layanan', DB::raw('COUNT(*) as total'))
            ->groupBy('nama_layanan')
            ->orderByDesc('total')
            ->get();

        $totalCount = max($usage->sum('total'), 1); // hindari div/0

        $top = $usage->take(4);
        $others = $usage->slice(4);

        $data = $top->map(function ($row) use ($totalCount) {
            return [
                'nama_layanan' => $row->nama_layanan,
                'count' => (int) $row->total,
                'percentage' => round(($row->total / $totalCount) * 100, 2),
            ];
        });

        if ($others->isNotEmpty()) {
            $othersCount = $others->sum('total');
            $data->push([
                'nama_layanan' => 'Lainnya',
                'count' => (int) $othersCount,
                'percentage' => round(($othersCount / $totalCount) * 100, 2),
            ]);
        }

        return response()->json([
            'message' => 'Data layanan usage berhasil diambil',
            'data' => $data,
        ], 200);
    }

    /**
     * Bar chart: total biaya per minggu di bulan tertentu (default: bulan & tahun berjalan).
     * Query params: month=1-12, year=YYYY
     */
    public function biayaPerMinggu(Request $request)
    {
        $month = (int) ($request->query('month') ?? Carbon::now()->month);
        $year = (int) ($request->query('year') ?? Carbon::now()->year);

        if ($month < 1 || $month > 12 || $year < 1970) {
            return response()->json([
                'message' => 'Parameter month/year tidak valid',
            ], 422);
        }

        $start = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $end = (clone $start)->endOfMonth()->endOfDay();

        $rows = Layanan::whereBetween('tanggal_layanan', [$start->toDateString(), $end->toDateString()])
            ->select('tanggal_layanan', 'pembayaran')
            ->get();

        $buckets = [1 => 0, 2 => 0, 3 => 0, 4 => 0];
        foreach ($rows as $row) {
            $day = Carbon::parse($row->tanggal_layanan)->day;
            $week = (int) ceil($day / 7);
            $week = $week > 4 ? 4 : $week; // map minggu 5 menjadi 4
            $buckets[$week] += (int) $row->pembayaran;
        }

        $ranges = [
            1 => '1-7',
            2 => '8-14',
            3 => '15-21',
            4 => '22-' . $end->day,
        ];

        $data = collect($buckets)->map(function ($total, $week) use ($ranges, $month, $year) {
            return [
                'minggu' => (int) $week,
                'range' => $ranges[$week] . ' ' . Carbon::createFromDate($year, $month, 1)->format('F'),
                'total_biaya' => $total,
            ];
        })->values();

        return response()->json([
            'message' => 'Data biaya per minggu berhasil diambil',
            'month' => Carbon::createFromDate($year, $month, 1)->format('F Y'),
            'data' => $data,
        ], 200);
    }
}
