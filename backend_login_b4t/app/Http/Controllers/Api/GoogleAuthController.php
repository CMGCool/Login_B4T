<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')
            ->stateless()
            ->user();

        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name,
                'username' => $this->generateUniqueUsername($googleUser->email),
                'email' => $googleUser->email,
                'password' => bcrypt(Str::random(32)),
                'role' => 'user',
                'is_approved' => true,
                'provider' => 'google',
                'google_id' => $googleUser->id,
                'avatar' => $googleUser->avatar,
            ]);
        } else {
            // USER SUDAH ADA (REGISTER MANUAL → LOGIN GOOGLE)
            if ($user->provider !== 'google') {
                $user->update([
                    'provider' => 'google',
                    'google_id' => $googleUser->id,
                    'is_approved' => true,
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // DEV VERSION (uncomment saat develop):
        return redirect("http://localhost:3000/sso?token=$token&role={$user->role}")
            ->cookie(
                'token',
                $token,
                60 * 24 * 7,
                '/',
                'localhost',
                true,
                true,
                false,
                'lax'
            );

        // PROD VERSION (uncomment saat deploy):
        // return redirect("https://login.yourdomain.com/sso?token=$token&role={$user->role}")
        //     ->cookie(
        //         'token',
        //         $token,
        //         60 * 24 * 7,
        //         '/',
        //         '.yourdomain.com',
        //         true,
        //         true,
        //         false,
        //         'lax'
        //     );
    }

    private function generateUniqueUsername($email)
    {
        $base = explode('@', $email)[0];
        $username = $base;
        $i = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $i;
            $i++;
        }

        return $username;
    }
}
