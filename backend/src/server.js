const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

async function bootstrap() {
    try {
        await db.query('SELECT 1');
        app.listen(env.port, () => {
            console.log(`Berita-Kita API running on http://localhost:${env.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

bootstrap();
