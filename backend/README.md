# PharmaSys Backend — PHP + MySQL Setup Guide

## Step 1 — Copy backend to XAMPP

Copy the `pharmasys-backend` folder to your XAMPP htdocs folder:

```
C:\xampp\htdocs\pharmasys-backend\
```

## Step 2 — Start XAMPP

Open XAMPP Control Panel and start:
- ✅ Apache
- ✅ MySQL

## Step 3 — Create the database

1. Open your browser and go to: http://localhost/phpmyadmin
2. Click **"New"** on the left sidebar
3. Click the **"SQL"** tab at the top
4. Open the file `database/pharmasys.sql`
5. Paste the entire contents into the SQL box
6. Click **"Go"**

This creates the `pharmasys` database with all tables and sample data.

## Step 4 — Test the API

Open your browser and visit:
```
http://localhost/pharmasys-backend/api/medicines/index.php
```
You should see a JSON response (will say Unauthorized — that's correct, it needs a token).

## Step 5 — Update React .env

In your React project folder, create a `.env` file:
```
C:\Users\Admin\Downloads\pharmacy-management\pharmacy-management\.env
```

With this content:
```
VITE_API_URL=http://localhost/pharmasys-backend/api
```

## Step 6 — Update Login page to use real API

In `src/pages/Login.jsx`, the `handleSubmit` function — replace the fake password check with:

```js
const response = await api.post('/auth/login.php', { email, password });
const { token, user } = response.data.data;
login({ ...user, token });
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /auth/login.php | Login |
| GET | /medicines/index.php | List medicines |
| POST | /medicines/index.php | Add medicine |
| PUT | /medicines/index.php?id=1 | Update medicine |
| DELETE | /medicines/index.php?id=1 | Delete medicine |
| GET | /suppliers/index.php | List suppliers |
| POST | /suppliers/index.php | Add supplier |
| PUT | /suppliers/index.php?id=1 | Update supplier |
| DELETE | /suppliers/index.php?id=1 | Delete supplier |
| GET | /sales/index.php | Sales history |
| POST | /sales/index.php | Record sale |
| GET | /patients/index.php | List patients |
| POST | /patients/index.php | Register patient |
| GET | /prescriptions/index.php | List prescriptions |
| POST | /prescriptions/index.php | Create prescription |
| PUT | /prescriptions/index.php?id=1 | Update status |

## Default Login Credentials
- **Email:** admin@pharma.com
- **Password:** password123
