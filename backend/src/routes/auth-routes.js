const express = require('express');
const db = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi' });
        }

        const passwordHash = await hashPassword(password);

        const insertResult = await db.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, role, created_at`,
            [username, email || null, passwordHash]
        );

        const user = insertResult.rows[0];
        const accessToken = signAccessToken({ id: user.id, username: user.username, role: user.role });

        return res.status(201).json({ user, accessToken });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Username atau email sudah terdaftar' });
        }

        return next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi' });
        }

        const result = await db.query(
            `SELECT id, username, email, role, password_hash
             FROM users
             WHERE username = $1
             LIMIT 1`,
            [username]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const accessToken = signAccessToken({ id: user.id, username: user.username, role: user.role });

        return res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            accessToken
        });
    } catch (error) {
        return next(error);
    }
});

router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT id, username, email, role, created_at
             FROM users
             WHERE id = $1
             LIMIT 1`,
            [req.user.id]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        return res.json({ user });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
