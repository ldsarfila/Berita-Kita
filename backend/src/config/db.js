const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    connectionString: env.databaseUrl
});

async function query(text, params = []) {
    return pool.query(text, params);
}

async function getClient() {
    return pool.connect();
}

module.exports = {
    query,
    getClient,
    pool
};
