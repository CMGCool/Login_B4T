<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class layanan implements ToModel, WithHeadingRow
{
    /**
    * @param Collection $collection
    */
    public function model(array $row)
    {
        // Return a new model instance with the data from the row
        return new \App\Models\layanan([
            'nama_layanan' => $row['nama_layanan'],
            'tanggal_layanan' => $row['tanggal_layanan'],
            'pembayaran' => $row['pembayaran'],
        ]);
    }
}
