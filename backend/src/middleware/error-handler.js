function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const status = error.status || 500;
    const message = error.message || 'Internal server error';

    return res.status(status).json({ message });
}

module.exports = {
    errorHandler
};
