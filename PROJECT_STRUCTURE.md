# Berita-Kita Project Structure Documentation

## Overview
BeritaKita adalah portal berita modern dengan desain clean yang terinspirasi dari detik.com. Proyek ini menggunakan HTML5, CSS3, dan JavaScript vanilla tanpa framework untuk kemudahan deployment dan maintenance.

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Grid, Flexbox, Custom Properties
- **JavaScript ES6+** - Vanilla JS, no framework
- **Font Awesome 6.4.0** - Icons

### Future Backend (Rekomendasi)
- **Node.js + Express** atau **PHP** untuk REST API
- **MySQL/PostgreSQL** untuk database
- **JWT** untuk authentication

## File Structure Detail

```
Berita-Kita/
│
├── index.html                 # Homepage utama portal berita
│   ├── Breaking News Ticker   # Bar berita terkini
│   ├── Header                 # Logo, search, social links
│   ├── Navigation             # Menu kategori
│   ├── Hero Section           # Berita headline
│   ├── News Grid              # Grid artikel
│   ├── Category Sections      # Section per kategori
│   ├── Sidebar                # Widget populer, ads
│   └── Footer                 # Links, kontak
│
├── admin/                     # Admin Panel
│   │
│   ├── login.html            # Login page
│   │   ├── Login form
│   │   ├── Remember me
│   │   └── Forgot password
│   │
│   ├── dashboard.html        # Admin dashboard
│   │   ├── Statistics cards
│   │   ├── Recent articles
│   │   ├── Quick actions
│   │   ├── Popular categories
│   │   └── Activity log
│   │
│   └── articles.html         # Article management
│       ├── Article form (CRUD)
│       ├── Article listing
│       ├── Filters & search
│       └── Pagination
│
├── public/                   # Public assets
│   │
│   ├── css/
│   │   ├── style.css        # Homepage styles
│   │   │   ├── Global variables
│   │   │   ├── Breaking news bar
│   │   │   ├── Header & navigation
│   │   │   ├── Hero section
│   │   │   ├── News cards
│   │   │   ├── Sidebar widgets
│   │   │   ├── Footer
│   │   │   └── Responsive breakpoints
│   │   │
│   │   └── admin.css        # Admin panel styles
│   │       ├── Login page
│   │       ├── Sidebar navigation
│   │       ├── Top bar
│   │       ├── Statistics cards
│   │       ├── Data tables
│   │       ├── Forms
│   │       └── Responsive layout
│   │
│   ├── js/
│   │   ├── main.js          # Homepage functionality
│   │   │   ├── Mobile menu
│   │   │   ├── Search
│   │   │   ├── Newsletter
│   │   │   ├── Smooth scroll
│   │   │   ├── Back to top
│   │   │   └── Lazy loading
│   │   │
│   │   ├── admin.js         # Admin common functionality
│   │   │   ├── Sidebar toggle
│   │   │   ├── Authentication check
│   │   │   ├── Logout
│   │   │   └── Stats animation
│   │   │
│   │   ├── admin-login.js   # Login functionality
│   │   │   ├── Form validation
│   │   │   ├── Authentication
│   │   │   └── Session management
│   │   │
│   │   └── admin-articles.js # Article management
│   │       ├── Form submission
│   │       ├── Image upload
│   │       ├── Table filtering
│   │       ├── CRUD operations
│   │       └── Preview functionality
│   │
│   └── images/              # Media assets
│       ├── .gitkeep
│       └── (Place your images here)
│
└── components/              # Reusable components (future)
    └── (Component files)

```

## Component Breakdown

### Homepage Components

#### 1. Breaking News Bar
- **File**: `index.html` (lines 12-25)
- **Styling**: `public/css/style.css` (Breaking News Bar section)
- **Features**:
  - Marquee effect untuk berita berjalan
  - Background merah untuk urgency
  - Responsive text

#### 2. Header
- **File**: `index.html` (lines 27-55)
- **Styling**: `public/css/style.css` (Header section)
- **Features**:
  - Logo branding
  - Search box dengan icon
  - Social media links
  - Sticky positioning

#### 3. Navigation
- **File**: `index.html` (lines 57-73)
- **Styling**: `public/css/style.css` (Navigation section)
- **JavaScript**: `public/js/main.js` (Mobile menu toggle)
- **Features**:
  - Horizontal menu (desktop)
  - Hamburger menu (mobile)
  - Active state indication
  - 9 kategori berita

#### 4. Hero Section
- **File**: `index.html` (lines 81-123)
- **Styling**: `public/css/style.css` (Hero Section)
- **Features**:
  - Large headline dengan gambar
  - Gradient overlay untuk readability
  - Side cards untuk berita tambahan
  - Category badges
  - Meta information (time, author)

#### 5. News Grid
- **File**: `index.html` (lines 125-203)
- **Styling**: `public/css/style.css` (News Grid)
- **Features**:
  - 3-column grid (desktop)
  - Article cards dengan thumbnail
  - Hover effects
  - View counts
  - Category badges

#### 6. Sidebar
- **File**: `index.html` (lines 249-329)
- **Styling**: `public/css/style.css` (Sidebar)
- **Features**:
  - Popular news widget
  - Advertisement spaces
  - Newsletter subscription
  - Tag cloud
  - Responsive stacking

#### 7. Footer
- **File**: `index.html` (lines 335-378)
- **Styling**: `public/css/style.css` (Footer section)
- **Features**:
  - 4-column layout
  - About, categories, info, contact
  - Social links
  - Copyright information

### Admin Panel Components

#### 1. Login Page
- **Purpose**: Autentikasi admin
- **Features**:
  - Username/password input
  - Remember me checkbox
  - Forgot password link
  - Gradient background

#### 2. Dashboard
- **Purpose**: Overview dan monitoring
- **Sections**:
  - **Statistics Cards**: Total artikel, views, users, comments
  - **Recent Articles Table**: 5 artikel terbaru
  - **Quick Actions**: Shortcuts ke fitur utama
  - **Popular Categories**: Kategori dengan artikel terbanyak
  - **Activity Log**: Log aktivitas admin

#### 3. Article Management
- **Purpose**: CRUD artikel
- **Features**:
  - Form lengkap dengan:
    - Title, category, author
    - Publish date, status
    - Featured image upload
    - Excerpt textarea
    - Content editor
    - Tags input
    - Checkboxes (featured, allow comments)
  - Article listing dengan:
    - Thumbnail preview
    - Filters (category, status)
    - Search box
    - Pagination
    - Bulk actions

## Responsive Design Strategy

### Desktop (> 992px)
- Full navigation menu
- 3-column news grid
- 2-column content + sidebar layout
- 4-column footer

### Tablet (768px - 992px)
- Full navigation menu
- 2-column news grid
- Single column (sidebar below content)
- 2-column footer

### Mobile (< 768px)
- Hamburger menu
- Single column layout
- Stacked sidebar widgets
- Single column footer
- Optimized touch targets

## Color Palette

```css
/* Primary Colors */
--primary-blue: #0066cc;    /* Brand color, buttons, links */
--dark-blue: #004080;       /* Hover states, dark accents */
--light-blue: #e6f2ff;      /* Light backgrounds, highlights */

/* Neutral Colors */
--white: #ffffff;           /* Main background, cards */
--gray-bg: #f5f5f5;         /* Section backgrounds */
--text-dark: #333333;       /* Primary text */
--text-light: #666666;      /* Secondary text */

/* Accent Colors */
--red-accent: #dc3545;      /* Breaking news, alerts */
--green: #28a745;           /* Success states */
--orange: #ff9800;          /* Warning states */
--purple: #9c27b0;          /* Tech category */
```

## Typography

- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Base Font Size**: 16px
- **Line Height**: 1.6

### Hierarchy
- **H1 (Logo)**: 32px, bold
- **H2 (Sections)**: 24px, bold
- **H3 (Cards)**: 16-18px, medium
- **Body**: 14-15px, regular
- **Meta**: 12-13px, regular

## JavaScript Functionality

### Homepage (main.js)
1. **Mobile Menu**: Toggle navigation on small screens
2. **Search**: Handle search queries
3. **Newsletter**: Form submission
4. **Smooth Scroll**: Anchor link scrolling
5. **Back to Top**: Show/hide button based on scroll
6. **Lazy Loading**: Optimize image loading
7. **Sticky Header**: Hide/show on scroll

### Admin Panel (admin.js)
1. **Sidebar Toggle**: Mobile sidebar control
2. **Authentication**: Check login state
3. **Logout**: Clear session and redirect
4. **Stats Animation**: Animate number counters
5. **Search**: Global search functionality

### Article Management (admin-articles.js)
1. **Form Validation**: Check required fields
2. **Image Upload**: Preview before save
3. **Table Filtering**: Filter by category/status
4. **Search**: Search articles by title
5. **CRUD Operations**: Create, read, update, delete
6. **Preview**: Open article preview

## Integration Guide

### Adding Backend

1. **Create API endpoints**:
   ```
   GET    /api/articles        - List articles
   POST   /api/articles        - Create article
   GET    /api/articles/:id    - Get article
   PUT    /api/articles/:id    - Update article
   DELETE /api/articles/:id    - Delete article
   ```

2. **Update JavaScript** to call APIs instead of localStorage

3. **Add authentication** middleware

4. **Setup database** schema for articles, users, categories

### Database Schema (Suggested)

```sql
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100),
    role ENUM('admin', 'editor', 'author'),
    created_at TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50),
    slug VARCHAR(50) UNIQUE,
    description TEXT
);

-- Articles table
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    content TEXT,
    excerpt VARCHAR(500),
    featured_image VARCHAR(255),
    category_id INT,
    author_id INT,
    status ENUM('draft', 'published', 'scheduled'),
    views INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Tags table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE
);

-- Article-Tags relationship
CREATE TABLE article_tags (
    article_id INT,
    tag_id INT,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT,
    user_name VARCHAR(100),
    email VARCHAR(100),
    content TEXT,
    status ENUM('pending', 'approved', 'spam'),
    created_at TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);
```

## Performance Optimization

1. **Image Optimization**:
   - Use WebP format with fallback
   - Lazy loading implementation
   - Responsive images with srcset

2. **CSS Optimization**:
   - Minify CSS for production
   - Critical CSS inline
   - Load non-critical CSS async

3. **JavaScript Optimization**:
   - Minify JS for production
   - Defer non-critical scripts
   - Use CDN for libraries

4. **Caching Strategy**:
   - Browser caching headers
   - Service worker for offline
   - CDN for static assets

## Security Considerations

1. **Input Validation**: Sanitize all user inputs
2. **XSS Prevention**: Escape HTML in user content
3. **CSRF Protection**: Use tokens for forms
4. **SQL Injection**: Use prepared statements
5. **Authentication**: Implement secure password hashing
6. **HTTPS**: Force SSL/TLS
7. **Content Security Policy**: Implement CSP headers

## Deployment Checklist

- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Setup proper caching headers
- [ ] Configure SSL certificate
- [ ] Setup database backups
- [ ] Configure error logging
- [ ] Setup monitoring (uptime, performance)
- [ ] Test all functionality
- [ ] Mobile responsiveness check
- [ ] Cross-browser testing
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Analytics setup

## Maintenance

- Regular content updates
- Security patches
- Performance monitoring
- Backup verification
- User feedback collection
- A/B testing improvements

---

Created: February 2026
Last Updated: February 2026
Version: 1.0.0
