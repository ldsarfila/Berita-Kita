document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.BERITAKITA_API_BASE_URL || 'http://localhost:3000/api/v1';

    const tableBody = document.getElementById('comments-table-body');
    const statusElement = document.getElementById('comments-status');
    const statusFilter = document.getElementById('comment-status-filter');
    const limitSelect = document.getElementById('comment-limit');
    const searchInput = document.getElementById('comment-search');
    const prevButton = document.getElementById('comments-prev');
    const nextButton = document.getElementById('comments-next');
    const pageInfo = document.getElementById('comments-page-info');

    let currentPage = 1;
    let currentLimit = Number(limitSelect ? limitSelect.value : 20);
    let totalItems = 0;
    let currentStatus = statusFilter ? statusFilter.value : 'pending';
    let lastData = [];

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

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderRows(rows) {
        if (!tableBody) {
            return;
        }

        if (!rows.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px;">Tidak ada komentar.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = rows.map((comment) => {
            const statusClass = comment.status === 'approved'
                ? 'published'
                : comment.status === 'rejected'
                    ? 'draft'
                    : 'scheduled';

            const approveButton = comment.status !== 'approved'
                ? `<button class="btn-icon action-approve" data-id="${comment.id}" title="Approve"><i class="fas fa-check"></i></button>`
                : '';

            const rejectButton = comment.status !== 'rejected'
                ? `<button class="btn-icon action-reject" data-id="${comment.id}" title="Reject"><i class="fas fa-times"></i></button>`
                : '';

            const resetButton = comment.status !== 'pending'
                ? `<button class="btn-icon action-pending" data-id="${comment.id}" title="Set Pending"><i class="fas fa-undo"></i></button>`
                : '';

            const deleteButton = `<button class="btn-icon action-delete" data-id="${comment.id}" title="Hapus"><i class="fas fa-trash"></i></button>`;

            return `
                <tr>
                    <td>${comment.id}</td>
                    <td><span class="comment-article">${escapeHtml(comment.article_slug)}</span></td>
                    <td>${escapeHtml(comment.author_name)}</td>
                    <td>${escapeHtml(comment.author_email || '-')}</td>
                    <td><div class="comment-content-cell">${escapeHtml(comment.content)}</div></td>
                    <td><span class="status ${statusClass}">${escapeHtml(comment.status)}</span></td>
                    <td>${formatDate(comment.created_at)}</td>
                    <td class="action-buttons">${approveButton}${rejectButton}${resetButton}${deleteButton}</td>
                </tr>
            `;
        }).join('');

        bindActions();
    }

    async function updateCommentStatus(commentId, nextStatus) {
        const token = getAuthToken();
        if (!token) {
            showErrorMessage('Sesi login tidak ditemukan, silakan login ulang.');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: nextStatus })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengubah status komentar');
        }

        return result.data;
    }

    async function deleteComment(commentId) {
        const token = getAuthToken();
        if (!token) {
            showErrorMessage('Sesi login tidak ditemukan, silakan login ulang.');
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let message = 'Gagal menghapus komentar';
            try {
                const result = await response.json();
                message = result.message || message;
            } catch (error) {
                message = 'Gagal menghapus komentar';
            }
            throw new Error(message);
        }
    }

    function bindActions() {
        document.querySelectorAll('.action-approve').forEach((button) => {
            button.addEventListener('click', async function() {
                const commentId = this.dataset.id;
                try {
                    await updateCommentStatus(commentId, 'approved');
                    await loadComments();
                    showSuccessMessage('Komentar berhasil di-approve.');
                } catch (error) {
                    showErrorMessage(error.message || 'Terjadi kesalahan saat approve komentar');
                }
            });
        });

        document.querySelectorAll('.action-reject').forEach((button) => {
            button.addEventListener('click', async function() {
                const commentId = this.dataset.id;
                try {
                    await updateCommentStatus(commentId, 'rejected');
                    await loadComments();
                    showSuccessMessage('Komentar berhasil di-reject.');
                } catch (error) {
                    showErrorMessage(error.message || 'Terjadi kesalahan saat reject komentar');
                }
            });
        });

        document.querySelectorAll('.action-pending').forEach((button) => {
            button.addEventListener('click', async function() {
                const commentId = this.dataset.id;
                try {
                    await updateCommentStatus(commentId, 'pending');
                    await loadComments();
                    showSuccessMessage('Komentar dipindahkan ke pending.');
                } catch (error) {
                    showErrorMessage(error.message || 'Terjadi kesalahan saat mengubah komentar ke pending');
                }
            });
        });

        document.querySelectorAll('.action-delete').forEach((button) => {
            button.addEventListener('click', async function() {
                const commentId = this.dataset.id;
                const isConfirmed = window.showConfirmModal
                    ? await window.showConfirmModal('Hapus komentar ini? Tindakan tidak bisa dibatalkan.', {
                        confirmText: 'Hapus',
                        cancelText: 'Batal',
                        danger: true
                    })
                    : window.confirm('Hapus komentar ini? Tindakan tidak bisa dibatalkan.');
                if (!isConfirmed) {
                    return;
                }

                try {
                    await deleteComment(commentId);
                    await loadComments();
                    showSuccessMessage('Komentar berhasil dihapus.');
                } catch (error) {
                    showErrorMessage(error.message || 'Terjadi kesalahan saat menghapus komentar');
                }
            });
        });
    }

    function applyClientSearch(rows) {
        const query = String(searchInput ? searchInput.value : '').trim().toLowerCase();
        if (!query) {
            return rows;
        }

        return rows.filter((row) => {
            const text = `${row.article_slug || ''} ${row.author_name || ''} ${row.author_email || ''} ${row.content || ''}`.toLowerCase();
            return text.includes(query);
        });
    }

    function updatePaginationUI() {
        const totalPages = Math.max(1, Math.ceil(totalItems / currentLimit));
        if (pageInfo) {
            pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages} (${totalItems} komentar)`;
        }

        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }

        if (nextButton) {
            nextButton.disabled = currentPage >= totalPages;
        }
    }

    async function loadComments() {
        const token = getAuthToken();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        if (statusElement) {
            statusElement.textContent = 'Memuat komentar...';
        }

        try {
            const params = new URLSearchParams({
                status: currentStatus,
                page: String(currentPage),
                limit: String(currentLimit)
            });

            const response = await fetch(`${API_BASE_URL}/comments/moderation?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Gagal memuat komentar moderasi');
            }

            lastData = result.data || [];
            totalItems = Number(result.pagination && result.pagination.total) || 0;

            const searchedRows = applyClientSearch(lastData);
            renderRows(searchedRows);
            updatePaginationUI();

            if (statusElement) {
                statusElement.textContent = '';
            }
        } catch (error) {
            if (statusElement) {
                statusElement.textContent = error.message || 'Gagal memuat komentar';
            }
            renderRows([]);
            totalItems = 0;
            updatePaginationUI();
        }
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', async function() {
            currentStatus = this.value;
            currentPage = 1;
            await loadComments();
        });
    }

    if (limitSelect) {
        limitSelect.addEventListener('change', async function() {
            currentLimit = Number(this.value) || 20;
            currentPage = 1;
            await loadComments();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderRows(applyClientSearch(lastData));
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', async function() {
            if (currentPage > 1) {
                currentPage -= 1;
                await loadComments();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', async function() {
            const totalPages = Math.max(1, Math.ceil(totalItems / currentLimit));
            if (currentPage < totalPages) {
                currentPage += 1;
                await loadComments();
            }
        });
    }

    loadComments();
});
