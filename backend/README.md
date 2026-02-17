# Berita-Kita Backend (Phase 1)

Backend API untuk autentikasi admin dan manajemen artikel menggunakan **Node.js + Express + PostgreSQL + JWT**.

## Endpoint Utama

- `GET /api/v1/health` - health check
- `POST /api/v1/auth/register` - registrasi user admin
- `POST /api/v1/auth/login` - login dan mendapatkan JWT
- `GET /api/v1/auth/me` - profile user aktif (Bearer token)
- `GET /api/v1/articles` - list artikel (mendukung filter dan pagination)
- `GET /api/v1/articles/:idOrSlug` - detail artikel
- `POST /api/v1/articles` - tambah artikel (Bearer token)
- `PUT /api/v1/articles/:id` - update artikel (Bearer token)
- `DELETE /api/v1/articles/:id` - soft delete artikel (Bearer token)
- `GET /api/v1/comments?articleSlug=...&page=1&limit=10` - list komentar publik (pagination)
- `POST /api/v1/comments` - kirim komentar publik (default `pending`, perlu moderasi)
- `GET /api/v1/comments/moderation?status=pending&page=1&limit=20` - list komentar untuk moderasi (Bearer token)
- `PATCH /api/v1/comments/:id/status` - ubah status komentar (`pending|approved|rejected`, Bearer token)
- `DELETE /api/v1/comments/:id` - hapus komentar (Bearer token)

## Mobile API Hardening (Phase 4)

- **Versioning**: seluruh endpoint produksi berada di prefix `api/v1`
- **Rate limiting**: default `120 request / 15 menit / IP`
- **Pagination**: endpoint list artikel dan komentar sudah mendukung `page` + `limit`
- **Rate limit headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Comment sanitization**: input komentar dibersihkan dari tag HTML sebelum disimpan
- **Anti-spam komentar**: cooldown default `10 detik` per IP untuk submit komentar

## Setup

1. Masuk ke folder backend:

```bash
cd backend
```

2. Install dependency:

```bash
npm install
```

3. Salin env:

```bash
cp .env.example .env
```

4. Jalankan PostgreSQL (contoh Docker):

```bash
docker run --name berita-kita-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=berita_kita \
  -p 5432:5432 -d postgres:16
```

5. Inisialisasi schema dan seed:

```bash
psql postgresql://postgres:postgres@localhost:5432/berita_kita -f db/schema.sql
psql postgresql://postgres:postgres@localhost:5432/berita_kita -f db/seed.sql
```

6. Jalankan server:

```bash
npm run dev
```

Server aktif di `http://localhost:3000`.

### Konfigurasi Rate Limit

- `RATE_LIMIT_WINDOW_MS` (default `900000`)
- `RATE_LIMIT_MAX_REQUESTS` (default `120`)
- `COMMENT_MIN_INTERVAL_MS` (default `10000`)

## Kredensial Seed

- Username: `admin`
- Password: `admin123`

> Password pada seed sudah di-hash bcrypt.
