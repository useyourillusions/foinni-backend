import mongoose from 'mongoose';
import { responseSender } from '../helpers/response-sender';
import { User } from '../database/models/Users';

const isObjectIdValid = mongoose.Types.ObjectId.isValid;

const loginRequired = async (req, res, next) => {
    if (!req.userId || !isObjectIdValid(req.userId)) {
        if (req.isAccessJwtExpired) {
            return responseSender(res, 401, 'Authentication failed!', { needRefresh: true });
        }

        return responseSender(res, 401, 'Authentication failed!')
    }

    try {
        const user = await User.findOne({_id: req.userId});

        if (!user) {
            return responseSender(res, 422, 'User doesn\'t exist!');
        }

        req['user'] = user.toJSON();

    } catch (err) {
        return responseSender(res, 500, err.message);
    }

    next();
};

export { loginRequired };
