<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueTarget extends Model
{
    use HasFactory;
    protected $table = 'targets';

    protected $fillable = [
        'bulan',
        'target_perbulan',
        'tahun',
    ];
}
