# Berita-Kita

BeritaKita adalah portal berita terpercaya Indonesia yang menyajikan informasi terkini seputar nasional, ekonomi, teknologi, olahraga, hiburan, dan gaya hidup.

## ✅ Status Implementasi

- Homepage berita dan admin panel sudah terintegrasi dengan backend API.
- Backend `api/v1` (auth, artikel, komentar) + PostgreSQL sudah siap dipakai.
- Moderasi komentar admin sudah berjalan (approve/reject/pending/delete).
- UX admin sudah konsisten dengan toast notification dan modal konfirmasi custom.

## 🎨 Fitur Desain

- **Clean Layout** - Desain modern dengan warna dominan biru dan putih
- **Top Navigation** - Menu navigasi dengan kategori berita lengkap
- **Hero Section** - Area headline besar untuk berita utama
- **Grid Layout** - Tampilan card artikel dengan thumbnail
- **Breaking News Ticker** - Bar berita terkini yang berjalan
- **Sidebar** - Widget berita populer dan area iklan
- **Responsive Design** - Mobile-friendly untuk semua perangkat

## 📁 Struktur Folder

```
Berita-Kita/
├── index.html              # Homepage utama
├── admin/                  # Admin panel
│   ├── login.html         # Halaman login admin
│   ├── dashboard.html     # Dashboard admin
│   ├── articles.html      # Manajemen artikel
│   └── comments.html      # Moderasi komentar
├── public/                # Assets publik
│   ├── css/
│   │   ├── style.css      # Stylesheet homepage
│   │   └── admin.css      # Stylesheet admin panel
│   ├── js/
│   │   ├── main.js        # JavaScript homepage
│   │   ├── admin.js       # JavaScript admin panel
│   │   ├── admin-login.js # Login functionality
│   │   ├── admin-articles.js # Article management
│   │   └── admin-comments.js # Comment moderation
│   └── images/            # Gambar dan media
└── components/            # Komponen reusable (future)
```

## 🎨 Skema Warna

- **Primary Blue**: `#0066cc` - Warna utama untuk header, button, dan aksen
- **Dark Blue**: `#004080` - Hover states dan navigasi
- **Light Blue**: `#e6f2ff` - Background accent
- **White**: `#ffffff` - Background utama
- **Gray**: `#f5f5f5` - Background section dan card
- **Red Accent**: `#dc3545` - Breaking news dan highlights

## 🚀 Cara Menggunakan

### Menjalankan Website

1. Clone repository ini:
   ```bash
   git clone https://github.com/ldsarfila/Berita-Kita.git
   cd Berita-Kita
   ```

2. Buka `index.html` di browser Anda:
   ```bash
   # Dengan Python
   python -m http.server 8000

   # Dengan PHP
   php -S localhost:8000

   # Dengan Node.js (http-server)
   npx http-server
   ```

3. Akses website di `http://localhost:8000`

### Menjalankan Backend API (Phase 1)

1. Masuk folder backend dan install dependency:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

2. Jalankan PostgreSQL, lalu inisialisasi database:
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/berita_kita -f db/schema.sql
   psql postgresql://postgres:postgres@localhost:5432/berita_kita -f db/seed.sql
   ```

3. Start API server:
   ```bash
   npm run dev
   ```

4. API tersedia di `http://localhost:3000/api/v1`

### Mengakses Admin Panel

1. Buka `http://localhost:8000/admin/login.html`
2. Login dengan kredensial seed backend: `admin` / `admin123`
3. Kelola artikel, kategori, dan konten dari dashboard

## 📱 Responsive Breakpoints

- **Desktop**: > 992px
- **Tablet**: 768px - 992px
- **Mobile**: < 768px

## 🔧 Komponen Utama

### Homepage (`index.html`)

1. **Breaking News Bar** - Ticker berita terkini
2. **Header** - Logo, search, dan social links
3. **Navigation** - Menu kategori berita
4. **Hero Section** - Berita utama dengan gambar besar
5. **News Grid** - Grid artikel dengan thumbnail
6. **Category Sections** - Section per kategori
7. **Sidebar** - Berita populer, newsletter, tags
8. **Footer** - Links dan informasi kontak

### Admin Panel

#### Login (`admin/login.html`)
- Form login dengan username dan password
- Remember me functionality
- Forgot password link

#### Dashboard (`admin/dashboard.html`)
- Statistics cards (Total Artikel, Views, Users, Comments)
- Recent articles table
- Quick actions menu
- Popular categories
- Activity log

#### Article Management (`admin/articles.html`)
- Form tambah/edit artikel lengkap
- Image upload dengan preview
- Rich text editor (TinyMCE)
- Article listing dengan filter
- Search functionality
- Bulk actions

## 🎯 Fitur JavaScript

### Homepage
- Mobile menu toggle
- Search functionality
- Newsletter subscription
- Smooth scrolling
- Back to top button
- Lazy loading images
- Sticky header dengan hide/show on scroll
- Social media sharing (Facebook, X, WhatsApp, copy link)
- Comment system terintegrasi API
- Analytics integration (GA4 ready)

### Admin Panel
- Sidebar responsive toggle
- Form validation
- Image upload preview + optimasi otomatis (resize + WebP)
- Table filtering dan searching
- Pagination
- CRUD operations untuk artikel
- Moderasi komentar (approve/reject/pending/delete)
- Toast notification konsisten di seluruh halaman admin
- Modal konfirmasi custom untuk aksi penting (logout/hapus)
- Statistics animation

## 🖼️ Placeholder Images

Tambahkan gambar berita Anda ke folder `public/images/`:
- `hero-image.jpg` - Gambar headline utama
- `news-1.jpg` hingga `news-9.jpg` - Thumbnail artikel
- `tech-1.jpg` hingga `tech-3.jpg` - Artikel teknologi

Ukuran rekomendasi:
- Hero image: 800x450px
- News thumbnails: 400x200px
- Article images: 600x400px

## 🔐 Sistem Admin

### Fitur Admin Panel:
- **Dashboard**: Overview statistik dan aktivitas
- **Artikel**: Create, Read, Update, Delete artikel
- **Kategori**: Manajemen kategori berita
- **Pengguna**: Manajemen user dan roles
- **Komentar**: Moderasi komentar pembaca
- **Media**: Upload dan manajemen gambar
- **Settings**: Konfigurasi website
- **UX Konsisten**: Toast & modal konfirmasi custom tanpa popup browser bawaan

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Customisasi

### Mengubah Warna
Edit variabel CSS di `public/css/style.css` dan `public/css/admin.css`:
```css
:root {
    --primary-blue: #0066cc;  /* Ubah warna utama */
    --dark-blue: #004080;
    --red-accent: #dc3545;
    /* ... */
}
```

### Menambah Kategori
Edit file `index.html` dan `admin/articles.html` untuk menambah kategori baru di navigasi dan form.

### Mengubah Layout
Semua layout menggunakan CSS Grid dan Flexbox untuk kemudahan customisasi.

## 🚀 Pengembangan Selanjutnya

- [x] Integrasi backend (Node.js/PHP/Python)
- [x] Database untuk penyimpanan artikel
- [x] User authentication yang sesungguhnya
- [x] API untuk mobile app
- [x] Rich text editor (TinyMCE/CKEditor)
- [x] Image optimization
- [x] SEO optimization
- [x] Analytics integration
- [x] Comment system
- [x] Social media sharing

### Konfigurasi Analytics (GA4)

Di `index.html`, set nilai:

```html
window.BERITAKITA_GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

Jika kosong, script analytics tidak akan dijalankan (aman untuk mode development).

## 🧱 Catatan Teknis

### Arsitektur Singkat
- Frontend: HTML5, CSS3, JavaScript ES6+ (vanilla)
- Admin UI: halaman terpisah dengan komponen shared (`admin.js`, `admin.css`)
- Backend: Node.js + Express + PostgreSQL + JWT (`backend/`)
- API utama: prefix `api/v1` untuk auth, artikel, komentar, dan moderasi

### Keamanan Dasar yang Sudah Dipakai
- Validasi input dan sanitasi komentar
- JWT untuk endpoint admin/protected
- Rate limiting API + anti-spam komentar
- Escape HTML pada rendering konten user-generated

### Checklist Deploy Singkat
- Set nilai `.env` production (`JWT_SECRET`, `DATABASE_URL`, CORS origin)
- Aktifkan HTTPS pada domain produksi
- Jalankan migrasi schema + seed sesuai kebutuhan environment
- Konfigurasi logging/monitoring dan backup database berkala
- Verifikasi `robots.txt`, `sitemap.xml`, dan metadata SEO

## 📄 License

MIT License - bebas digunakan untuk proyek pribadi maupun komersial.

## 👥 Kontributor

- Dikembangkan oleh Tim BeritaKita
- Desain terinspirasi dari detik.com

## 📞 Kontak

- Website: [beritakita.com](https://beritakita.com)
- Email: info@beritakita.com
- Twitter: [@BeritaKita](https://twitter.com/BeritaKita)

---

**BeritaKita** - Portal Berita Indonesia Terpercaya 🇮🇩

