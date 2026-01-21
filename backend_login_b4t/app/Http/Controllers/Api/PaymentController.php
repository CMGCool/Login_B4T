<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Layanan;
use App\Services\BniEcollectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create new transaction & generate VA
     * POST /api/payments
     */
    public function store(Request $request, BniEcollectionService $bni)
    {
        $validated = $request->validate([
            'layanan_id' => 'required|exists:layanan,id',
            'amount' => 'required|numeric|min:10000',
            'customer_phone' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:255',
            'expired_at' => 'nullable|date_format:Y-m-d\TH:i:sP', // ISO8601
        ]);

        $user = $request->user();
        $layanan = Layanan::findOrFail($validated['layanan_id']);

        // Generate unique trx_id
        $trxId = 'TRX-' . $user->id . '-' . now()->timestamp;

        // Siapkan expired ISO8601 jika ada
        $expiredIso = $validated['expired_at'] ?? null;

        // Call BNI createBilling
        $payload = [
            'trx_id' => $trxId,
            'trx_amount' => $validated['amount'],
            'billing_type' => 'c', // c = close payment (amount fixed)
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $validated['customer_phone'] ?? $user->phone ?? '628123456789',
            'description' => $validated['description'] ?? $layanan->nama_layanan,
        ];
        if ($expiredIso) {
            $payload['datetime_expired_iso8601'] = $expiredIso;
        }
        $response = $bni->createBilling($payload);

        // Check if BNI success
        if (($response['status'] ?? null) !== '000') {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create billing',
                'error' => $response
            ], 500);
        }

        $data = $response['data'] ?? [];
        
        // Strategy development: Ambil actual expired_at dari BNI via inquiry
        // Karena BNI Sandbox mengabaikan datetime_expired_iso8601, kita ambil nilai actual dari inquiry
        $expiredAt = $expiredIso;
        try {
            $inquiry = $bni->inquiryBilling($trxId);
            if (($inquiry['status'] ?? null) === '000' && isset($inquiry['data']['datetime_expired_iso8601'])) {
                $expiredAt = $inquiry['data']['datetime_expired_iso8601'];
                Log::info("Expired_at updated from BNI inquiry", [
                    'trx_id' => $trxId,
                    'requested' => $expiredIso,
                    'actual' => $expiredAt
                ]);
            }
        } catch (\Exception $e) {
            Log::warning("Failed to get expired_at from BNI inquiry", [
                'trx_id' => $trxId,
                'error' => $e->getMessage()
            ]);
            // Tetap gunakan expiredIso jika inquiry gagal
        }

        $payment = Payment::create([
            'trx_id' => $trxId,
            'virtual_account' => $data['virtual_account'] ?? null,
            'user_id' => $user->id,
            'layanan_id' => $layanan->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_phone' => $validated['customer_phone'] ?? $user->phone ?? '628123456789',
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? $layanan->nama_layanan,
            'billing_type' => 'c',
            'status' => 'pending',
            'expired_at' => $expiredAt,
            'bni_response' => $response,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction created successfully',
            'data' => [
                'trx_id' => $payment->trx_id,
                'virtual_account' => $payment->virtual_account,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'layanan' => [
                    'id' => $layanan->id,
                    'nama' => $layanan->nama_layanan,
                ],
                'instructions' => [
                    'bank' => 'BNI',
                    'va_number' => $payment->virtual_account,
                    'amount' => 'Rp ' . number_format($payment->amount, 0, ',', '.'),
                    'steps' => [
                        '1. Buka aplikasi mobile banking atau ATM BNI',
                        '2. Pilih menu Transfer > Virtual Account',
                        '3. Masukkan nomor VA: ' . $payment->virtual_account,
                        '4. Masukkan nominal: Rp ' . number_format($payment->amount, 0, ',', '.'),
                        '5. Konfirmasi pembayaran',
                    ]
                ]
            ],
            'bni_response' => $response
        ], 201);
    }

    /**
     * Get transaction detail
     * GET /api/payments/{trx_id}
     */
    public function show(Request $request, $trxId)
    {
        $payment = Payment::with('layanan')
            ->where('trx_id', $trxId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'trx_id' => $payment->trx_id,
                'virtual_account' => $payment->virtual_account,
                'amount' => $payment->amount,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
                'description' => $payment->description,
                'customer_name' => $payment->customer_name,
                'customer_email' => $payment->customer_email,
                'customer_phone' => $payment->customer_phone ?? '628123456789',
                'layanan' => $payment->layanan ? [
                    'id' => $payment->layanan->id,
                    'nama' => $payment->layanan->nama_layanan,
                ] : null,
                'created_at' => $payment->created_at,
                'bni_response' => $payment->bni_response,
                'bni_callback' => $payment->bni_callback,
            ]
        ]);
    }

    /**
     * Get all user transactions
     * GET /api/payments
     */
    public function index(Request $request)
    {
        $payments = Payment::with('layanan')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $payments->map(function ($payment) {
                return [
                    'trx_id' => $payment->trx_id,
                    'virtual_account' => $payment->virtual_account,
                    'amount' => $payment->amount,
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'description' => $payment->description,
                    'customer_name' => $payment->customer_name,
                    'customer_email' => $payment->customer_email,
                    'customer_phone' => $payment->customer_phone ?? '628123456789',
                    'layanan' => $payment->layanan ? [
                        'id' => $payment->layanan->id,
                        'nama' => $payment->layanan->nama_layanan,
                    ] : null,
                    'created_at' => $payment->created_at,
                    'bni_response' => $payment->bni_response,
                ];
            }),
            'pagination' => [
                'total' => $payments->total(),
                'per_page' => $payments->perPage(),
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
            ]
        ]);
    }

    /**
     * Update transaction (amount, customer data, expiry)
     * PUT /api/payments/{trx_id}
     */
    public function update(Request $request, $trxId, BniEcollectionService $bni)
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:10000',
            'customer_name' => 'nullable|string|max:100',
            'customer_email' => 'nullable|email|max:100',
            'customer_phone' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:255',
            'expired_at' => 'nullable|date_format:Y-m-d\TH:i:sP', // ISO8601
        ]);

        $user = $request->user();

        // Find payment (only user's own transaction)
        $payment = Payment::where('trx_id', $trxId)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        // Update BNI billing
        $updateData = [
            'trx_id' => $trxId,
            'trx_amount' => $validated['amount'] ?? $payment->amount,
            'customer_name' => $validated['customer_name'] ?? $payment->customer_name,
            'customer_email' => $validated['customer_email'] ?? $payment->customer_email,
            'customer_phone' => $validated['customer_phone'] ?? $payment->customer_phone,
            'description' => $validated['description'] ?? $payment->description,
        ];

        // expired_at dikirim ke BNI sebagai datetime_expired_iso8601 jika ada
        if (isset($validated['expired_at'])) {
            $updateData['datetime_expired_iso8601'] = $validated['expired_at'];
        }

        $response = $bni->updateBilling($updateData);

        // Even if BNI update fails/partial, we update our database
        $payment->update([
            'amount' => $validated['amount'] ?? $payment->amount,
            'customer_name' => $validated['customer_name'] ?? $payment->customer_name,
            'customer_email' => $validated['customer_email'] ?? $payment->customer_email,
            'customer_phone' => $validated['customer_phone'] ?? $payment->customer_phone,
            'description' => $validated['description'] ?? $payment->description,
            'expired_at' => $validated['expired_at'] ?? $payment->expired_at,
        ]);

        Log::info('Payment Updated', [
            'trx_id' => $trxId,
            'bni_status' => $response['status'] ?? null,
            'db_updated' => true
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction updated successfully',
            'data' => [
                'trx_id' => $payment->trx_id,
                'virtual_account' => $payment->virtual_account,
                'amount' => $payment->amount,
                'customer_name' => $payment->customer_name,
                'customer_email' => $payment->customer_email,
                'customer_phone' => $payment->customer_phone,
                'description' => $payment->description,
                'status' => $payment->status,
            ],
            'bni_response' => $response,
            'note' => 'Customer data saved in database. BNI sandbox may not support all fields.'
        ]);
    }
}
