const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
    port: Number(process.env.PORT || 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    frontendOrigin: process.env.FRONTEND_ORIGIN || '*',
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
    commentMinIntervalMs: Number(process.env.COMMENT_MIN_INTERVAL_MS || 10000)
};

const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

requiredVars.forEach((name) => {
    if (!process.env[name]) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
});

module.exports = env;
