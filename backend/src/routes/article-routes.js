const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { toSlug } = require('../utils/slug');

const router = express.Router();

function parseTags(tags) {
    if (Array.isArray(tags)) {
        return tags.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof tags === 'string') {
        return tags.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [];
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = excludeId
            ? `SELECT id FROM articles WHERE slug = $1 AND id <> $2 LIMIT 1`
            : `SELECT id FROM articles WHERE slug = $1 LIMIT 1`;

        const params = excludeId ? [slug, excludeId] : [slug];
        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return slug;
        }

        counter += 1;
        slug = `${baseSlug}-${counter}`;
    }
}

router.get('/', async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const offset = (page - 1) * limit;

        const filters = ['deleted_at IS NULL'];
        const params = [];

        if (req.query.status) {
            params.push(req.query.status);
            filters.push(`status = $${params.length}`);
        }

        if (req.query.category) {
            params.push(req.query.category);
            filters.push(`category = $${params.length}`);
        }

        if (req.query.search) {
            params.push(`%${req.query.search}%`);
            filters.push(`(title ILIKE $${params.length} OR content ILIKE $${params.length})`);
        }

        const whereSql = filters.join(' AND ');

        params.push(limit);
        params.push(offset);

        const rowsResult = await db.query(
            `SELECT id, slug, title, excerpt, category, author, status, publish_date, featured, allow_comments, tags, featured_image_url, created_at, updated_at
             FROM articles
             WHERE ${whereSql}
             ORDER BY created_at DESC
             LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        const countParams = params.slice(0, params.length - 2);
        const countResult = await db.query(
            `SELECT COUNT(*)::INT AS total FROM articles WHERE ${whereSql}`,
            countParams
        );

        return res.json({
            data: rowsResult.rows,
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

router.get('/:identifier', async (req, res, next) => {
    try {
        const identifier = req.params.identifier;
        const isNumeric = /^\d+$/.test(identifier);

        const result = await db.query(
            `SELECT id, slug, title, excerpt, content, category, author, status, publish_date, featured, allow_comments, tags, featured_image_url, created_at, updated_at
             FROM articles
             WHERE deleted_at IS NULL AND ${isNumeric ? 'id = $1' : 'slug = $1'}
             LIMIT 1`,
            [isNumeric ? Number(identifier) : identifier]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        return res.json({ data: result.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const {
            title,
            excerpt,
            content,
            category,
            author,
            status = 'draft',
            publishDate,
            featured = false,
            allowComments = true,
            tags,
            featuredImageUrl
        } = req.body;

        if (!title || !content || !category || !author) {
            return res.status(400).json({ message: 'title, content, category, author wajib diisi' });
        }

        const baseSlug = toSlug(title);
        const slug = await ensureUniqueSlug(baseSlug);
        const parsedTags = parseTags(tags);

        const insertResult = await db.query(
            `INSERT INTO articles (slug, title, excerpt, content, category, author, status, publish_date, featured, allow_comments, tags, featured_image_url, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING id, slug, title, excerpt, content, category, author, status, publish_date, featured, allow_comments, tags, featured_image_url, created_at, updated_at`,
            [slug, title, excerpt || null, content, category, author, status, publishDate || null, Boolean(featured), Boolean(allowComments), parsedTags, featuredImageUrl || null, req.user.id]
        );

        return res.status(201).json({ data: insertResult.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const articleId = Number(req.params.id);
        if (!Number.isInteger(articleId)) {
            return res.status(400).json({ message: 'ID artikel tidak valid' });
        }

        const existingResult = await db.query(
            `SELECT id, slug, title FROM articles WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
            [articleId]
        );

        const existing = existingResult.rows[0];
        if (!existing) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        const {
            title = existing.title,
            excerpt = null,
            content,
            category,
            author,
            status,
            publishDate,
            featured,
            allowComments,
            tags,
            featuredImageUrl
        } = req.body;

        if (!title || !content || !category || !author || !status) {
            return res.status(400).json({ message: 'title, content, category, author, status wajib diisi' });
        }

        const nextSlugBase = toSlug(title);
        const slug = await ensureUniqueSlug(nextSlugBase, articleId);
        const parsedTags = parseTags(tags);

        const updatedResult = await db.query(
            `UPDATE articles
             SET slug = $1,
                 title = $2,
                 excerpt = $3,
                 content = $4,
                 category = $5,
                 author = $6,
                 status = $7,
                 publish_date = $8,
                 featured = $9,
                 allow_comments = $10,
                 tags = $11,
                 featured_image_url = $12,
                 updated_at = NOW()
             WHERE id = $13
             RETURNING id, slug, title, excerpt, content, category, author, status, publish_date, featured, allow_comments, tags, featured_image_url, created_at, updated_at`,
            [slug, title, excerpt, content, category, author, status, publishDate || null, Boolean(featured), Boolean(allowComments), parsedTags, featuredImageUrl || null, articleId]
        );

        return res.json({ data: updatedResult.rows[0] });
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const articleId = Number(req.params.id);
        if (!Number.isInteger(articleId)) {
            return res.status(400).json({ message: 'ID artikel tidak valid' });
        }

        const result = await db.query(
            `UPDATE articles
             SET deleted_at = NOW(), updated_at = NOW()
             WHERE id = $1 AND deleted_at IS NULL
             RETURNING id`,
            [articleId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan' });
        }

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
