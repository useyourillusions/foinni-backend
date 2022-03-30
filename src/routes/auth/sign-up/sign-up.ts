import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers/response-sender';

export const signUpHandlerPost = async (req: Request, res: Response) => {
    if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
    ) {
        return responseSender(res, 422, 'You\'ve missed something important...');
    }

    const user = new Users(req.body);
    const isUserExist = await Users.findOne({ email: req.body.email });

    if (isUserExist) {
        return responseSender(res, 409, 'Email is already taken!');
    }

    try {
        await user.save();
        responseSender(res, 200, 'User has been registered!');

    } catch (err: any) {
        responseSender(res, 500, err.message);
    }
};

