const jwt = require('jsonwebtoken');
const env = require('../../../environment.json');
const Users = require('../../../database/models/User');
const responseSender = require('../../../helpers/response-sender');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const signInHandlerPost = async (req, res) => {

    if (!req.body.email || !req.body.password) {
        return responseSender(res, 422, 'You\'ve missed something important...');
    }

    const proofOfRefresh = bcrypt.hashSync(Date.now().toString(), saltRounds);
    const user = await Users.findOneAndUpdate(
        { email: req.body.email },
        { proofOfRefresh }
    );

    if (!user) {
        return responseSender(res, 401, 'Authentication failed. User not found!');
    }

    // console.log(user, req.body.password);

    if (!user.comparePassword(String(req.body.password))) {
        return responseSender(res, 401, 'Authentication failed. Wrong password!');
    }

    const accessToken = jwt.sign(
        { userId: user._id },
        env[env.mode]['jwtKey'],
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign({
            userId: user._id,
            proofOfRefresh
        },
        env[env.mode]['jwtKey'],
        { expiresIn: '1d' }
    );

    responseSender(res, 200, 'Authentication succeeded!', {
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.photo,
            email: user.email
        },
        token: {
            accessToken,
            refreshToken
        }
    });
};

module.exports = signInHandlerPost;
