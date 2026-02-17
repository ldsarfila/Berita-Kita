INSERT INTO users (username, email, password_hash, role)
VALUES (
    'admin',
    'admin@beritakita.local',
    '$2a$10$kPrJ6SYDjdlj62G65zbFiu0RVmd6rMkeK/9sbTUHoXndf9g8QZ/Ai',
    'admin'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO articles (
    slug,
    title,
    excerpt,
    content,
    category,
    author,
    status,
    publish_date,
    featured,
    allow_comments,
    tags,
    created_by
)
VALUES (
    'selamat-datang-di-beritakita',
    'Selamat Datang di BeritaKita',
    'Artikel awal untuk memastikan API dan dashboard admin berjalan.',
    'Ini adalah konten artikel contoh. Anda dapat mengubah, menghapus, atau membuat artikel baru dari admin panel.',
    'nasional',
    'Admin Berita',
    'published',
    NOW(),
    TRUE,
    TRUE,
    ARRAY['nasional','pengumuman'],
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
)
ON CONFLICT (slug) DO NOTHING;
