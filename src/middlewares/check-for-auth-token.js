import jwt from 'jsonwebtoken';
const env = require('../../environment.json');

const checkForAuthToken = async (req, res, next) => {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, env[env.mode]['jwtKey'], (err, decode) => {
            if (err) {
                if (err.message === 'jwt expired') {
                    req.isAccessJwtExpired = true;
                }
                return;
            }
            req.userId = decode.userId || null;
        });
    }

    next();
};

export { checkForAuthToken };
