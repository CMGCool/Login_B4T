<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use App\Models\Target;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

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
        $targetPerBulan = Target::where('tahun', $tahun)
            ->get()
            ->keyBy(function ($item) {
                // Convert nama bulan ke angka (1-12)
                return $this->bulanToNumber($item->bulan);
            })
            ->pluck('target_perbulan');

        // Format data untuk line chart (1-12 bulan)
        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $biayaData = [];
        $targetData = [];

        for ($i = 1; $i <= 12; $i++) {
            $biayaData[] = $biayaPerBulan->get($i, 0);
            $targetData[] = $targetPerBulan->get($i, 0);
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

    /**
     * Helper: Convert nama bulan ke angka
     */
    private function bulanToNumber($bulan)
    {
        $map = [
            'januari' => 1, 'jan' => 1,
            'februari' => 2, 'feb' => 2,
            'maret' => 3, 'mar' => 3,
            'april' => 4, 'apr' => 4,
            'mei' => 5,
            'juni' => 6, 'jun' => 6,
            'juli' => 7, 'jul' => 7,
            'agustus' => 8, 'agu' => 8,
            'september' => 9, 'sep' => 9,
            'oktober' => 10, 'okt' => 10,
            'november' => 11, 'nov' => 11,
            'desember' => 12, 'des' => 12
        ];

        $bulanLower = strtolower(trim($bulan));
        return $map[$bulanLower] ?? 0;
    }
}
