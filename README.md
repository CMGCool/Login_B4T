# Login B4T - Fullstack Authentication System

Sistem autentikasi fullstack dengan role-based access control, dibangun dengan Laravel 8 (Backend) dan Next.js 16 (Frontend).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Architecture & Concepts](#architecture--concepts)
- [Roles & Permissions](#roles--permissions)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Overview

Login B4T adalah sistem autentikasi lengkap yang menyediakan:

- ✅ User registration dengan approval workflow
- ✅ Login dengan username/password dan Google OAuth
- ✅ Role-based access control (Super Admin, Admin, User)
- ✅ User management (CRUD operations)


**Demo Credentials:**

**Super Admin:**
- Username: `superadmin`
- Password: `password123`

**Admin:**
- Username: `adminit`
- Password: `password123`

---

## Tech Stack

### Backend
- **Laravel** 8.75 - PHP Framework
- **Laravel Sanctum** 2.15 - Token Authentication
- **Laravel Socialite** 5.5 - Google OAuth
- **MySQL** 5.7+ - Database
- **Guzzle** 7.0 - HTTP Client
- **CORS** Support

### Frontend
- **Next.js** 16.1.1 (App Router)
- **React** 19.2.3
- **TypeScript** 5
- **Tailwind CSS** 4
- **shadcn/ui** - UI Components
- **React Hook Form** 7.69 - Form Management
- **Zod** 4.2.1 - Schema Validation
- **Axios** 1.13.2 - HTTP Client
- **React Icons** 5.5.0
- **ESLint** 9

---

## Prerequisites

### Backend Requirements

| Tool | Version | Download |
|------|---------|----------|
| PHP | 7.3+ or 8.0+ | https://www.php.net/downloads |
| Composer | Latest | https://getcomposer.org/download |
| MySQL | 5.7+ | https://www.mysql.com/downloads |

**PHP Extensions Required:**
```
extension=openssl
extension=mbstring
extension=ctype
extension=json
extension=curl
extension=pdo
extension=pdo_mysql
```

### Frontend Requirements

| Tool | Version |
|------|---------|
| Node.js | 20.9+ |
| npm | Latest |

**Verify installations:**
```bash
php --version
composer --version
mysql --version
node --version
npm --version
```

---

## Backend Setup

### Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/CMGcool/backend_login_b4t.git
cd backend_login_b4t

# Install dependencies
composer install
```

### Step 2: Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

**Edit `.env` file:**
```env
APP_NAME="Backend Login B4T"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend_login_b4t
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Step 3: Database Setup

```bash
# Create database via MySQL CLI
mysql -u root -p
CREATE DATABASE backend_login_b4t;
EXIT;

# Run migrations
php artisan migrate

# Seed super admin
php artisan db:seed --class=SuperAdminSeeder
```

### Step 4: Start Backend Server

```bash
php artisan serve
# Server running at: http://localhost:8000
```

**Test backend:**
```bash
curl http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}'
```

---

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
# Masuk ke folder frontend
cd frontend_b4t
```

### Step 2: Install Dependencies

```bash
# Install semua package yang dibutuhkan
npm install
```

**Packages yang akan diinstall:**
- Next.js 16.1.1
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- React Hook Form 7.69
- Zod 4.2.1
- Axios 1.13.2
- React Icons 5.5.0

### Step 3: Environment Configuration

Buat file `.env.local` di root folder `frontend_b4t`:

```bash
# Buat file .env.local
type nul > .env.local  # Windows
```

**Isi `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Pastikan backend sudah running** di `http://localhost:8000` sebelum start frontend.

### Step 4: Start Frontend Server

```bash
npm run dev
```

**Output:**
```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

Frontend sekarang berjalan di: **http://localhost:3000**

### Step 5: Verify Setup

Buka browser dan akses:
```
http://localhost:3000/auth/Signin
```

**Test login dengan credentials:**

**Super Admin:**
- Username: `superadmin`
- Password: `password123`

**Admin:**
- Username: `adminit`
- Password: `password123`

Jika berhasil login, akan redirect ke dashboard sesuai role. ✅

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
Gunakan Bearer token di header untuk protected endpoints:
```
Authorization: Bearer {token}
```

---

### Public Endpoints

#### 1. Register User
```http
POST /register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Register berhasil, menunggu approval admin"
}
```

---

#### 2. Login
```http
POST /login
```

**Request Body:**
```json
{
  "username": "superadmin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "1|abc123xyz789...",
  "role": "super_admin",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "username": "superadmin",
    "email": "superadmin@example.com",
    "role": "super_admin",
    "is_approved": 1
  }
}
```

---

#### 3. Google OAuth Redirect
```http
GET /auth/google/redirect
```

Redirect ke halaman login Google.

---

#### 4. Google OAuth Callback
```http
GET /auth/google/callback?code={code}&state={state}
```

Callback dari Google. User otomatis dibuat & approved.

**Response:**
Redirect ke: `http://localhost:3000/sso?token={token}&role={role}`

---

### Protected Endpoints

#### Admin Endpoints

##### Get All Users
```http
GET /admin/users
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "name": "John Doe",
      "username": "johndoe",
      "role": "user",
      "is_approved": 1
    }
  ]
}
```

---

##### Create User
```http
POST /admin/create-user
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "password123"
}
```

---

##### Update User
```http
PUT /users/{id}
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "username": "newusername"
}
```

---

##### Delete User
```http
DELETE /users/{id}
Authorization: Bearer {token}
```

---

##### Approve User
```http
POST /approve-user/{id}
Authorization: Bearer {token}
```

---

##### Dashboard Stats
```http
GET /admin/dashboard-stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": {
    "total_users": 10,
    "total_approved": 9,
    "total_pending": 1
  }
}
```

---

#### Super Admin Endpoints

##### Create Admin
```http
POST /super-admin/create-admin
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Admin User",
  "username": "adminuser",
  "email": "admin@example.com",
  "password": "password123"
}
```

---

##### Get All Users & Admins
```http
GET /super-admin/users
Authorization: Bearer {token}
```

---

##### Dashboard Stats
```http
GET /super-admin/dashboard-stats
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": {
    "total_users": 10,
    "total_admins": 3,
    "total_approved": 13,
    "total_pending": 0,
    "total_all": 13
  }
}
```

---

#### Common Endpoints

##### Logout
```http
POST /logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout berhasil"
}
```

---

## Architecture & Concepts

### Frontend Architecture

#### 1. Route Groups
Next.js Route Groups digunakan untuk mengelompokkan halaman tanpa memengaruhi URL:

**`(auth)` Group** - Halaman tanpa layout:
- `/auth/Signin`
- `/auth/Signup`

**`(dashboard)` Group** - Halaman dengan layout lengkap:
- `/admin` - Admin dashboard
- `/super-admin` - Super Admin dashboard
- `/user` - User dashboard

#### 2. Service Layer Pattern
Memisahkan logic bisnis dari UI components:

```
src/lib/
├── api.ts          # Axios instance global
├── auth.ts         # Auth API handlers
├── user.ts         # User API handlers
└── form-schema.ts  # Zod validation schemas
```

**Keuntungan:**
- UI components fokus pada tampilan
- API logic tersentralisasi
- Mudah testing & maintenance
- Konsisten di seluruh aplikasi

#### 3. Form Validation Flow
```
User Input → Zod Schema → React Hook Form → API Handler → Backend
```

- **Zod**: Mendefinisikan aturan validasi
- **React Hook Form**: Mengelola state form
- **API Handler**: Komunikasi dengan backend

---

### Backend Architecture

#### 1. Laravel Sanctum Authentication
Token-based authentication tanpa expiry:

```
Login → Generate Token → Store in DB → Return to Frontend
Protected Route → Verify Token → Allow Access
```

#### 2. Role-Based Middleware
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function() {
    // Admin routes
});
```

#### 3. Database Structure
```
users table:
├── id
├── name
├── username (unique)
├── email (nullable, unique)
├── password (hashed)
├── role (super_admin|admin|user)
├── is_approved (0|1)
├── google_id (nullable)
└── timestamps
```

---

## Roles & Permissions

| Action | Super Admin | Admin | User |
|--------|:-----------:|:-----:|:----:|
| Create User | ✅ | ✅ | ❌ |
| Create Admin | ✅ | ❌ | ❌ |
| Edit User | ✅ | ✅* | ❌ |
| Edit Admin | ✅ | ❌ | ❌ |
| Delete User | ✅ | ✅* | ❌ |
| Delete Admin | ✅ | ❌ | ❌ |
| View Users | ✅ | ✅ | ❌ |
| View Admins | ✅ | ❌ | ❌ |
| Approve User | ✅ | ✅ | ❌ |

**Legend:**
- ✅ = Allowed
- ❌ = Not Allowed
- ✅* = Conditional (user role only)

---

## Testing

### Backend Testing

**Test with cURL:**
```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}'

# Save token
TOKEN="1|abc123xyz..."

# Test protected endpoint
curl -X GET http://localhost:8000/api/super-admin/users \
  -H "Authorization: Bearer $TOKEN"
```

**Test with Postman:**
1. POST `http://localhost:8000/api/login`
2. Copy token from response
3. Add to headers: `Authorization: Bearer {token}`
4. Test other endpoints

---

### Frontend Testing

**Manual Testing Flow:**
1. Open `http://localhost:3000/sign-in`
2. Login with credentials
3. Check token saved in localStorage
4. Navigate to dashboard
5. Test CRUD operations
6. Test logout

**Component Testing:**
```bash
# Run dev server
npm run dev

# Open browser
# http://localhost:3000
```

---

## Troubleshooting

### Backend Issues

#### Issue: "Call to undefined function base64_encode()"
**Solution:**
```bash
# Edit php.ini, uncomment:
extension=openssl
extension=mbstring

# Restart PHP
```

#### Issue: "SQLSTATE[HY000] [2002] Connection refused"
**Solution:**
```bash
# Start MySQL
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

#### Issue: "No application key"
**Solution:**
```bash
php artisan key:generate
```

#### Issue: CORS Error
**Solution:**
Check `config/cors.php`:
```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

Then:
```bash
php artisan cache:clear
php artisan config:clear
```

---

### Frontend Issues

#### Issue: "Module not found"
**Solution:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Environment variable undefined
**Solution:**
1. Ensure `.env.local` exists
2. Variables start with `NEXT_PUBLIC_`
3. Restart dev server

#### Issue: API connection failed
**Solution:**
1. Check backend is running
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check CORS configuration in backend

---

## Resources

### Backend
- [Laravel 8 Documentation](https://laravel.com/docs/8.x)
- [Laravel Sanctum](https://laravel.com/docs/8.x/sanctum)
- [Laravel Socialite](https://laravel.com/docs/8.x/socialite)

### Frontend
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Tools
- [Postman](https://www.postman.com)
- [Thunder Client](https://www.thunderclient.com)

---

## 📝 Common Commands

### Backend
```bash
# Start server
php artisan serve

# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed --class=SuperAdminSeeder

# Cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Tinker (interactive shell)
php artisan tinker
>>> App\Models\User::count()
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build
npm run start

# Lint
npm run lint
```

---


## 📞 Support

**Jika ada masalah:**

1. Check logs:
   - Backend: `storage/logs/laravel.log`
   - Frontend: Browser console
2. Verify .env configuration
3. Check database connection
4. Clear all caches
5. Restart both servers

---

**Last Updated:** December 31, 2025  
**Version:** 1.0.0  
**Repository:** https://github.com/CMGcool/backend_login_b4t
