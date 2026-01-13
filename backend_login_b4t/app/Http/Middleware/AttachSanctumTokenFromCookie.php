<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AttachSanctumTokenFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('token');
        \Illuminate\Support\Facades\Log::info('Middleware AttachSanctumTokenFromCookie running. Cookie token: ' . ($token ? 'FOUND' : 'MISSING'));
        if ($token) {
            \Illuminate\Support\Facades\Log::info('Token partial: ' . substr($token, 0, 20));
            $request->headers->set('Authorization', 'Bearer ' . $token);
            $request->server->set('HTTP_AUTHORIZATION', 'Bearer ' . $token);
            
            \Illuminate\Support\Facades\Auth::shouldUse('sanctum');
            $user = \Illuminate\Support\Facades\Auth::user();
            
            \Illuminate\Support\Facades\Log::info('Header set. Verify bearerToken(): ' . $request->bearerToken());
            \Illuminate\Support\Facades\Log::info('User resolved in middleware: ' . ($user ? $user->username : 'NONE'));

            if ($user) {
                // Force set the user on the request
                $request->setUserResolver(function () use ($user) {
                    return $user;
                });
                // Force set the user on the Auth guard
                \Illuminate\Support\Facades\Auth::setUser($user);
            }

            // MANUAL DEBUG
            $tokenData = explode('|', $token, 2);
            if (count($tokenData) === 2) {
                $id = $tokenData[0];
                $plainToken = $tokenData[1];
                $accessToken = \Laravel\Sanctum\PersonalAccessToken::find($id);
                if ($accessToken) {
                    $isMatch = hash_equals($accessToken->token, hash('sha256', $plainToken));
                    \Illuminate\Support\Facades\Log::info("Manual Check - ID: $id, Match: " . ($isMatch ? 'YES' : 'NO'));
                } else {
                    \Illuminate\Support\Facades\Log::info("Manual Check - ID: $id NOT FOUND in DB");
                }
            }
        }

        return $next($request);
    }
}
