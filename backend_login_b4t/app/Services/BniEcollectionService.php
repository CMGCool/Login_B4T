<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

require_once app_path('Helpers/BniEnc.php');

class BniEcollectionService
{
    protected $clientId;
    protected $prefix;
    protected $secretKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->clientId  = config('services.bni.client_id');
        $this->prefix    = config('services.bni.prefix');
        $this->secretKey = config('services.bni.secret_key');
        $this->baseUrl   = config('services.bni.base_url');
    }

    /**
     * Core request ke BNI
     */
    private function send(array $payload)
    {
        Log::info('BNI RAW PAYLOAD', $payload);
        // Encrypt payload
        $encrypted = \BniEnc::encrypt(
            $payload,
            $this->clientId,
            $this->secretKey
        );

        $request = [
            'client_id' => $this->clientId,
            'prefix'    => $this->prefix,
            'data'      => $encrypted
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json'
        ])->post($this->baseUrl, $request);

        if (!$response->ok()) {
            return [
                'error' => true,
                'http_status' => $response->status(),
                'body' => $response->body()
            ];
        }

        $result = $response->json();

        // Kalau gagal → data TIDAK terenkripsi
        if ($result['status'] !== '000') {
            return $result;
        }

        // Decrypt response
        $decrypted = \BniEnc::decrypt(
            $result['data'],
            $this->clientId,
            $this->secretKey
        );

        return [
            'status' => '000',
            'data'   => is_string($decrypted)
                ? json_decode($decrypted, true)
                : $decrypted
        ];
    }

    /**
     * CREATE BILLING
     */
    public function createBilling(array $data)
    {
        $payload = array_merge($data, [
            'type'      => 'createbilling',
            'client_id' => $this->clientId
        ]);

        return $this->send($payload);
    }

    /**
     * UPDATE BILLING
     */

    public function updateBilling(array $input)
    {
        $payload = array_filter([
            'type'      => 'updatebilling',
            'client_id' => $this->clientId,
            'trx_id' => $input['trx_id'],
            'trx_amount' => $input['trx_amount'] ?? null,
            'customer_name' => $input['customer_name'] ?? null,
            'customer_email' => $input['customer_email'] ?? null,
            'customer_phone' => $input['customer_phone'] ?? null,
            'datetime_expired_iso8601' => $input['datetime_expired_iso8601'] ?? null,
            'description' => $input['description'] ?? null,
        ], fn($v) => !is_null($v));

        return $this->send($payload);
    }

    /**
     * INQUIRY BILLING
     */
    public function inquiryBilling(string $trxId)
    {
        return $this->send([
            'type'      => 'inquirybilling',
            'client_id' => $this->clientId,
            'trx_id'   => $trxId
        ]);
    }

    public function processCallback(string $encryptedData): array
    {
        try {
            // Decrypt data dari BNI
            $decrypted = \BniEnc::decrypt(
                $encryptedData,
                $this->clientId,
                $this->secretKey
            );

            Log::info('BNI CALLBACK DECRYPTED', $decrypted);

            // Validasi decryption
            if ($decrypted === null) {
                Log::error('BNI CALLBACK - Decryption failed', [
                    'encrypted_data' => $encryptedData
                ]);
                return [
                    'success' => false,
                    'message' => 'Failed to decrypt callback data'
                ];
            }

            // Return decrypted data untuk controller yang handle
            return [
                'success' => true,
                'data' => $decrypted
            ];
        } catch (\Exception $e) {
            Log::error('BNI CALLBACK - Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
