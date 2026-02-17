const express = require('express');
const db = require('../config/db');
const env = require('../config/env');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const commentPostBuckets = new Map();

function normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripTags(value) {
    return String(value || '').replace(/<[^>]*>/g, '');
}

function sanitizeText(value) {
    return normalizeWhitespace(stripTags(value));
}

function isValidEmail(value) {
    if (!value) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function canPostComment(ipAddress) {
    const now = Date.now();
    const key = ipAddress || 'unknown';
    const lastPostedAt = commentPostBuckets.get(key) || 0;
    const elapsed = now - lastPostedAt;

    if (elapsed < env.commentMinIntervalMs) {
        return {
            allowed: false,
            retryAfterMs: env.commentMinIntervalMs - elapsed
        };
    }

    commentPostBuckets.set(key, now);
    return { allowed: true, retryAfterMs: 0 };
}

router.get('/', async (req, res, next) => {
    try {
        const articleSlug = String(req.query.articleSlug || '').trim();
        if (!articleSlug) {
            return res.status(400).json({ message: 'articleSlug wajib diisi' });
        }

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const offset = (page - 1) * limit;

        const countResult = await db.query(
            `SELECT COUNT(*)::INT AS total
             FROM comments
             WHERE article_slug = $1
               AND status = 'approved'
               AND deleted_at IS NULL`,
            [articleSlug]
        );

        const rows = await db.query(
            `SELECT id, article_slug, author_name, content, created_at
             FROM comments
             WHERE article_slug = $1
               AND status = 'approved'
               AND deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [articleSlug, limit, offset]
        );

        return res.json({
            data: rows.rows,
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total
            }
        });
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const articleSlug = normalizeWhitespace(req.body.articleSlug || '').toLowerCase();
        const authorName = sanitizeText(req.body.authorName || '');
        const authorEmail = normalizeWhitespace(req.body.authorEmail || '').toLowerCase();
        const content = sanitizeText(req.body.content || '');
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        if (!articleSlug || !authorName || !content) {
            return res.status(400).json({ message: 'articleSlug, authorName, content wajib diisi' });
        }

        if (!/^[a-z0-9-]{3,220}$/.test(articleSlug)) {
            return res.status(400).json({ message: 'articleSlug tidak valid' });
        }

        if (authorName.length < 2 || authorName.length > 80) {
            return res.status(400).json({ message: 'Nama harus 2-80 karakter' });
        }

        if (!isValidEmail(authorEmail)) {
            return res.status(400).json({ message: 'Format email tidak valid' });
        }

        if (content.length < 3) {
            return res.status(400).json({ message: 'Komentar minimal 3 karakter' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ message: 'Komentar maksimal 1000 karakter' });
        }

        const postEligibility = canPostComment(ipAddress);
        if (!postEligibility.allowed) {
            return res.status(429).json({
                message: 'Terlalu cepat mengirim komentar. Coba lagi sebentar.',
                retryAfterSeconds: Math.ceil(postEligibility.retryAfterMs / 1000)
            });
        }

        const insertResult = await db.query(
            `INSERT INTO comments (article_slug, author_name, author_email, content, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING id, article_slug, author_name, content, status, created_at`,
            [articleSlug, authorName, authorEmail || null, content]
        );

        return res.status(201).json({
            data: insertResult.rows[0],
            message: 'Komentar diterima dan menunggu moderasi admin.'
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/moderation', requireAuth, async (req, res, next) => {
    try {
        const allowedStatuses = ['pending', 'approved', 'rejected'];
        const status = String(req.query.status || 'pending').toLowerCase();
        const selectedStatus = allowedStatuses.includes(status) ? status : 'pending';

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const countResult = await db.query(
            `SELECT COUNT(*)::INT AS total
             FROM comments
             WHERE status = $1
               AND deleted_at IS NULL`,
            [selectedStatus]
        );

        const rows = await db.query(
            `SELECT id, article_slug, author_name, author_email, content, status, created_at, updated_at
             FROM comments
             WHERE status = $1
               AND deleted_at IS NULL
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [selectedStatus, limit, offset]
        );

        return res.json({
            data: rows.rows,
            pagination: {
                page,
                limit,
                total: countResult.rows[0].total
            }
        });
    } catch (error) {
        return next(error);
    }
});

router.patch('/:id/status', requireAuth, async (req, res, next) => {
    try {
        const commentId = Number(req.params.id);
        const nextStatus = String(req.body.status || '').toLowerCase();

        if (!Number.isInteger(commentId)) {
            return res.status(400).json({ message: 'ID komentar tidak valid' });
        }

        if (!['approved', 'rejected', 'pending'].includes(nextStatus)) {
            return res.status(400).json({ message: 'Status komentar tidak valid' });
        }

        const result = await db.query(
            `UPDATE comments
             SET status = $1,
                 updated_at = NOW()
             WHERE id = $2
               AND deleted_at IS NULL
             RETURNING id, article_slug, author_name, content, status, created_at, updated_at`,
            [nextStatus, commentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Komentar tidak ditemukan' });
        }

        return res.json({ data: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const commentId = Number(req.params.id);
        if (!Number.isInteger(commentId)) {
            return res.status(400).json({ message: 'ID komentar tidak valid' });
        }

        const result = await db.query(
            `UPDATE comments
             SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING id`,
            [commentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Komentar tidak ditemukan' });
        }

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
