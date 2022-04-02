import Joi from 'joi';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers';

const schema = Joi.object().keys({ 
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(25).required(), 
}); 

export const signUpHandlerPost = async (req: Request, res: Response) => {
    const { body } = req;
    const { error } = schema.validate(body);

    if (error) {
        return responseSender(res, 422, error.message);
    }

    const user = new Users(body);
    const isUserExist = await Users.findOne({ email: body.email });

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
