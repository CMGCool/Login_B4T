<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RecaptchaService
{
    /**
     * Verifikasi reCAPTCHA token ke Google API
     */
    public static function verify(string $token): bool
    {
        $secret = config('services.recaptcha.secret');

        if (!$secret) {
            Log::warning('RECAPTCHA_SECRET_KEY tidak ditemukan di .env');
            return false;
        }

        try {
            $response = Http::asForm()->post(
                'https://www.google.com/recaptcha/api/siteverify',
                [
                    'secret' => $secret,
                    'response' => $token,
                ]
            );

            $data = $response->json();

            // Cek success flag
            if (!isset($data['success']) || $data['success'] !== true) {
                Log::warning('reCAPTCHA verification failed', ['error-codes' => $data['error-codes'] ?? []]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification exception: ' . $e->getMessage());
            return false;
        }
    }
}
