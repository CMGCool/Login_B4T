<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Revenue Target</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        h3 { text-align: center; margin-bottom: 20px; }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: center;
        }

        th {
            background-color: #eaeaea;
        }
    </style>
</head>
<body>

    <h3>LAPORAN REVENUE TARGET</h3>

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
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $row->bulan }}</td>
                <td>Rp {{ number_format($row->target_perbulan, 0, ',', '.') }}</td>
                <td>{{ $row->tahun }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
