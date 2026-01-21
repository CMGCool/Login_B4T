<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Exports\LayananExport;
use App\Exports\RevenueTargetExport;
use App\Models\RevenueTarget;
use App\Models\Layanan;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportController extends Controller
{
    // ====== LAYANAN ======

    public function exportLayanan()
    {
        return Excel::download(new LayananExport, 'layanan.xlsx');
    }

    public function layananPdf()
    {
        $layanan = Layanan::all();

        $pdf = Pdf::loadView('exports.layanan', compact('layanan'))
                  ->setPaper('A4', 'landscape');

        return $pdf->download('layanan.pdf');
    }

    // ====== REVENUE TARGET ======

    public function exportRevenue()
    {
        return Excel::download(new RevenueTargetExport, 'revenue_targets.xlsx');
    }

    public function revenuePdf()
    {
        
        $revenueTargets = RevenueTarget::all();

        $pdf = Pdf::loadView('exports.revenue', compact('revenueTargets'))
                  ->setPaper('A4', 'landscape');

        return $pdf->download('revenue_targets.pdf');
    }

    // ====== CSV ======

    public function exportCsv()
    {
        $data = Layanan::all();

        $filename = "data_layanan.csv";

        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');

            // Header
            fputcsv($file, ['ID', 'Nama Layanan', 'Tanggal Layanan', 'Pembayaran']);

            // Data
            foreach ($data as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->nama_layanan,
                    $row->tanggal_layanan,
                    'Rp ' . number_format($row->pembayaran, 0, ',', '.'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportCsvRevenue()
    {
        $data = RevenueTarget::all();

        $filename = "data_revenue.csv";

        $headers = [
            "Content-Type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');

            // Header
            fputcsv($file, ['ID', 'Bulan', 'Target', 'Tahun']);

            // Data
            foreach ($data as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->bulan,
                    'Rp ' . number_format($row->target_perbulan, 0, ',', '.'),
                    $row->tahun,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importRevenue(Request $request)
{
    $request->validate([
        'file' => 'required|mimes:xlsx,csv',
    ]);

    Excel::import(new RevenueTargetImport, $request->file('file'));

    return response()->json([
        'message' => 'Data revenue target berhasil diimport'
    ]);
}

}
