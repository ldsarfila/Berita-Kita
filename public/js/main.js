// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.BERITAKITA_API_BASE_URL || 'http://localhost:3000/api/v1';
    const GA_MEASUREMENT_ID = String(window.BERITAKITA_GA_MEASUREMENT_ID || '').trim();
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const searchableSelectors = '.hero-main, .hero-card, .news-card, .list-news-card, .popular-news-item';

    function getToastContainer() {
        let container = document.getElementById('site-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'site-toast-container';
            container.className = 'site-toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function showToast(message, type = 'info', durationMs = 2600) {
        const container = getToastContainer();
        const toast = document.createElement('div');
        toast.className = `site-toast ${type}`;
        toast.textContent = String(message || '');

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        const hide = () => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement === container) {
                    container.removeChild(toast);
                }
            }, 220);
        };

        const timeoutId = setTimeout(hide, durationMs);
        toast.addEventListener('click', () => {
            clearTimeout(timeoutId);
            hide();
        });
    }

    function initializeAnalytics() {
        if (!GA_MEASUREMENT_ID) {
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    function showShareStatus(message) {
        showToast(message, 'info');
    }

    function initializeSocialSharing() {
        const shareContainers = document.querySelectorAll('.share-actions');
        if (!shareContainers.length) {
            return;
        }

        shareContainers.forEach((container) => {
            container.addEventListener('click', async (event) => {
                const button = event.target.closest('[data-share-platform]');
                if (!button) {
                    return;
                }

                const platform = button.dataset.sharePlatform;
                const title = container.dataset.shareTitle || document.title;
                const shareUrl = container.dataset.shareUrl || window.location.href;

                const encodedTitle = encodeURIComponent(title);
                const encodedUrl = encodeURIComponent(shareUrl);
                const text = encodeURIComponent(`${title} - ${shareUrl}`);

                const shareLinks = {
                    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
                    whatsapp: `https://wa.me/?text=${text}`
                };

                if (platform === 'copy') {
                    try {
                        await navigator.clipboard.writeText(shareUrl);
                        showShareStatus('Link berhasil disalin');
                    } catch (error) {
                        showShareStatus('Gagal menyalin link');
                    }
                    return;
                }

                if (shareLinks[platform]) {
                    window.open(shareLinks[platform], '_blank', 'noopener,noreferrer,width=640,height=640');
                }
            });
        });
    }

    function formatCommentDate(value) {
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

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderComments(listElement, comments) {
        if (!comments.length) {
            listElement.innerHTML = '<p>Belum ada komentar. Jadilah yang pertama!</p>';
            return;
        }

        listElement.innerHTML = comments.map((comment) => {
            const safeAuthor = escapeHtml(comment.author_name);
            const safeContent = escapeHtml(comment.content);

            return `
                <article class="comment-item">
                    <div class="comment-item-header">
                        <strong>${safeAuthor}</strong>
                        <span>${formatCommentDate(comment.created_at)}</span>
                    </div>
                    <p>${safeContent}</p>
                </article>
            `;
        }).join('');
    }

    async function initializeComments() {
        const section = document.querySelector('.comments-section');
        const form = document.getElementById('commentForm');
        const listElement = document.getElementById('commentList');
        const statusElement = document.getElementById('commentStatus');

        if (!section || !form || !listElement || !statusElement) {
            return;
        }

        const articleSlug = section.dataset.articleSlug;

        async function loadComments() {
            try {
                statusElement.textContent = 'Memuat komentar...';

                const response = await fetch(`${API_BASE_URL}/comments?articleSlug=${encodeURIComponent(articleSlug)}`);
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Gagal memuat komentar');
                }

                renderComments(listElement, result.data || []);
                statusElement.textContent = '';
            } catch (error) {
                statusElement.textContent = 'Komentar belum tersedia saat ini.';
                listElement.innerHTML = '';
            }
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = String(document.getElementById('commentName').value || '').trim();
            const email = String(document.getElementById('commentEmail').value || '').trim();
            const content = String(document.getElementById('commentContent').value || '').trim();

            if (!name || !content) {
                statusElement.textContent = 'Nama dan komentar wajib diisi.';
                return;
            }

            try {
                statusElement.textContent = 'Mengirim komentar...';

                const response = await fetch(`${API_BASE_URL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        articleSlug,
                        authorName: name,
                        authorEmail: email,
                        content
                    })
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Gagal mengirim komentar');
                }

                showToast(result.message || 'Komentar berhasil dikirim dan menunggu moderasi admin.', 'success');
                form.reset();
                await loadComments();
            } catch (error) {
                statusElement.textContent = error.message || 'Terjadi kesalahan saat mengirim komentar.';
                showToast(error.message || 'Terjadi kesalahan saat mengirim komentar.', 'error', 3200);
            }
        });

        await loadComments();
    }

    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        img.decoding = 'async';

        if (index === 0) {
            img.loading = 'eager';
            img.fetchPriority = 'high';
        } else {
            img.loading = 'lazy';
            img.fetchPriority = 'low';
        }
    });
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!menuToggle || !navMenu) {
            return;
        }

        const isClickInsideNav = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Search functionality
    const searchForm = document.querySelector('.search-box');
    if (searchForm) {
        const searchInput = searchForm.querySelector('input');

        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();

            if (!query) {
                document.querySelectorAll(searchableSelectors).forEach(item => {
                    item.style.display = '';
                });
                return;
            }

            let firstMatch = null;

            document.querySelectorAll(searchableSelectors).forEach(item => {
                const text = item.textContent.toLowerCase();
                const isMatch = text.includes(query.toLowerCase());

                item.style.display = isMatch ? '' : 'none';

                if (isMatch && !firstMatch) {
                    firstMatch = item;
                }
            });

            if (firstMatch) {
                firstMatch.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    }

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                showToast('Terima kasih! Email ' + email + ' telah berlangganan newsletter.', 'success');
                emailInput.value = '';
                // Implement actual newsletter subscription here
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add view counter animation
    const viewCounters = document.querySelectorAll('.news-meta [class*="fa-eye"]');
    viewCounters.forEach(counter => {
        counter.parentElement.style.cursor = 'default';
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Back to top button
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.type = 'button';
    backToTop.setAttribute('aria-label', 'Kembali ke atas');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add click handlers for news cards
    document.querySelectorAll('.news-card, .hero-card, .list-news-card, .popular-news-item').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                // Navigate to news detail page
                console.log('Navigate to news detail');
                // window.location.href = 'news-detail.html?id=123';
            }
        });
    });

    // Sticky header effect
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (!header) {
            return;
        }

        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scroll Down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scroll Up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });

    initializeSocialSharing();
    initializeComments();
    initializeAnalytics();
});

// Page load animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    setTimeout(function() {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});
