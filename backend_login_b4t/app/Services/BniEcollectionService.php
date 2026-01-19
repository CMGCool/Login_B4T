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
            'trx_id' => $input['trx_id'],
            'trx_amount' => $input['trx_amount'] ?? null,
            'datetime_expired_iso8601' => $input['datetime_expired_iso8601'] ?? null,
            'customer_name' => $input['customer_name'] ?? null,
            'description' => $input['description'] ?? null,
        ], fn($v) => !is_null($v));

        // Log::info('BNI CLEAN PAYLOAD', $payload);

        return $this->send($payload);
    }

    // public function updateBilling(array $payload)
    // {
    //     /**
    //      * Payload wajib:
    //      * - trx_id
    //      * Payload optional:
    //      * - trx_amount
    //      * - datetime_expired_iso8601
    //      * - customer_name
    //      * - description
    //      */

    //     if (empty($payload['trx_id'])) {
    //         throw new \Exception('trx_id is required');
    //     }

    //     return $this->send([
    //         'trx_id' => $payload['trx_id'],
    //         'trx_amount' => $payload['trx_amount'] ?? null,
    //         'datetime_expired_iso8601' => $payload['datetime_expired_iso8601'] ?? null,
    //         'customer_name' => $payload['customer_name'] ?? null,
    //         'description' => $payload['description'] ?? null,
    //     ]);
    // }

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
}
