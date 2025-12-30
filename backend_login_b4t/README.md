## API Documentation

### Base URL
```
http://localhost:8000/api
```

---

### Authentication

API ini menggunakan Laravel Sanctum untuk autentikasi. Token bearer harus disertakan di header untuk endpoint yang memerlukan autentikasi:

```
Authorization: Bearer {token}
```

---

## Public Endpoints (Tanpa Autentikasi)

### 1. Register
**POST** `/register`

Mendaftarkan user baru. User akan menunggu approval dari admin/super admin.

**Request Body:**
```json
{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Validation:**
- `name`: required, string
- `username`: required, string, unique
- `email`: nullable, email, unique
- `password`: required, minimum 6 karakter

**Response (201):**
```json
{
    "message": "Register berhasil, menunggu approval admin"
}
```

---

### 2. Login
**POST** `/login`

Login dengan username dan password.

**Request Body:**
```json
{
    "username": "johndoe",
    "password": "password123"
}
```

**Validation:**
- `username`: required
- `password`: required

**Response Success (200):**
```json
{
    "token": "1|abc123...",
    "role": "user",
    "user": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "role": "user",
        "is_approved": true
    }
}
```

**Response Error:**
- **401** - Username atau password salah
- **403** - Akun belum di-approve
- **403** - Akun ini menggunakan login Google

---

## Protected Endpoints

### User Endpoints (Role: user)

#### 1. User Welcome Page
**GET** `/user/welcome`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Welcome John Doe",
    "role": "user"
}
```

---

### Admin Endpoints (Role: admin)

#### 1. Get All Users
**GET** `/admin/users`

Melihat semua user (tidak termasuk admin dan super_admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "is_approved": true,
            "created_at": "2025-12-30T10:00:00.000000Z"
        }
    ]
}
```

---

#### 2. Create User
**POST** `/admin/create-user`

Admin dapat membuat user baru yang langsung aktif (tidak perlu approval).

**Headers:**
```
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

**Validation:**
- `name`: required, string
- `username`: required, string, unique
- `email`: nullable, email, unique
- `password`: required, minimum 6 karakter

**Response (201):**
```json
{
    "message": "User berhasil dibuat"
}
```

---

#### 3. Approve User
**POST** `/approve-user/{id}`

Admin/Super Admin dapat approve user yang baru register.

**Headers:**
```
Authorization: Bearer {token}
```

**URL Parameter:**
- `id`: User ID

**Response Success (200):**
```json
{
    "message": "User approved successfully",
    "user": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "is_approved": true
    }
}
```

**Response Error (400):**
```json
{
    "message": "User already approved"
}
```

---

### Super Admin Endpoints (Role: super_admin)

#### 1. Create Admin
**POST** `/super-admin/create-admin`

Super admin dapat membuat admin baru.

**Headers:**
```
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

**Validation:**
- `name`: required, string, max 255 karakter
- `username`: required, string, unique
- `email`: required, email, unique
- `password`: required, minimum 6 karakter

**Response (201):**
```json
{
    "message": "Admin berhasil dibuat",
    "data": {
        "id": 2,
        "name": "Admin User",
        "username": "adminuser",
        "email": "admin@example.com",
        "role": "admin",
        "is_approved": 1
    }
}
```

---

#### 2. Create User
**POST** `/super-admin/create-user`

Super admin dapat membuat user baru yang langsung aktif.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
    "name": "New User",
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123"
}
```

**Response (201):**
```json
{
    "message": "User berhasil dibuat"
}
```

---

#### 3. Get All Users and Admins
**GET** `/super-admin/users`

Melihat semua admin dan user (tidak termasuk super_admin).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "data": [
        {
            "id": 1,
            "name": "Admin User",
            "username": "adminuser",
            "email": "admin@example.com",
            "role": "admin",
            "is_approved": 1,
            "created_at": "2025-12-30T09:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "role": "user",
            "is_approved": 1,
            "created_at": "2025-12-30T10:00:00.000000Z"
        }
    ]
}
```

---

### Common Endpoint (Semua Role yang Authenticated)

#### Logout
**POST** `/logout`

Logout dan hapus token saat ini.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
    "message": "Logout berhasil"
}
```

---

## Roles & Permissions

| Role | Permissions |
|------|------------|
| **super_admin** | - Membuat admin<br>- Membuat user<br>- Melihat semua admin & user<br>- Approve user |
| **admin** | - Membuat user<br>- Melihat semua user<br>- Approve user |
| **user** | - Akses welcome page<br>- Logout |

---

## Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
    "message": "Unauthorized action."
}
```

### 404 Not Found
```json
{
    "message": "Resource not found"
}
```

### 422 Validation Error
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "username": [
            "The username has already been taken."
        ]
    }
}
```

---

## Setup & Configuration

### 1. Install Dependencies
```bash
composer install
```

### 2. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Configure Database
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Configure Google OAuth
Edit `.env` file:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### 5. Run Migrations
```bash
php artisan migrate
```

### 6. Seed Super Admin
```bash
php artisan db:seed --class=SuperAdminSeeder
```

### 7. Start Server
```bash
php artisan serve
```

Server akan berjalan di `http://localhost:8000`

---

## Testing

### Using Postman or Thunder Client

1. **Register User**
   - POST `http://localhost:8000/api/register`
   - Body: JSON dengan name, username, email, password

2. **Login Super Admin** (setelah seeding)
   - POST `http://localhost:8000/api/login`
   - Body: username & password dari SuperAdminSeeder

3. **Use Bearer Token**
   - Salin token dari response login
   - Tambahkan di header: `Authorization: Bearer {token}`

4. **Test Protected Endpoints**
   - Sesuaikan endpoint dengan role user yang login

---

## Notes

- User yang register manual perlu approval dari admin/super_admin
- User yang login via Google langsung approved
- Admin hanya bisa dibuat oleh super_admin
- Token dikelola menggunakan Laravel Sanctum
- CORS sudah dikonfigurasi untuk frontend di `http://localhost:3000`

