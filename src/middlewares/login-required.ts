import mongoose from 'mongoose';
import { Response, Request, NextFunction } from 'express';
import { responseSender } from '../helpers/response-sender';
import { Users } from '../database/models/Users';

const isObjectIdValid = mongoose.Types.ObjectId.isValid;

export const loginRequired = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId || !isObjectIdValid(req.userId)) {
        if (req.isAccessJwtExpired) {
            return responseSender(res, 401, 'Authentication failed!', { needRefresh: true });
        }

        return responseSender(res, 401, 'Authentication failed!')
    }

    try {
        const user = await Users.findOne({_id: req.userId});

        if (!user) {
            return responseSender(res, 422, 'User doesn\'t exist!');
        }

        req['user'] = user.toJSON();

    } catch (err: any) {
        return responseSender(res, 500, err.message);
    }

    next();
};

