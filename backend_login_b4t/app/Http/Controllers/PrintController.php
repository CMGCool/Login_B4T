<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Layanan;
use App\Models\RevenueTarget;
use Barryvdh\DomPDF\Facade\Pdf;

class PrintController extends Controller
{
    public function layananPrint()
{
    $layanan = Layanan::all();
    $pdf = Pdf::loadView('exports.layanan', compact('layanan'));
    return $pdf->stream('layanan.pdf');
}

// ====== PRINT REVENUE ======
public function revenuePrint()
{
    $revenueTargets = RevenueTarget::all();
    $pdf = Pdf::loadView('exports.revenue', compact('revenueTargets'));
    return $pdf->stream('revenue_targets.pdf');
}
}
