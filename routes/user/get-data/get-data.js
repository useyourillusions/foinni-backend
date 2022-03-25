const responseSender = require('../../../helpers/response-sender');

const userDataHandlerGet = (req, res) =>
    responseSender(res, 200, 'Got it!', {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        photo: req.user.photo,
        email: req.user.email
    });

module.exports = userDataHandlerGet;
