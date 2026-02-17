// Article Management Script
document.addEventListener('DOMContentLoaded', function() {
    const articleForm = document.getElementById('articleForm');
    const featuredImageInput = document.getElementById('featured-image');
    const imagePreview = document.getElementById('image-preview');
    
    // Form submission
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Article data:', data);
            
            // Validate required fields
            if (!data.title || !data.category || !data.author || !data.content) {
                showErrorMessage('Mohon lengkapi semua field yang wajib diisi');
                return;
            }
            
            // Simulate saving article
            showSuccessMessage('Artikel berhasil disimpan!');
            
            // Reset form after successful submission
            setTimeout(() => {
                this.reset();
                imagePreview.innerHTML = '';
            }, 1000);
        });
    }

    // Image upload preview
    if (featuredImageInput) {
        featuredImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview" style="max-width: 300px; border-radius: 8px;">
                        <button type="button" onclick="removeImage()" style="margin-top: 10px; padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-times"></i> Hapus Gambar
                        </button>
                    `;
                };
                reader.readAsDataURL(file);
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

    // Delete button handlers
    const deleteButtons = document.querySelectorAll('.btn-icon [class*="fa-trash"]');
    deleteButtons.forEach(btn => {
        btn.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirmDelete('artikel ini')) {
                const row = this.closest('tr');
                row.remove();
                showSuccessMessage('Artikel berhasil dihapus');
            }
        });
    });

    // Edit button handlers
    const editButtons = document.querySelectorAll('.btn-icon [class*="fa-edit"]');
    editButtons.forEach(btn => {
        btn.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            showForm();
            // Load article data into form (demo)
            const row = this.closest('tr');
            const title = row.querySelector('.article-title-cell span').textContent;
            document.getElementById('title').value = title;
        });
    });
});

// Toggle between form and list view
function showForm() {
    document.querySelector('.article-form').parentElement.style.display = 'block';
    document.getElementById('articleList').style.display = 'none';
}

function showList() {
    document.querySelector('.article-form').parentElement.style.display = 'none';
    document.getElementById('articleList').style.display = 'block';
}

// Preview article
function previewArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
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

// Show error message
function showErrorMessage(message) {
    alert('Error: ' + message);
}

// Show success message  
function showSuccessMessage(message) {
    alert('Success: ' + message);
}

// Confirm delete
function confirmDelete(itemName) {
    return confirm(`Apakah Anda yakin ingin menghapus ${itemName}?`);
}
