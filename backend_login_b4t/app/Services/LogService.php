<?php

namespace App\Services;

use App\Models\Log;
use Illuminate\Support\Facades\Auth;

class LogService
{
    /**
     * Create a new log entry
     */
    public static function create(array $data)
    {
        $user = Auth::user();

        return Log::create([
            'user_id' => $data['user_id'] ?? ($user ? $user->id : null),
            'user_role' => $data['user_role'] ?? ($user ? $user->role : null),
            'action' => $data['action'],
            'model' => $data['model'] ?? null,
            'model_id' => $data['model_id'] ?? null,
            'description' => $data['description'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
        ]);
    }

    /**
     * Log untuk aksi login
     */
    public static function logLogin($user)
    {
        return self::create([
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'login',
            'description' => "User {$user->name} logged in successfully",
        ]);
    }

    /**
     * Log untuk aksi CRUD
     */
    public static function logCrud($action, $model, $modelData, $oldData = null)
    {
        $user = Auth::user();
        $modelName = class_basename($model);

        $description = self::generateDescription($action, $modelName);

        return self::create([
            'action' => $action,
            'model' => $modelName,
            'model_id' => $modelData->id ?? null,
            'description' => $description,
            'old_values' => $oldData,
            'new_values' => $action !== 'delete' ? $modelData->toArray() : null,
        ]);
    }

    /**
     * Generate description berdasarkan action
     */
    private static function generateDescription($action, $modelName)
    {
        $user = Auth::user();
        $userName = $user ? $user->name : 'System';

        switch ($action) {
            case 'create':
                return "{$userName} created a new {$modelName}";
            case 'update':
                return "{$userName} updated {$modelName}";
            case 'delete':
                return "{$userName} deleted {$modelName}";
            case 'view':
                return "{$userName} viewed {$modelName}";
            default:
                return "{$userName} performed {$action} on {$modelName}";
        }
    }
}
