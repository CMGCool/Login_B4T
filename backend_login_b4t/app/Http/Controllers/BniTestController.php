<?php

namespace App\Http\Controllers;

use App\Services\BniEcollectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BniTestController extends Controller
{
    public function create(Request $request, BniEcollectionService $bni)
    {
        $trxId = 'INV-DEV-' . now()->timestamp;

        $response = $bni->createBilling([
            'trx_id' => $trxId,
            'trx_amount' => $request->trx_amount ?? '50000',
            'billing_type' => $request->billing_type ?? 'c',
            'customer_name' => $request->customer_name ?? 'POSTMAN TEST',
            'customer_email' => $request->customer_email ?? 'test@email.com',
            'customer_phone' => $request->customer_phone ?? '628123456789'
        ]);

        return response()->json($response);
    }

    public function update(Request $request, BniEcollectionService $bni)
    {
        $request->validate([
            'trx_id' => 'required|string',
            'trx_amount' => 'nullable|numeric',
            'datetime_expired_iso8601' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $response = $bni->updateBilling($request->only([
            'trx_id',
            'trx_amount',
            'datetime_expired_iso8601',
            'customer_name',
            'description'
        ]));

        return response()->json($response);
    }

    public function inquiry(Request $request, BniEcollectionService $bni)
    {
        return response()->json(
            $bni->inquiryBilling($request->trx_id)
        );
    }
}
