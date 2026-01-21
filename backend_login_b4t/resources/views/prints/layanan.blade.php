<!DOCTYPE html>
<html>
<head>
    <title>Print Data Layanan</title>
    <style>
        body { font-family: Arial; padding: 30px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #333; padding: 8px; }
        th { background: #f2f2f2; }
        h2 { text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body onload="window.print()">

<h2>Data Layanan</h2>

<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Nama Layanan</th>
            <th>Tanggal Layanan</th>
            <th>Pembayaran</th>
        </tr>
    </thead>
    <tbody>
        @foreach($data as $row)
        <tr>
            <td>{{ $row->id }}</td>
            <td>{{ $row->nama_layanan }}</td>
            <td>{{ $row->tanggal_layanan }}</td>
            <td>{{ number_format($row->pembayaran) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
</body>
</html>
