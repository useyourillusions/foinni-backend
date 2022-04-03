import Joi from 'joi';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers';

const schema = Joi.object().keys({ 
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    email: Joi.string().email(),
    password: Joi.string().min(5).max(25).required(),
}).min(2);

export const userDataHandlerPatch = async (req: Request, res: Response) => {
    const { body, userId } = req;
    const { error, value: { password, ...valuesForUpdate } } = schema.validate(body);

    if (error) {
        return responseSender(res, 422, error.message);
    } else {
        return res.status(200).json(valuesForUpdate);
    }

    const user = new Users(body);
    const isUpdated = await Users.findOneAndUpdate(
        { _id: userId },
        valuesForUpdate,
    );

    if (isUpdated) {
        return responseSender(res, 409, 'Email is already taken!');
    }

    try {
        await user.save();
        responseSender(res, 200, 'User has been registered!');

    } catch (err: any) {
        responseSender(res, 500, err.message);
    }
}
