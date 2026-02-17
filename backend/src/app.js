const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const healthRoutes = require('./routes/health-routes');
const authRoutes = require('./routes/auth-routes');
const articleRoutes = require('./routes/article-routes');
const commentRoutes = require('./routes/comment-routes');
const { createRateLimiter } = require('./middleware/rate-limit');
const { errorHandler } = require('./middleware/error-handler');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin === '*' ? true : env.frontendOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const apiRateLimiter = createRateLimiter({
    windowMs: env.rateLimitWindowMs,
    maxRequests: env.rateLimitMaxRequests
});

app.use('/api/v1', apiRateLimiter);

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/comments', commentRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route tidak ditemukan' });
});

app.use(errorHandler);

module.exports = app;
