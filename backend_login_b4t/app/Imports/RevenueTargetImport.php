<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class RevenueTargetImport implements ToModel, WithHeadingRow
{
    /**
    * @param Collection $collection
    */
    public function model(array $row)
    {
        if (!isset($row['bulan']) || !isset($row['target_perbulan']) || !isset($row['tahun'])) {
        return null;
    }
        return new RevenueTarget([
            'bulan'            => $row['bulan'],
            'target_perbulan' => str_replace(['Rp', '.', ' '], '', $row['target_perbulan']),
            'tahun'            => $row['tahun'],
        ]);
    }
}
