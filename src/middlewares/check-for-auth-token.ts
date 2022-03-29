import jwt from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';

const checkForAuthToken = async (req: Request, res: Response, next: NextFunction) => {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = jwt.verify(token, 'TOP_SECRET') as { userId: string; };
            req.userId = decoded.userId || null;

        } catch (err: any) {
            if (err.message === 'jwt expired') {
                req.isAccessJwtExpired = true;
            }
        }
    }

    next();
};

export { checkForAuthToken };
