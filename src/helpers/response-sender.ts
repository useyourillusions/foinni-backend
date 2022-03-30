import { Response } from 'express';

export const responseSender = (
    res: Response,
    code: number,
    message: string,
    content: unknown = null
) => {
    const objToSend = {
        code,
        message,
        content,
    };

    res.status(code).json(objToSend);
};
