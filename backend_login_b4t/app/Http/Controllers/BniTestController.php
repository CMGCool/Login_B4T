<?php

namespace App\Http\Controllers;

use App\Services\BniEcollectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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

        // Persist to payments table if createBilling success
        if (($response['status'] ?? null) === '000') {
            $data = $response['data'] ?? [];

            DB::table('payments')->updateOrInsert(
                ['trx_id' => $trxId],
                [
                    'virtual_account' => $data['virtual_account'] ?? null,
                    'user_id' => optional($request->user())->id,
                    'customer_name' => $request->customer_name ?? 'POSTMAN TEST',
                    'customer_email' => $request->customer_email ?? 'test@email.com',
                    'customer_phone' => $request->customer_phone ?? '628123456789',
                    'amount' => $request->trx_amount ?? 50000,
                    'billing_type' => $request->billing_type ?? 'c',
                    'status' => 'pending',
                    'bni_response' => json_encode($response),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

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

    /**
     * CALLBACK FROM BNI
     * POST /api/bni/callback
     * 
     * Request dari BNI:
     * {
     *   "client_id": "27018",
     *   "prefix": "989",
     *   "data": "encrypted_data"
     * }
     */
    public function callback(Request $request, BniEcollectionService $bni)
    {
        // Validate request
        $validated = $request->validate([
            'client_id' => 'required|string',
            'prefix' => 'required|string',
            'data' => 'required|string'
        ]);

        // Process callback
        $result = $bni->processCallback($validated['data']);

        if (!$result['success']) {
            // Jika decrypt gagal, tetap return 000 agar BNI tidak retry terus
            Log::error('BNI Callback Processing Failed', [
                'error' => $result['message'],
                'request' => $validated
            ]);

            return response()->json([
                'status' => '000' // Return 000 untuk stop retry
            ]);
        }

        // Get decrypted payment data
        $paymentData = $result['data'];

        Log::info('BNI Callback Received', [
            'trx_id' => $paymentData['trx_id'] ?? null,
            'va_status' => $paymentData['va_status'] ?? null,
            'payment_amount' => $paymentData['payment_amount'] ?? null
        ]);

        // Update database jika va_status = 2 (PAID)
        if (($paymentData['va_status'] ?? null) == '2') {
            $this->updatePaymentStatus($paymentData);
        }

        // Return status 000 to BNI (indicates success, will stop retry)
        return response()->json([
            'status' => '000'
        ]);
    }

    /**
     * Helper: Update payment status di database
     */
    private function updatePaymentStatus(array $paymentData)
    {
        try {
            $trxId = $paymentData['trx_id'] ?? null;
            $paymentAmount = $paymentData['payment_amount'] ?? null;
            $paymentNtb = $paymentData['payment_ntb'] ?? null;
            $dateTimePayment = $paymentData['datetime_payment_iso8601'] ??
                $paymentData['datetime_payment'] ?? null;

            if (!$trxId) {
                Log::error('BNI Callback - No trx_id', $paymentData);
                return;
            }

            // Find payment by trx_id
            $payment = DB::table('payments')->where('trx_id', $trxId)->first();

            if (!$payment) {
                Log::warning('BNI Callback - Payment not found', ['trx_id' => $trxId]);
                return;
            }

            // Update payment status
            DB::table('payments')
                ->where('id', $payment->id)
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_ntb' => $paymentNtb,
                    'payment_amount' => $paymentAmount,
                    'bni_callback' => json_encode($paymentData),
                    'updated_at' => now()
                ]);

            Log::info('BNI Callback - Payment Updated', [
                'trx_id' => $trxId,
                'status' => 'paid',
                'amount' => $paymentAmount
            ]);

            // TODO: Send notification to user here
            // Example: notify user via email, SMS, push notification, etc.

        } catch (\Exception $e) {
            Log::error('BNI Callback - Update failed', [
                'error' => $e->getMessage(),
                'data' => $paymentData
            ]);
        }
    }

    /**
     * TEST CALLBACK - For local testing only
     * 
     * Endpoint to simulate BNI callback for testing purposes
     * POST /api/bni/test-callback
     * 
     * This creates an encrypted payload and logs it so you can use
     * it to test the actual callback endpoint
     */
    public function testCallback(Request $request, BniEcollectionService $bni)
    {
        // Sample payment data (simulating what BNI would send)
        $paymentData = [
            'trx_id' => $request->input('trx_id', '20260120000001'),
            'virtual_account' => $request->input('virtual_account', '98927018000001'),
            'trx_amount' => $request->input('trx_amount', '100000.00'),
            'payment_amount' => $request->input('payment_amount', '100000.00'),
            'cumulative_payment_amount' => $request->input('cumulative_payment_amount', '100000.00'),
            'payment_ntb' => $request->input('payment_ntb', 'NTB' . time()),
            'datetime_payment' => now()->format('Y-m-d H:i:s'),
            'datetime_payment_iso8601' => now()->toIso8601String(),
            'va_status' => $request->input('va_status', '2')
        ];

        // Encrypt data (simulating what BNI does)
        $clientId = config('services.bni.client_id');
        $secretKey = config('services.bni.secret_key');

        // BniEnc::encrypt() menggunakan signature: encrypt(payload, clientId, secretKey)
        $encrypted = \BniEnc::encrypt(
            $paymentData,
            $clientId,
            $secretKey
        );

        return response()->json([
            'message' => 'Test callback payload created. Use the encrypted_data below to test callback endpoint.',
            'test_payload' => [
                'url' => '/api/bni/callback',
                'method' => 'POST',
                'body' => [
                    'client_id' => $clientId,
                    'prefix' => config('services.bni.prefix'),
                    'data' => $encrypted
                ]
            ],
            'sample_data' => $paymentData,
            'instructions' => [
                '1. Copy the test_payload above',
                '2. POST it to /api/bni/callback endpoint',
                '3. You should get response: {"status": "000"}',
                '4. Check database: payment status should change to "paid"',
                '5. Check logs: storage/logs/laravel.log'
            ]
        ]);
    }
}
