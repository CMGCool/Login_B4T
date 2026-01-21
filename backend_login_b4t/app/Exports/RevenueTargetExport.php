<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use App\Models\RevenueTarget;
class RevenueTargetExport implements FromCollection, WithHeadings, WithColumnFormatting
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return RevenueTarget::select(
            'id',
            'bulan',
            'target_perbulan',
            'tahun',
        )->get();
    }
    public function headings(): array
    {
        return [
            'ID',
            'Bulan',
            'Target Perbulan',
            'Tahun',
        ];
    }
    public function columnFormats(): array
    {
        return [
            'C' => '"Rp" #,##0',
        ];
    }
}
