import mongoose from 'mongoose';
import { Response, Request, NextFunction } from 'express';
import { responseSender } from '../helpers/response-sender';

export const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
    if (mongoose.connection.readyState !== 1) {
        return responseSender(res, 503, 'Service is temporarily unavailable...');
    }
    next();
};
