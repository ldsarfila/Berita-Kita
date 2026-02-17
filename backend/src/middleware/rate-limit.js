const buckets = new Map();

function cleanupOldBuckets(now, windowMs) {
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now - windowMs) {
            buckets.delete(key);
        }
    }
}

function createRateLimiter({ windowMs, maxRequests }) {
    return function rateLimiter(req, res, next) {
        const now = Date.now();
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const key = `${ip}:${req.baseUrl || '/api/v1'}`;

        if (buckets.size > 10000) {
            cleanupOldBuckets(now, windowMs);
        }

        let bucket = buckets.get(key);

        if (!bucket || bucket.resetAt <= now) {
            bucket = {
                count: 0,
                resetAt: now + windowMs
            };
            buckets.set(key, bucket);
        }

        bucket.count += 1;

        const remaining = Math.max(0, maxRequests - bucket.count);
        const resetInSeconds = Math.ceil((bucket.resetAt - now) / 1000);

        res.setHeader('X-RateLimit-Limit', String(maxRequests));
        res.setHeader('X-RateLimit-Remaining', String(remaining));
        res.setHeader('X-RateLimit-Reset', String(resetInSeconds));

        if (bucket.count > maxRequests) {
            return res.status(429).json({
                message: 'Terlalu banyak request, coba lagi beberapa saat.',
                retryAfterSeconds: resetInSeconds
            });
        }

        return next();
    };
}

module.exports = {
    createRateLimiter
};
