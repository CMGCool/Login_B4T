<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OTP Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
        }
        .content {
            color: #555;
            line-height: 1.6;
            margin: 20px 0;
        }
        .otp-box {
            background-color: #f9f9f9;
            border: 2px solid #007bff;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #007bff;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .expiry {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>

        <div class="content">
            <p>Hi,</p>
            <p>You requested to reset your password. Use the OTP code below to complete the process:</p>

            <div class="otp-box">
                <div class="otp-code">{{ $otp }}</div>
                <div class="expiry">This code expires in 5 minutes</div>
            </div>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our support team will never ask for this code.
            </div>

            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>

            <p>
                Best regards,<br>
                <strong>{{ config('app.name') }} Team</strong>
            </p>
        </div>

        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
