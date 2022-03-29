
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers/response-sender';

interface UserToken {
    userId: string;
    proofOfRefresh: string;
}

const isObjectIdValid = mongoose.Types.ObjectId.isValid;

const signOutHandlerPost = async (req: Request, res: Response) => {
    let userId = null;

    if (!req.body.refreshToken) {
        return responseSender(res, 401, 'Refresh failed!');
    }

    try {
        const decoded = jwt.verify(req.body.refreshToken, 'TOP_SECRET') as UserToken;

        userId = decoded.userId || null;
    } catch (err: any) {

    }

    if (!userId || !isObjectIdValid(userId)) {
        return responseSender(res, 401, 'Backend logout failed!');
    }

    const user = await Users.findOneAndUpdate(
        { _id: userId },
        { proofOfRefresh: '' },
    );

    if (!user) {
        return responseSender(res, 401, 'Backend logout failed!');
    }

    responseSender(res, 200, 'Logout succeeded!');
};

export { signOutHandlerPost };
