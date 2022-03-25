const isObjectIdValid = require('mongoose').Types.ObjectId.isValid;
const jwt = require('jsonwebtoken');
const env = require('../../environment.json');
const Users = require('../../database/models/User');
const responseSender = require('../../helpers/response-sender');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const refreshHandlerPost = async (req, res) => {
    let userId = null;
    let currentProofOfRefresh = null;
    let isRefreshExpired = false;

    if (!req.body.refreshToken) {
        return responseSender(res, 401, 'Refresh failed!');
    }

    jwt.verify(
        req.body.refreshToken, env[env.mode]['jwtKey'],
        (err, decode) => {
            if (err) {
                isRefreshExpired = err.message === 'jwt expired';
                return;
            }
            userId = decode.userId || null;
            currentProofOfRefresh = decode.proofOfRefresh || null;
        }
    );

    if (
        !userId ||
        !isObjectIdValid(userId) ||
        !currentProofOfRefresh ||
        isRefreshExpired
    ) {
        return responseSender(res, 401, 'Refresh failed!');
    }


    const newProofOfRefresh = bcrypt.hashSync(Date.now().toString(), saltRounds);
    const user = await Users.findOneAndUpdate(
        {
            _id: userId,
            proofOfRefresh: currentProofOfRefresh
        },
        { proofOfRefresh: newProofOfRefresh }
    );

    if (!user) {
        return responseSender(res, 401, 'Refresh failed!');
    }

    const newAccessToken = jwt.sign(
        { userId },
        env[env.mode]['jwtKey'],
        { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
        {
            userId,
            proofOfRefresh: newProofOfRefresh
        },
        env[env.mode]['jwtKey'],
        { expiresIn: '1d' }
    );

    responseSender(res, 200, 'Refresh succeeded!', {
        token: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    });
};

module.exports = refreshHandlerPost;
