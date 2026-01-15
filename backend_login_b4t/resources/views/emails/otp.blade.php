<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Your OTP Code</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
    <div
      style="
        max-width: 500px;
        margin: 0 auto;
        padding: 30px 20px 40px;
        background: #f4f7ff;
        background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: top center;
        font-size: 14px;
        color: #434343;
        border-radius: 20px;
      "
    >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td></td>
              <td style="text-align: right;"></td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            margin: 0;
            margin-top: 40px;
            padding: 50px 25px;
            background: #ffffff;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          "
        >
          <div style="width: 100%; max-width: 400px; margin: 0 auto;">
            <h1
              style="
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #1f1f1f;
              "
            >
             Your OTP Code
            </h1>
            <p
              style="
                margin: 0;
                margin-top: 15px;
                font-size: 13px;
                line-height: 1.5;
                font-weight: 400;
              "
            >
              Use the following OTP to complete your verification. This code is
              valid for
              <span style="font-weight: 600; color: #1f1f1f;">5 minutes</span>.
              Do not share this code with others.
            </p>
            <div style="margin-top: 30px;">
                <span style="font-family: 'Sans Serif', Poppins, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 10px 20px; border-radius: 12px; display: inline-block;">{{ $otp }}</span>
            </div>
          </div>
        </div>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 400px;
          margin: 30px auto 0;
          text-align: center;
        "
      >
        <p
          style="
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            line-height: 1.4;
          "
        >
          Balai Besar Standardisasi dan Pelayanan Jasa Industri Bahan dan Barang Teknik
        </p>
        <p style="margin: 0; margin-top: 10px; font-size: 11px; color: #ffffff;">
          Jl. Sangkuriang No.14, Dago, Bandung, Jawa Barat.
        </p>
        <p style="margin: 0; margin-top: 12px; font-size: 11px; color: #ffffff;">
          Copyright © 2026. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>