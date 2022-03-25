const isObjectIdValid = require('mongoose').Types.ObjectId.isValid;
const jwt = require('jsonwebtoken');
const env = require('../../environment.json');
const Users = require('../../database/models/User');
const responseSender = require('../../helpers/response-sender');

const logoutHandlerPost = async (req, res) => {

    let userId = null;
    let proofOfRefresh = false;

    if (!req.body.refreshToken) {
        return responseSender(res, 401, 'Refresh failed!');
    }

    jwt.verify(
        req.body.refreshToken, env[env.mode]['jwtKey'],
        (err, decode) => {
            if (err) {
                return;
            }
            userId = decode.userId || null;
            proofOfRefresh = decode.proofOfRefresh || null;
        }
    );

    if (
        !userId ||
        !isObjectIdValid(userId) ||
        !proofOfRefresh
    ) {
        return responseSender(res, 401, 'Backend logout failed!');
    }

    const user = await Users.findOneAndUpdate(
        {
            _id: userId,
            proofOfRefresh
        },
        { proofOfRefresh: '' }
    );

    if (!user) {
        return responseSender(res, 401, 'Backend logout failed!');
    }

    responseSender(res, 200, 'Logout succeeded!');
};

module.exports = logoutHandlerPost;
