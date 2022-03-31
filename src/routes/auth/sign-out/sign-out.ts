import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers';

const isObjectIdValid = mongoose.Types.ObjectId.isValid;

export const signOutHandlerPost = async (req: Request, res: Response) => {
    if (!req.userId || !isObjectIdValid(req.userId)) {
        return responseSender(res, 401, 'Backend sign-out failed!');
    }

    const user = await Users.findOneAndUpdate(
        { _id: req.userId },
        { refreshHashKey: '' },
    );

    if (!user) {
        return responseSender(res, 401, 'Backend sign-out failed!');
    }

    responseSender(res, 200, 'Backend sign-out succeeded!');
};

