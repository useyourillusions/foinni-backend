import { Response, Request } from 'express';
import { responseSender } from '../../../helpers/response-sender';

export const userDataHandlerGet = (req: Request, res: Response) =>
    responseSender(res, 200, 'Got it!', {
        firstName: req.user?.firstName,
        lastName: req.user?.lastName,
        photo: req.user?.photo,
        email: req.user?.email
    });