const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

module.exports = {
    hashPassword,
    verifyPassword
};
