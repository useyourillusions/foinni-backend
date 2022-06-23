import Joi from 'joi';
import { Response, Request } from 'express';
import { Users, Message } from '../../../database/models';
import { responseSender } from '../../../helpers';

const schema = Joi.object().keys({ 
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    email: Joi.string().email(),
    password: Joi.string().min(5).max(25).required(),
}).min(2);

export const userDataHandlerPatch = async (req: Request, res: Response) => {
    const { body, userId } = req;
    const { error, value: { password, ...fieldsToUpdate } } = schema.validate(body);

    if (error) {
        return responseSender(res, 422, error.message);
    }

    const user = await Users.findById(userId);
    const isPasswordsMatch = user.comparePassword(body.password);

    if (!isPasswordsMatch) {
        return responseSender(res, 401, 'Password doesn\'t match!');
    }

    // TODO: Add try/catches
    const updatedUser = await Users
        .findByIdAndUpdate(userId, fieldsToUpdate, { returnOriginal: false })
        .select(['-_id', '-__v', '-password', '-refreshHashKey']);
    await Message.updateMany({ 'author.id': userId }, { 'author.name': `${updatedUser.firstName} ${updatedUser.lastName}`});

    responseSender(res, 200, `${Object.keys(fieldsToUpdate).join(', ')} updated`, updatedUser);
}
