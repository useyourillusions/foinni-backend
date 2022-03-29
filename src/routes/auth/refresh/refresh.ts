import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers/response-sender';

interface UserToken {
    userId: string;
    proofOfRefresh: string;
}

const saltRounds = 10;
const isObjectIdValid = mongoose.Types.ObjectId.isValid;

const refreshHandlerPost = async (req: Request, res: Response) => {
    let userId = null;
    let currentProofOfRefresh = null;
    let isRefreshExpired = false;

    if (!req.body.refreshToken) {
        return responseSender(res, 401, 'Refresh failed!');
    }

    try {
        const decoded = jwt.verify(req.body.refreshToken, 'TOP_SECRET') as UserToken;

        userId = decoded.userId || null;
        currentProofOfRefresh = decoded.proofOfRefresh || null;
    } catch (err: any) {
        isRefreshExpired = err.message === 'jwt expired';
    }

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
        'TOP_SECRET',
        { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
        {
            userId,
            proofOfRefresh: newProofOfRefresh
        },
        'TOP_SECRET',
        { expiresIn: '1d' }
    );

    responseSender(res, 200, 'Refresh succeeded!', {
        token: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    });
};

export { refreshHandlerPost };
