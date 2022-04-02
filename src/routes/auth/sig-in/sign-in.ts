import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { Users } from '../../../database/models/Users';
import { responseSender } from '../../../helpers';

const schema = Joi.object().keys({ 
    email: Joi.string().email().required(),
    password: Joi.string().min(1).max(25).required(), 
    // password: Joi.string().min(5).max(25).required(), 
  }); 
const saltRounds = 10;

export const signInHandlerPost = async (req: Request, res: Response) => {
    const { body } = req;
    const { error } = schema.validate(body);

    if (error) {
        return responseSender(res, 422, error.message);
    }

    const refreshHashKey = bcrypt.hashSync(Date.now().toString(), saltRounds);
    const user = await Users.findOneAndUpdate(
        { email: req.body.email },
        { refreshHashKey }
    );

    if (!user) {
        return responseSender(res, 401, 'Authentication failed. User not found!');
    }

    if (!user.comparePassword(req.body.password)) {
        return responseSender(res, 401, 'Authentication failed. Wrong password!');
    }

    const accessToken = jwt.sign(
        { userId: user._id },
        'TOP_SECRET',
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign({
            userId: user._id,
            refreshHashKey
        },
        'TOP_SECRET',
        { expiresIn: '1d' }
    );

    responseSender(res, 200, 'Authentication succeeded!', {
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            photo: user.photo,
            email: user.email
        },
        token: {
            accessToken,
            refreshToken
        }
    });
};
