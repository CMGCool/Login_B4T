<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Revenue Target</title>
    <style>
    body {
        font-family: "Arial", sans-serif;
        font-size: 12px;
        color: #333;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 25px;
    }

    .company {
        margin-left: 15px;
    }

    .company h2 {
        margin: 0;
        font-size: 18px;
    }

    .company p {
        margin: 2px 0;
        font-size: 11px;

    }

    .title {
        text-align: center;
        margin: 20px 0;
    }

    .title h3 {
        margin: 0;
        text-transform: uppercase;
        text-align: center;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        border: 1px solid #444;
        padding: 8px;
        text-align: center;
    }

    th {
        background-color: #f2f2f2;
    }

    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
        text-align: right;
    }

    .logo {
        width: 80px;
        height: auto;
    }

    .column {
        float: left;
    }
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
        text-align: right;
    }

    .column:first-child {
        width: auto;
    }

    .column:last-child {
        width: auto;
    }

    /* Clear floats after the columns */
    .row:after {
        content: "";
        display: table;
        clear: both;
    }
    .divider{
      margin-top: 5px;
      border-top: 3px solid #000000;   
    }
    tr.year-start td {
    background: #eaf2f8;          /* biru muda lembut */
    font-weight: 700;
  }

  /* opsional: garis pemisah tahun biar lebih tegas */
  tr.year-start td {
    border-top: 2px solid #333;
  }
    </style>
</head>

<body>

    <div class="header">
        <div class="row">
            <div class="column">
                <img src="{{ public_path('Images/Logo-B4T.png') }}" class="logo">
            </div>
            <div class="column">
                <div class="company">
                    <h2>Balai Besar Standardisasi dan Pelayanan</h2>
                    <h2>Jasa Industri Bahan dan Barang Teknik</h2>
                    <p>Jl. Sangkuriang No.14, Dago, Kecamatan Coblong, Kota Bandung, Jawa Barat 40135</p>
                </div>
            </div>
        </div>
        <div class="divider"></div>
    </div>

    <div class="title">
        <h3>LAPORAN REVENUE TARGET</h3>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Bulan</th>
                <th>Target</th>
                <th>Tahun</th>
            </tr>
        </thead>
        <tbody>
  @foreach($revenueTargets as $i => $row)
    @php
      $isJanuary = strtolower(trim($row->bulan)) === 'januari';
    @endphp

    <tr class="{{ $isJanuary ? 'year-start' : '' }}">
      <td>{{ $i + 1 }}</td>
      <td>{{ $row->bulan }}</td>
      <td style="text-align:center;">Rp {{ number_format($row->target_perbulan, 0, ',', '.') }}</td>
      <td>{{ $row->tahun }}</td>
    </tr>
  @endforeach
</tbody>

    </table>
    {{-- FOOTER --}}
    <div class="footer">
        Dicetak pada: {{ date('d-m-Y H:i') }}
    </div>
</body>
</html>
