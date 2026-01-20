<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'trx_id',
        'virtual_account',
        'user_id',
        'layanan_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'amount',
        'payment_amount',
        'payment_ntb',
        'description',
        'billing_type',
        'status',
        'paid_at',
        'expired_at',
        'bni_response',
        'bni_callback',
    ];

    protected $casts = [
        'bni_response' => 'array',
        'bni_callback' => 'array',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Layanan
    public function layanan()
    {
        return $this->belongsTo(Layanan::class);
    }
}
