const mongoose = require('mongoose');
const responseSender = require('./response-sender');

const checkDbConnection = (req, res, next) => {

    if (mongoose.connection.readyState !== 1) {
        return responseSender(res, 503, 'Service is temporarily unavailable...');
    }
    next();
};

module.exports = checkDbConnection;
