import { ErrorRequestHandler, Response, Request, NextFunction } from 'express';

export const uncaughtErrorHandler: ErrorRequestHandler = async (err, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    res.status(500).send(err?.message || 'Something has been broken!');
};
