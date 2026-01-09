# Dashboard Duplikasi - Dashboard B4T

## Struktur Direktori

Dashboard sudah berhasil diduplikasi dari `frontend_b4t` ke `dashboard_b4t` dengan struktur berikut:

```
dashboard_b4t/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (wrapper, tidak ada sidebar di sini)
│   │   │   └── super-admin/
│   │   │       ├── layout.tsx (include Sidebar)
│   │   │       └── dashboard/
│   │   │           └── page.tsx (halaman dashboard utama)
│   │   ├── page.tsx (redirect ke /dashboard/super-admin/dashboard)
│   │   ├── layout.tsx (root layout dengan AuthGuard & LocalStorageSync)
│   │   └── globals.css
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── Sidebar.tsx (navigasi menu)
│   │   │   └── Header/
│   │   ├── dashboard/
│   │   │   ├── RevenuePerformanceChart.tsx (chart biaya vs target)
│   │   │   ├── Servicecost.tsx (weekly service cost recap)
│   │   │   └── toplayanan.tsx (top services pie chart)
│   │   ├── ui/
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── select.tsx
│   │   ├── auth-guard.tsx (existing)
│   │   └── LocalStorageSync.tsx (existing)
│   └── lib/
│       ├── api.ts (existing - reads from shared cookie)
│       ├── date.ts (month options & year helpers)
│       └── utils.ts (cn utility function)
```

## File yang Dibuat

### 1. Dashboard Layout & Pages
- `src/app/dashboard/layout.tsx` - Wrapper layout
- `src/app/dashboard/super-admin/layout.tsx` - Layout dengan sidebar
- `src/app/dashboard/super-admin/dashboard/page.tsx` - Dashboard utama dengan stats & charts

### 2. Sidebar Navigation
- `src/components/layouts/Sidebar.tsx` - Menu navigasi super admin (updated routes ke `/dashboard/super-admin/*`)

### 3. Dashboard Components
- `src/components/dashboard/RevenuePerformanceChart.tsx` - Line chart biaya vs target per bulan (dengan year filter)
- `src/components/dashboard/Servicecost.tsx` - Bar chart weekly service cost
- `src/components/dashboard/toplayanan.tsx` - Pie chart top services

### 4. UI Components
- `src/components/ui/input.tsx` - Input field component
- `src/components/ui/card.tsx` - Card layout component
- `src/components/ui/select.tsx` - Select dropdown component

### 5. Utilities
- `src/lib/date.ts` - Month options & year helper functions
- `src/lib/utils.ts` - `cn()` utility function dari clsx & tailwind-merge

## Perubahan pada page.tsx
- Mengarahkan homepage (`/`) ke `/dashboard/super-admin/dashboard`

## Autentikasi & Cookie Schema (Unchanged)
✅ **Skema cookies tetap sama**
- Dashboard membaca token dari cookie yang di-share dengan `domain=localhost`
- `api.ts` yang sudah ada masih digunakan untuk fetch request
- `AuthGuard` dan `LocalStorageSync` tetap melindungi route dan sync state
- Logout di dashboard akan:
  - Call `/api/logout` ke backend
  - Delete cookie dengan `domain=localhost`
  - Redirect ke halaman login di port 3000

## Dependencies Ditambahkan
```json
{
  "axios": "^1.6.0",
  "recharts": "^2.10.3",
  "lucide-react": "^0.394.0",
  "react-icons": "^5.0.1",
  "@radix-ui/react-select": "^2.0.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0"
}
```

## Langkah Selanjutnya

1. **Install Dependencies:**
   ```bash
   cd c:\Tugas-1\dashboard_b4t
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev -- --port 3001
   ```

3. **Access Dashboard:**
   - Buka http://localhost:3001
   - Akan redirect ke http://localhost:3001/dashboard/super-admin/dashboard
   - Masih menggunakan login dari http://localhost:3000

## Route Structure
- `/ ` → Redirect ke `/dashboard/super-admin/dashboard`
- `/dashboard` → Wrapper layout (no sidebar)
- `/dashboard/super-admin` → Layout dengan sidebar
- `/dashboard/super-admin/dashboard` → Dashboard dengan stats & charts
- `/dashboard/super-admin/users` → Users page (placeholder)
- `/dashboard/super-admin/admin` → Admin page (placeholder)
- `/dashboard/super-admin/layanan` → Layanan page (placeholder)
- `/dashboard/super-admin/target` → Target page (placeholder)
- `/dashboard/super-admin/settings` → Settings page (placeholder)

## Dashboard Features
✅ Stats Cards:
- Total Admin
- Total User  
- Pending Approval

✅ Charts:
- Revenue Performance (Line Chart dengan year filter)
- Service Cost Recap (Weekly Bar Chart)
- Top Services (Pie Chart)

✅ Navigation:
- Sidebar dengan menu links
- Profile display dari `/api/me`
- Logout button (sync dengan frontend_b4t)

## Notes
- Dashboard menggunakan API yang sama dengan `frontend_b4t` di port 8000
- Sidebar routes sudah updated ke `/dashboard/super-admin/*` bukan `/super-admin/*`
- Semua chart data ambil dari endpoint yang sama di backend
- Currency formatting tetap `id-ID` (IDR)
