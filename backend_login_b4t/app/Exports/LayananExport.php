<?php

namespace App\Exports;

use App\Models\Layanan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class LayananExport implements FromCollection, WithHeadings, WithColumnFormatting
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Layanan::select(
            'id',
            'nama_layanan',
            'tanggal_layanan',
            'pembayaran',
        )->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Layanan',
            'Tanggal Layanan',
            'Pembayaran',
        ];
    }
    public function columnFormats(): array
{
    return [
        'D' => '"Rp" #,##0',
    ];
}
}
