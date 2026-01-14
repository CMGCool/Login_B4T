<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Services\LogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    /**
     * Send OTP ke email user
     */
    public function sendOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $email = $request->email;
            $user = User::where('email', $email)->first();

            // Generate OTP 6 digit
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Hapus OTP lama yang belum terpakai
            PasswordResetOtp::where('email', $email)
                ->where('is_used', false)
                ->delete();

            // Simpan OTP baru (expire dalam 5 menit)
            PasswordResetOtp::create([
                'email' => $email,
                'otp_code' => $otp,
                'expires_at' => Carbon::now()->addMinutes(5),
                'is_used' => false,
            ]);

            // Kirim email OTP
            Mail::to($email)->send(new OtpMail($otp, $email));

            // Log activity
            LogService::create([
                'user_id' => $user->id,
                'user_role' => $user->role,
                'action' => 'forgot_password_request',
                'description' => "User {$user->name} requested password reset OTP",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OTP telah dikirim ke email Anda',
                'data' => [
                    'email' => $email,
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verifikasi OTP
     */
    public function verifyOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'otp' => 'required|digits:6',
            ]);

            $email = $request->email;
            $otp = $request->otp;

            // Cek OTP di database
            $otpRecord = PasswordResetOtp::where('email', $email)
                ->where('otp_code', $otp)
                ->where('is_used', false)
                ->first();

            if (!$otpRecord) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau tidak ditemukan',
                ], 404);
            }

            // Cek apakah OTP sudah expired
            if (Carbon::now()->isAfter($otpRecord->expires_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP sudah expired. Silakan minta OTP baru',
                ], 410);
            }

            // Mark OTP sebagai used
            $otpRecord->update(['is_used' => true]);

            // Generate token untuk reset password (gunakan OTP ID sebagai token)
            $token = base64_encode($email . '|' . $otpRecord->id . '|' . Carbon::now()->timestamp);

            $user = User::where('email', $email)->first();

            // Log activity
            LogService::create([
                'user_id' => $user->id,
                'user_role' => $user->role,
                'action' => 'otp_verified',
                'description' => "User {$user->name} verified OTP for password reset",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'OTP berhasil diverifikasi',
                'data' => [
                    'email' => $email,
                    'reset_token' => $token,
                ]
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset password setelah OTP terverifikasi
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'reset_token' => 'required',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $email = $request->email;
            $token = $request->reset_token;
            $password = $request->password;

            // Cari user terlebih dahulu
            $user = User::where('email', $email)->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan',
                ], 404);
            }

            // Log: Memulai proses reset password
            LogService::create([
                'user_id' => $user->id,
                'user_role' => $user->role,
                'action' => 'password_reset_initiated',
                'description' => "User {$user->name} initiated password reset",
            ]);

            // Validasi token
            try {
                $decoded = base64_decode($token, true);
                if (!$decoded) {
                    throw new \Exception('Invalid token format');
                }

                list($tokenEmail, $otpId, $timestamp) = explode('|', $decoded);

                if ($tokenEmail !== $email) {
                    throw new \Exception('Email mismatch');
                }
            } catch (\Exception $e) {
                // Log: Token validation failed
                LogService::create([
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'action' => 'password_reset_failed',
                    'description' => "User {$user->name} password reset failed - Invalid token",
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak valid',
                ], 401);
            }

            // Cek apakah OTP sudah digunakan
            $otpRecord = PasswordResetOtp::find($otpId);
            if (!$otpRecord || !$otpRecord->is_used) {
                // Log: OTP validation failed
                LogService::create([
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'action' => 'password_reset_failed',
                    'description' => "User {$user->name} password reset failed - Invalid OTP",
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau belum terverifikasi',
                ], 401);
            }

            // Update password user
            $user->update([
                'password' => Hash::make($password)
            ]);

            // Hapus OTP record
            $otpRecord->delete();

            // Log: Password reset successful
            LogService::create([
                'user_id' => $user->id,
                'user_role' => $user->role,
                'action' => 'password_reset',
                'model' => 'User',
                'model_id' => $user->id,
                'description' => "User {$user->name} successfully reset password via OTP",
                'old_values' => ['password' => '***'],
                'new_values' => ['password' => '***'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah. Silakan login dengan password baru',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
