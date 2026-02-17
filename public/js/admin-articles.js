// Article Management Script
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.BERITAKITA_API_BASE_URL || 'http://localhost:3000/api/v1';
    const articleForm = document.getElementById('articleForm');
    const featuredImageInput = document.getElementById('featured-image');
    const imagePreview = document.getElementById('image-preview');
    const articleList = document.getElementById('articleList');
    const tableBody = document.querySelector('.data-table tbody');

    let editingArticleId = null;
    let optimizedImageDataUrl = null;

    window.__bkClearOptimizedImage = function() {
        optimizedImageDataUrl = null;
    };

    const MAX_IMAGE_WIDTH = 1280;
    const IMAGE_QUALITY = 0.82;

    function initRichTextEditor() {
        if (!window.tinymce || !document.getElementById('content')) {
            return;
        }

        if (window.tinymce.get('content')) {
            return;
        }

        window.tinymce.init({
            selector: '#content',
            height: 380,
            menubar: false,
            plugins: 'lists link image table code autoresize',
            toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link table | removeformat | code',
            branding: false,
            promotion: false
        });
    }

    function getEditorContent() {
        const editor = window.tinymce && window.tinymce.get('content');
        if (editor) {
            return editor.getContent();
        }

        const textarea = document.getElementById('content');
        return textarea ? textarea.value : '';
    }

    function setEditorContent(value) {
        const editor = window.tinymce && window.tinymce.get('content');
        if (editor) {
            editor.setContent(value || '');
            return;
        }

        const textarea = document.getElementById('content');
        if (textarea) {
            textarea.value = value || '';
        }
    }

    function isRichTextEmpty(html) {
        return !String(html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
    }

    async function optimizeImageFile(file) {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = objectUrl;
            });

            const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
            const targetWidth = Math.max(1, Math.round(img.width * scale));
            const targetHeight = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            const webpData = canvas.toDataURL('image/webp', IMAGE_QUALITY);
            if (webpData && webpData.startsWith('data:image/webp')) {
                return webpData;
            }

            return canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    function getAuthToken() {
        try {
            const authRaw = localStorage.getItem('bkAuth') || sessionStorage.getItem('bkAuth');
            if (!authRaw) {
                return null;
            }

            const auth = JSON.parse(authRaw);
            return auth.token || null;
        } catch (error) {
            return null;
        }
    }

    async function fetchArticles() {
        const response = await fetch(`${API_BASE_URL}/articles?limit=50`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal memuat artikel');
        }

        return result.data || [];
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    function capitalize(value) {
        if (!value) {
            return '';
        }
        return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    }

    function renderTable(articles) {
        if (!tableBody) {
            return;
        }

        if (!articles.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px;">Belum ada artikel.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = articles.map((article) => {
            const badgeClassMap = {
                nasional: 'blue',
                ekonomi: 'green',
                teknologi: 'purple',
                olahraga: 'orange',
                hiburan: 'red'
            };

            const badgeClass = badgeClassMap[article.category] || 'blue';
            const safeTitle = article.title || '-';
            const safeAuthor = article.author || '-';
            const safeCategory = capitalize(article.category || '-');
            const safeStatus = article.status || 'draft';

            return `
                <tr data-id="${article.id}">
                    <td><input type="checkbox" class="row-select"></td>
                    <td>
                        <div class="article-title-cell">
                            <img src="https://via.placeholder.com/60x40" alt="Thumbnail">
                            <span>${safeTitle}</span>
                        </div>
                    </td>
                    <td><span class="badge-cat ${badgeClass}">${safeCategory}</span></td>
                    <td>${safeAuthor}</td>
                    <td>${formatDate(article.publish_date || article.created_at)}</td>
                    <td>-</td>
                    <td><span class="status ${safeStatus}">${capitalize(safeStatus)}</span></td>
                    <td class="action-buttons">
                        <button class="btn-icon action-edit" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon action-delete" title="Delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');

        bindTableActions();
    }

    async function loadArticles() {
        try {
            const articles = await fetchArticles();
            renderTable(articles);
            filterArticles();
        } catch (error) {
            showErrorMessage(error.message || 'Gagal memuat daftar artikel');
        }
    }

    function bindTableActions() {
        const deleteButtons = document.querySelectorAll('.action-delete');
        deleteButtons.forEach((btn) => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();

                const row = this.closest('tr');
                const articleId = row ? row.dataset.id : null;
                if (!articleId) {
                    return;
                }

                const isConfirmed = window.showConfirmModal
                    ? await window.showConfirmModal('Apakah Anda yakin ingin menghapus artikel ini?', {
                        confirmText: 'Hapus',
                        cancelText: 'Batal',
                        danger: true
                    })
                    : window.confirm('Apakah Anda yakin ingin menghapus artikel ini?');

                if (!isConfirmed) {
                    return;
                }

                const token = getAuthToken();
                if (!token) {
                    showErrorMessage('Silakan login ulang');
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        const result = await response.json();
                        throw new Error(result.message || 'Gagal menghapus artikel');
                    }

                    showSuccessMessage('Artikel berhasil dihapus');
                    loadArticles();
                } catch (error) {
                    showErrorMessage(error.message || 'Terjadi kesalahan saat menghapus');
                }
            });
        });

        const editButtons = document.querySelectorAll('.action-edit');
        editButtons.forEach((btn) => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();

                const row = this.closest('tr');
                const articleId = row ? row.dataset.id : null;
                if (!articleId) {
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.message || 'Gagal mengambil data artikel');
                    }

                    const article = result.data;
                    editingArticleId = article.id;

                    document.getElementById('title').value = article.title || '';
                    document.getElementById('category').value = article.category || '';
                    document.getElementById('author').value = article.author || '';
                    document.getElementById('publish-date').value = article.publish_date
                        ? new Date(article.publish_date).toISOString().slice(0, 16)
                        : '';
                    document.getElementById('status').value = article.status || 'draft';
                    document.getElementById('excerpt').value = article.excerpt || '';
                    setEditorContent(article.content || '');
                    document.getElementById('tags').value = Array.isArray(article.tags) ? article.tags.join(', ') : '';

                    optimizedImageDataUrl = article.featured_image_url || null;

                    if (imagePreview) {
                        imagePreview.innerHTML = article.featured_image_url
                            ? `<img src="${article.featured_image_url}" alt="Preview" style="max-width: 300px; border-radius: 8px;">`
                            : '';
                    }

                    showForm();
                } catch (error) {
                    showErrorMessage(error.message || 'Gagal memuat data artikel');
                }
            });
        });
    }
    
    // Form submission
    if (articleForm) {
        articleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            data.content = getEditorContent();
            
            // Validate required fields
            if (!data.title || !data.category || !data.author || isRichTextEmpty(data.content)) {
                showErrorMessage('Mohon lengkapi semua field yang wajib diisi');
                return;
            }

            const token = getAuthToken();
            if (!token) {
                showErrorMessage('Sesi login tidak ditemukan, silakan login ulang');
                return;
            }

            const imageEl = imagePreview ? imagePreview.querySelector('img') : null;
            const payload = {
                title: data.title,
                category: data.category,
                author: data.author,
                content: data.content,
                excerpt: data.excerpt || null,
                status: data.status || 'draft',
                publishDate: data['publish-date'] || null,
                featured: data.featured === 'on',
                allowComments: data['allow-comments'] === 'on',
                tags: data.tags || '',
                featuredImageUrl: optimizedImageDataUrl || (imageEl ? imageEl.src : null)
            };

            const endpoint = editingArticleId
                ? `${API_BASE_URL}/articles/${editingArticleId}`
                : `${API_BASE_URL}/articles`;

            const method = editingArticleId ? 'PUT' : 'POST';

            try {
                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal menyimpan artikel');
                }

                showSuccessMessage(editingArticleId ? 'Artikel berhasil diperbarui!' : 'Artikel berhasil disimpan!');
                editingArticleId = null;
                optimizedImageDataUrl = null;
                this.reset();
                setEditorContent('');
                imagePreview.innerHTML = '';
                await loadArticles();
                showList();
            } catch (error) {
                showErrorMessage(error.message || 'Terjadi kesalahan saat menyimpan');
            }
        });
    }

    // Image upload preview
    if (featuredImageInput) {
        featuredImageInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    optimizedImageDataUrl = await optimizeImageFile(file);
                    const originalSizeKB = Math.round(file.size / 1024);
                    const optimizedSizeKB = Math.round((optimizedImageDataUrl.length * 3 / 4) / 1024);

                    imagePreview.innerHTML = `
                        <img src="${optimizedImageDataUrl}" alt="Preview" style="max-width: 300px; border-radius: 8px;">
                        <p style="margin-top: 8px; color: #666; font-size: 12px;">
                            Optimized: ${originalSizeKB}KB → ${optimizedSizeKB}KB
                        </p>
                        <button type="button" onclick="removeImage()" style="margin-top: 10px; padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-times"></i> Hapus Gambar
                        </button>
                    `;
                } catch (error) {
                    optimizedImageDataUrl = null;
                    showErrorMessage('Gagal memproses gambar');
                }
            }
        });
    }

    // Table row selection
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-select');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // Filter functionality
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const searchArticles = document.getElementById('search-articles');
    
    if (filterCategory) {
        filterCategory.addEventListener('change', filterArticles);
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', filterArticles);
    }
    
    if (searchArticles) {
        searchArticles.addEventListener('input', filterArticles);
    }

    initRichTextEditor();

    loadArticles();

    if (articleList && articleList.style.display !== 'none') {
        filterArticles();
    }
});

// Toggle between form and list view
function showForm() {
    const titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.focus();
    }
    document.querySelector('.article-form').parentElement.style.display = 'block';
    document.getElementById('articleList').style.display = 'none';
}

function showList() {
    document.querySelector('.article-form').parentElement.style.display = 'none';
    document.getElementById('articleList').style.display = 'block';
    filterArticles();
}

// Preview article
function previewArticle() {
    const title = document.getElementById('title').value;
    const contentEditor = window.tinymce && window.tinymce.get('content');
    const content = contentEditor ? contentEditor.getContent() : document.getElementById('content').value;
    const category = document.getElementById('category').value;
    
    if (!title || !content) {
        showErrorMessage('Mohon isi judul dan konten artikel terlebih dahulu');
        return;
    }
    
    // Open preview in new window (simplified)
    const previewWindow = window.open('', 'Preview', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview: ${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #0066cc; }
                .category { display: inline-block; background: #0066cc; color: white; padding: 5px 15px; border-radius: 15px; font-size: 12px; margin-bottom: 20px; }
                .content { line-height: 1.8; white-space: pre-wrap; }
            </style>
        </head>
        <body>
            <span class="category">${category}</span>
            <h1>${title}</h1>
            <div class="content">${content}</div>
        </body>
        </html>
    `);
}

// Remove uploaded image
function removeImage() {
    document.getElementById('featured-image').value = '';
    document.getElementById('image-preview').innerHTML = '';
    if (typeof window.__bkClearOptimizedImage === 'function') {
        window.__bkClearOptimizedImage();
    }
}

// Filter articles function
function filterArticles() {
    const categoryFilter = document.getElementById('filter-category').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value.toLowerCase();
    const searchQuery = document.getElementById('search-articles').value.toLowerCase();
    
    const rows = document.querySelectorAll('.data-table tbody tr');
    
    rows.forEach(row => {
        const category = row.querySelector('.badge-cat').textContent.toLowerCase();
        const status = row.querySelector('.status').textContent.toLowerCase();
        const title = row.querySelector('.article-title-cell span').textContent.toLowerCase();
        
        const categoryMatch = !categoryFilter || category === categoryFilter;
        const statusMatch = !statusFilter || status === statusFilter;
        const searchMatch = !searchQuery || title.includes(searchQuery);
        
        if (categoryMatch && statusMatch && searchMatch) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
