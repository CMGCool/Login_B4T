# 🔐 Login B4T - Fullstack Authentication System

> Sistem autentikasi fullstack dengan role-based access control, dibangun dengan Laravel 8 (Backend) dan Next.js 16 (Frontend).

[![Laravel](https://img.shields.io/badge/Laravel-8.75-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-000000?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Development Guide](#-development-guide)
- [Setup Guide](#-setup-guide)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

---

## 🎯 Overview

Login B4T adalah sistem autentikasi lengkap yang menyediakan user management dengan approval workflow, multiple authentication methods, dan role-based access control untuk aplikasi modern.

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| **Super Admin** | `superadmin` | `password123` |
| **Admin** | `admin1` | `password123` |

---

## ✨ Features

- 🔑 **User Authentication** - Login dengan username/password
- 🌐 **Google OAuth** - Login dengan akun Google
- 👥 **User Registration** - Registrasi dengan approval workflow
- 🛡️ **Role-Based Access** - Super Admin, Admin, User roles
- 📊 **Dashboard Statistics** - Real-time statistics
- ✏️ **User Management** - CRUD operations untuk users
- 🎨 **Modern UI** - Beautiful interface dengan shadcn/ui
- 📱 **Responsive Design** - Mobile-friendly
- 🔐 **Token Authentication** - Laravel Sanctum
- ✅ **Form Validation** - Client & server-side validation

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Laravel** | 8.75 | PHP Framework |
| **Laravel Sanctum** | 2.15 | Token Authentication |
| **Laravel Socialite** | 5.5 | Google OAuth |
| **MySQL** | 5.7 | Database |
| **Guzzle** | 7.0 | HTTP Client |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React Framework |
| **React** | 19.2.3 | UI Library |
| **TypeScript** | 5 | Type Safety |
| **Tailwind CSS** | 4 | Styling |
| **shadcn/ui** | - | UI Components |
| **React Hook Form** | 7.69 | Form Management |
| **Zod** | 4.2.1 | Validation |
| **Axios** | 1.13.2 | HTTP Client |

---

## 📋 Prerequisites

### System Requirements

#### Backend
- **PHP**: 7.3 or 8.0
- **Composer**: 2.6+ or 2.7
- **MySQL**: 5.7
- **XAMPP** : For local development

#### Frontend
- **Node.js**: 20.9
- **npm**: 11.6.2

### Verify Installations

```bash
# Check PHP version
php --version

# Check Composer version
composer --version

# Check MySQL version
mysql --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Required PHP Extensions

Ensure these extensions are enabled in `php.ini`:

```ini
extension=openssl
extension=mbstring
extension=ctype
extension=json
extension=curl
extension=pdo
extension=pdo_mysql
```

---

## 💻 Development Guide

Panduan lengkap untuk membangun project dari awal.

### Backend Development (Laravel)

<details>
<summary><b>📦 Step 1-5: Setup Project & Dependencies</b></summary>

#### 1. Create Laravel Project

```bash
# Create project directory
mkdir Login_B4T && cd Login_B4T

# Create new Laravel 8 project
composer create-project laravel/laravel backend_login_b4t "8.*"
cd backend_login_b4t
```

#### 2. Install Required Packages

```bash
composer require laravel/sanctum laravel/socialite guzzlehttp/guzzle fruitcake/laravel-cors doctrine/dbal
```

**Packages Installed:**
- `laravel/sanctum` → Token authentication
- `laravel/socialite` → OAuth integration
- `guzzlehttp/guzzle` → HTTP client
- `fruitcake/laravel-cors` → CORS support
- `doctrine/dbal` → Database tools

#### 3. Configure Environment

```bash
cp .env.example .env
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

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

FRONTEND_URL=http://localhost:3000
```

#### 4. Setup Database

**Via MySQL CLI:**
```bash
mysql -u root -p
CREATE DATABASE backend_login_b4t;
EXIT;
```

**Via XAMPP phpMyAdmin:**
1. Open `http://localhost/phpmyadmin`
2. Click "New" → Create database
3. Name: `backend_login_b4t`
4. Collation: `utf8mb4_unicode_ci`

#### 5. Configure Sanctum

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

**Update `app/Http/Kernel.php`:**  
Add Sanctum middleware to API middleware group.

</details>

<details>
<summary><b>🗄️ Step 6-7: Database & Models</b></summary>

#### 6. Create Migrations

```bash
php artisan make:migration add_google_sso_fields_to_users_table --table=users
```

**Add these fields to users table:**
- `username` (string, unique) - For login
- `google_id` (string, nullable) - Google OAuth ID
- `avatar` (string, nullable) - Profile picture URL
- `provider` (string, nullable) - OAuth provider
- `role` (enum: super_admin, admin, user) - User role
- `is_approved` (boolean, default: 0) - Approval status
- `email_verified_at` (timestamp, nullable) - Email verification

**Run migrations:**
```bash
php artisan migrate
```

#### 7. Update User Model

**File:** `app/Models/User.php`

**Key Updates:**
- Use `HasApiTokens` trait (from Sanctum)
- Add to `fillable`: name, username, email, password, role, is_approved, google_id, avatar, provider
- Add to `hidden`: password, remember_token
- Add `casts`: is_approved (boolean), email_verified_at (datetime)

</details>

<details>
<summary><b>🎮 Step 8-10: Controllers, Middleware & Routes</b></summary>

#### 8. Create Controllers

**AuthController (`app/Http/Controllers/Api/AuthController.php`):**

**Methods:**
| Method | Description | Returns |
|--------|-------------|---------|
| `register()` | Register new user (pending approval) | Message |
| `login()` | Login & generate token | Token + User |
| `logout()` | Revoke current token | Message |
| `me()` | Get authenticated user | User data |
| `redirectToGoogle()` | Redirect to Google OAuth | Redirect |
| `handleGoogleCallback()` | Handle Google callback | Token + User |

**AdminController:**
| Method | Description |
|--------|-------------|
| `getUsers()` | List all users (exclude admins) |
| `createUser()` | Create user (auto approved) |
| `approveUser($id)` | Approve pending user |
| `dashboardStats()` | Get statistics |

**SuperAdminController:**
| Method | Description |
|--------|-------------|
| `getUsers()` | List users & admins |
| `createAdmin()` | Create new admin |
| `createUser()` | Create new user |
| `dashboardStats()` | Get full statistics |

**UserController:**
| Method | Description |
|--------|-------------|
| `updateUser($id)` | Update user data |
| `deleteUser($id)` | Delete user |

#### 9. Create Middleware

**RoleMiddleware (`app/Http/Middleware/RoleMiddleware.php`):**

**Purpose:** Check user role for protected routes

**Usage:**
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function() {
    // Admin routes
});
```

#### 10. Setup Routes

**File:** `routes/api.php`

**Public Routes:**
```php
POST   /register                    # Register user
POST   /login                       # Login
GET    /auth/google/redirect        # Google OAuth redirect
GET    /auth/google/callback        # Google OAuth callback
```

**Protected Routes:**
```php
POST   /logout                      # Logout (auth:sanctum)
GET    /me                          # Get profile (auth:sanctum)

# Admin routes (role:admin)
GET    /admin/users
POST   /admin/create-user
POST   /approve-user/{id}
GET    /admin/dashboard-stats

# Super Admin routes (role:super_admin)
GET    /super-admin/users
POST   /super-admin/create-admin
POST   /super-admin/create-user
GET    /super-admin/dashboard-stats

# Common routes
PUT    /users/{id}
DELETE /users/{id}
```

</details>

<details>
<summary><b>🌱 Step 11-13: Seeders, CORS & Google OAuth</b></summary>

#### 11. Create Seeders

```bash
php artisan make:seeder SuperAdminSeeder
php artisan make:seeder AdminSeeder
```

**SuperAdminSeeder:** Creates `superadmin/password123`  
**AdminSeeder:** Creates `adminit/password123`

**Run seeders:**
```bash
php artisan db:seed
```

#### 12. Configure CORS

**File:** `config/cors.php`

```php
'paths' => ['api/*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

#### 13. Configure Google OAuth

**File:** `config/services.php`

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

**Get Google Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:8000/api/auth/google/callback`
5. Copy Client ID & Secret to `.env`

</details>

**Start Backend Server:**
```bash
php artisan serve
# Backend running at http://localhost:8000
```

---

### Frontend Development (Next.js)

<details>
<summary><b>📦 Step 1-4: Setup Project & Dependencies</b></summary>

#### 1. Create Next.js Project

```bash
cd ..
npx create-next-app@latest frontend_b4t --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
cd frontend_b4t
```

#### 2. Initialize shadcn/ui

```bash
npx shadcn@latest init --yes
npx shadcn@latest add button input card form label table dialog
```

#### 3. Install Dependencies

```bash
# Core packages
npm install axios react-hook-form zod @hookform/resolvers react-icons

# Radix UI components
npm install @radix-ui/react-label @radix-ui/react-slot

# Utility packages
npm install class-variance-authority clsx tailwind-merge lucide-react
```

#### 4. Configure Environment

**Create `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

</details>

<details>
<summary><b>🔧 Step 5-6: API Client, Services & Context</b></summary>

#### 5. Setup API Client

**File:** `src/lib/api.ts`

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### 6. Create Services

**File:** `src/lib/auth.ts`

**Functions:**
- `login(data)` → POST /login
- `register(data)` → POST /register
- `logout()` → POST /logout
- `getProfile()` → GET /me

**File:** `src/lib/user.ts`

**Functions:**
- `getAdminUsers(token)` → GET /admin/users
- `getSuperAdminUsers(token)` → GET /super-admin/users
- `createUser(data, role, token)` → POST /admin or /super-admin create-user
- `createAdmin(data, token)` → POST /super-admin/create-admin
- `updateUser(id, data, token)` → PUT /users/{id}
- `deleteUser(id, token)` → DELETE /users/{id}
- `approveUser(id, token)` → POST /approve-user/{id}

**File:** `src/lib/validations.ts`

**Schemas:**
```typescript
export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  username: z.string().min(1, 'Username required'),
  email: z.string().email().optional(),
  password: z.string().min(6, 'Min 6 characters'),
});
```

</details>

<details>
<summary><b>🎨 Step 7-9: Routes, Components & Pages</b></summary>

#### 7. Create Route Structure

```
src/app/
├── (auth)/
│   └── auth/
│       ├── Signin/page.tsx     → /auth/Signin
│       ├── Signup/page.tsx     → /auth/Signup
│       └── layout.tsx          # Clean layout
│
└── (dashboard)/
    ├── admin/
    │   ├── dashboard/page.tsx  → /admin/dashboard
    │   └── user/page.tsx       → /admin/user
    ├── super-admin/
    │   ├── admin/page.tsx      → /super-admin/admin
    │   ├── dashboard/page.tsx  → /super-admin/dashboard
    │   └── users/page.tsx      → /super-admin/users
    ├── user/
    │   └── welcome/page.tsx    → /user/welcome
    └── layout.tsx              # With header/sidebar
```

#### 8. Create Components

**Auth Components:**
- `LoginForm` → Login form with validation
- `RegisterForm` → Register form with validation
- `GoogleButton` → Google OAuth button

**Dashboard Components:**
- `Header` → Top navigation with logout
- `Sidebar` → Side navigation menu
- `UserTable` → Display user list
- `CreateUserDialog` → Modal for create user
- `EditUserDialog` → Modal for edit user
- `StatsCards` → Statistics cards

#### 9. Update Root Layout

**File:** `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

</details>

**Start Frontend Server:**
```bash
npm run dev
# Frontend running at http://localhost:3000
```

---

## 🚀 Setup Guide

Panduan untuk setup project yang sudah ada (clone repository).

### Backend Setup

```bash
# Clone repository
git clone https://github.com/CMGcool/backend_login_b4t.git
cd backend_login_b4t

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env (edit file manually)
# DB_DATABASE, DB_USERNAME, DB_PASSWORD
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
# FRONTEND_URL

# Setup database
mysql -u root -p
CREATE DATABASE backend_login_b4t;
EXIT;

# Run migrations & seeders
php artisan migrate
php artisan db:seed

# Start server
php artisan serve
```

**Backend URL:** `http://localhost:8000`

---

### Frontend Setup

```bash
# Navigate to frontend
cd frontend_b4t

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start server
npm run dev
```

**Frontend URL:** `http://localhost:3000`

**Verify Setup:** Open `http://localhost:3000/auth/Signin`

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require:
```http
Authorization: Bearer {token}
```

---

### Public Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

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

#### Login
```http
POST /login
Content-Type: application/json

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
    "role": "super_admin"
  }
}
```

---

#### Google OAuth

**Redirect:**
```http
GET /auth/google/redirect
```

**Callback:**
```http
GET /auth/google/callback?code={code}&state={state}
```

---

### Protected Endpoints

#### Get Profile
```http
GET /me
Authorization: Bearer {token}
```

#### Logout
```http
POST /logout
Authorization: Bearer {token}
```

---

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | List all users |
| POST | `/admin/create-user` | Create new user |
| POST | `/approve-user/{id}` | Approve user |
| GET | `/admin/dashboard-stats` | Get statistics |

---

### Super Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/super-admin/users` | List users & admins |
| POST | `/super-admin/create-admin` | Create admin |
| POST | `/super-admin/create-user` | Create user |
| GET | `/super-admin/dashboard-stats` | Full statistics |

---

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |

---

## 🏗 Architecture

### Frontend Architecture

#### Route Groups

```
(auth)/            → Route group (invisible in URL)
  └── auth/        → Actual path
      ├── Signin/  → URL: /auth/Signin
      └── Signup/  → URL: /auth/Signup

(dashboard)/       → Route group (invisible in URL)
  ├── admin/
  │   ├── dashboard/ → URL: /admin/dashboard
  │   └── users/ → URL: /admin/users
  ├── users/
  │   └── dashboard/ → URL: /users/welcome
  └── super-admin/
      ├── dashboard/ → URL: /super-admin/dashboard
      ├── Admin/ → URL: /super-admin/admin
      └── users/ → URL: /super-admin/users
```

**Benefits:**
- Organize routes logically
- Different layouts per group
- Clean URL structure

---

#### Service Layer Pattern

```
src/lib/
├── api.ts          # Axios instance with interceptors
├── auth.ts         # Authentication services
├── user.ts         # User management services
└── validations.ts  # Zod validation schemas
```

**Benefits:**
- Separation of concerns
- Reusable API calls
- Centralized logic
- Type safety
- Easy testing

---

#### Authentication Flow

```
┌─────────────┐
│ Login Form  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validate   │  (Zod + React Hook Form)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Call   │  (Axios)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Save Token  │  (localStorage + Context)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Redirect   │  (Based on role)
└─────────────┘
```

---

### Backend Architecture

#### Laravel Sanctum Flow

```
┌──────────┐
│  Login   │
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Generate     │
│ Token        │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Store in DB  │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Return Token │
└──────────────┘

API Request:
┌──────────────┐
│ Verify Token │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Authenticate │
│ User         │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Process      │
│ Request      │
└──────────────┘
```

---

#### Database Schema

```
users table:
├── id (primary key)
├── name (string)
├── username (string, unique)
├── email (string, nullable, unique)
├── google_id (string, nullable)
├── avatar (string, nullable)
├── provider (string, nullable)
├── email_verified_at (timestamp, nullable)
├── password (string, hashed)
├── role (enum: super_admin|admin|user)
├── is_approved (boolean, default: 0)
├── remember_token (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

#### Roles & Permissions

| Action | Super Admin | Admin | User |
|--------|:-----------:|:-----:|:----:|
| Create User | ✅ | ✅ | ❌ |
| Create Admin | ✅ | ❌ | ❌ |
| Edit User | ✅ | ✅* | ❌ |
| Edit Admin | ✅ | ❌ | ❌ |
| Delete User | ✅ | ✅* | ❌ |
| Delete Admin | ✅ | ❌ | ❌ |
| Approve User | ✅ | ✅ | ❌ |
| View Users | ✅ | ✅ | ❌ |
| View Admins | ✅ | ❌ | ❌ |

*Admin can only manage regular users, not admins

---

## 🧪 Testing

### Backend Testing

#### Using cURL

**Test Login:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"password123"}'
```

**Test Protected Endpoint:**
```bash
# Save token from login response
TOKEN="1|abc123xyz..."

# Test endpoint
curl -X GET http://localhost:8000/api/super-admin/users \
  -H "Authorization: Bearer $TOKEN"
```

#### Using Postman

1. **Login Request:**
   - Method: POST
   - URL: `http://localhost:8000/api/login`
   - Body (JSON): `{"username":"superadmin","password":"password123"}`

2. **Copy Token** from response

3. **Protected Request:**
   - Add Header: `Authorization: Bearer {token}`
   - Test any protected endpoint

---

### Frontend Testing

#### Manual Testing Flow

1. ✅ Open `http://localhost:3000/auth/Signin`
2. ✅ Login with `superadmin` / `password123`
3. ✅ Verify token saved in localStorage (F12 → Application → Local Storage)
4. ✅ Check redirect to appropriate dashboard
5. ✅ Test navigation between pages
6. ✅ Test CRUD operations (Create, Read, Update, Delete)
7. ✅ Test user approval functionality
8. ✅ Test logout & verify token cleared

#### Test Cases

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Google OAuth login
- [ ] Logout

**Authorization:**
- [ ] Super Admin can access all routes
- [ ] Admin can access admin routes only
- [ ] User can access user routes only
- [ ] Unauthorized access redirects properly

**User Management:**
- [ ] Create new user
- [ ] Edit user information
- [ ] Delete user
- [ ] Approve pending user
- [ ] View user list

---

## 🐛 Troubleshooting

### Common Backend Issues

<details>
<summary><b>❌ CORS Error</b></summary>

**Problem:** Frontend can't access backend API

**Solution:**
```bash
# Check config/cors.php
# Verify FRONTEND_URL in .env

php artisan config:clear
php artisan cache:clear
php artisan serve
```

**Verify:** `'allowed_origins' => [env('FRONTEND_URL')]`

</details>

<details>
<summary><b>❌ Database Connection Failed</b></summary>

**Problem:** Can't connect to MySQL

**Solution:**
```bash
# Verify MySQL is running
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Check .env credentials
DB_DATABASE=backend_login_b4t
DB_USERNAME=root
DB_PASSWORD=your_password
```

</details>

<details>
<summary><b>❌ No Application Key</b></summary>

**Problem:** "No application encryption key has been specified"

**Solution:**
```bash
php artisan key:generate
php artisan config:clear
```

</details>

<details>
<summary><b>❌ Sanctum Token Not Working</b></summary>

**Problem:** "Unauthenticated" error on protected routes

**Solution:**
1. Check token is sent in header: `Authorization: Bearer {token}`
2. Verify Sanctum middleware in `app/Http/Kernel.php`
3. Clear config cache:
```bash
php artisan config:clear
php artisan route:clear
```

</details>

---

### Common Frontend Issues

<details>
<summary><b>❌ Module Not Found</b></summary>

**Problem:** Missing dependencies

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

</details>

<details>
<summary><b>❌ Environment Variable Undefined</b></summary>

**Problem:** `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solution:**
1. Check `.env.local` exists
2. Verify variable starts with `NEXT_PUBLIC_`
3. Restart dev server:
```bash
npm run dev
```

</details>

<details>
<summary><b>❌ API Connection Failed</b></summary>

**Problem:** Frontend can't connect to backend

**Solution:**
1. ✅ Verify backend is running: `http://localhost:8000`
2. ✅ Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. ✅ Verify CORS configuration in backend
4. ✅ Check network tab in browser DevTools (F12)

</details>

<details>
<summary><b>❌ Token Not Persisting</b></summary>

**Problem:** User logged out after refresh

**Solution:**
1. Check localStorage is saving token
2. Verify AuthContext is loading token on mount
3. Check browser doesn't block localStorage
4. Test in incognito mode (disable extensions)

</details>

---

## 📖 Resources

### Documentation

**Backend:**
- [Laravel 8 Documentation](https://laravel.com/docs/8.x)
- [Laravel Sanctum](https://laravel.com/docs/8.x/sanctum)
- [Laravel Socialite](https://laravel.com/docs/8.x/socialite)
- [PHP Documentation](https://www.php.net/docs.php)

**Frontend:**
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://z
