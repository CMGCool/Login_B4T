<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Layanan extends Model
{
    use HasFactory;

    protected $table = 'layanan';

    protected $fillable = [
        'nama_layanan',
        'tanggal_layanan',
        'pembayaran',
    ];

    protected $casts = [
        // Return YYYY-MM-DD to avoid timezone shifting on JSON serialization.
        'tanggal_layanan' => 'date:Y-m-d',
        'pembayaran' => 'integer',
    ];
}
