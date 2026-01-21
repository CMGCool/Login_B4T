<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\layanan;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Controllers\Controller;
use App\Imports\RevenueTargetImport;

class ImportController extends Controller
{
    public function importLayanan(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new layanan, $request->file('file'));

        return response()->json([
            'message' => 'Import layanan berhasil 🎉'
        ]);
    }

    public function importRevenue(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv'
        ]);

        Excel::import(new RevenueTargetImport, $request->file('file'));

        return response()->json([
            'message' => 'Import revenue berhasil 🎉'
        ]);
    }
}
