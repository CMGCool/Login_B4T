<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use App\Models\Target;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    // Middleware auth:sanctum sudah ditangani di routes
    
    /**
     * Get chart data: Perbandingan biaya layanan vs target per bulan
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     * 
     * Query params:
     * - tahun (required): integer, contoh: 2026
     */
    public function chartBiayaVsTarget(Request $request)
    {
        $validated = $request->validate([
            'tahun' => 'required|integer|min:2000|max:2100'
        ]);

        $tahun = $validated['tahun'];

        // Ambil data biaya layanan per bulan untuk tahun ini
        $biayaPerBulan = Layanan::selectRaw('
                MONTH(tanggal_layanan) as bulan_num,
                SUM(pembayaran) as total_biaya
            ')
            ->whereYear('tanggal_layanan', $tahun)
            ->groupBy('bulan_num')
            ->orderBy('bulan_num')
            ->pluck('total_biaya', 'bulan_num');

        // Ambil data target per bulan untuk tahun ini
        // Gunakan CASE statement dengan WHEN untuk setiap bulan (lebih reliable)
        $targetResults = Target::selectRaw('
                CASE 
                    WHEN LOWER(TRIM(bulan)) = "januari" THEN 1
                    WHEN LOWER(TRIM(bulan)) = "februari" THEN 2
                    WHEN LOWER(TRIM(bulan)) = "maret" THEN 3
                    WHEN LOWER(TRIM(bulan)) = "april" THEN 4
                    WHEN LOWER(TRIM(bulan)) = "mei" THEN 5
                    WHEN LOWER(TRIM(bulan)) = "juni" THEN 6
                    WHEN LOWER(TRIM(bulan)) = "juli" THEN 7
                    WHEN LOWER(TRIM(bulan)) = "agustus" THEN 8
                    WHEN LOWER(TRIM(bulan)) = "september" THEN 9
                    WHEN LOWER(TRIM(bulan)) = "oktober" THEN 10
                    WHEN LOWER(TRIM(bulan)) = "november" THEN 11
                    WHEN LOWER(TRIM(bulan)) = "desember" THEN 12
                    ELSE 0
                END as bulan_num,
                target_perbulan
            ')
            ->where('tahun', $tahun)
            ->get();

        // Convert to associative array untuk lookup yang reliable
        $targetPerBulan = [];
        foreach ($targetResults as $item) {
            $targetPerBulan[$item->bulan_num] = $item->target_perbulan;
        }

        // Format data untuk line chart (1-12 bulan)
        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $biayaData = [];
        $targetData = [];

        for ($i = 1; $i <= 12; $i++) {
            $biayaData[] = $biayaPerBulan->get($i, 0);
            $targetData[] = $targetPerBulan[$i] ?? 0;
        }

        return response()->json([
            'message' => 'Data chart berhasil diambil',
            'tahun' => $tahun,
            'data' => [
                'labels' => $labels,
                'biayaPerBulan' => $biayaData,
                'targetPerBulan' => $targetData
            ],
            'summary' => [
                'total_biaya' => array_sum($biayaData),
                'total_target' => array_sum($targetData),
                'selisih' => array_sum($targetData) - array_sum($biayaData),
                'persentase_tercapai' => array_sum($targetData) > 0
                    ? round((array_sum($biayaData) / array_sum($targetData)) * 100, 2)
                    : 0
            ]
        ], 200);
    }

}
