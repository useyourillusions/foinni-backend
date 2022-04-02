import { ErrorRequestHandler, Response, Request, NextFunction } from 'express';

export const uncoughtErrorHandler: ErrorRequestHandler = async (err, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    res.status(500).send(err?.message || 'Something has benn broken!');
};
