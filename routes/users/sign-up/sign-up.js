const User = require('../../../database/models/User');
const responseSender = require('../../../helpers/response-sender');

const signUpHandlerPost = async (req, res) => {
    console.log(req.body);

    if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.email ||
        !req.body.password
    ) {
        return responseSender(res, 422, 'You\'ve missed something important...');
    }

    const user = new User(req.body);
    const isUserExist = await User.findOne({ email: req.body.email });

    if (isUserExist) {
        return responseSender(res, 409, 'Email is already taken!');
    }

    try {
        await user.save();
        responseSender(res, 200, 'User has been registered!');

    } catch (err) {
        responseSender(res, 500, err.message);
    }
};

module.exports = signUpHandlerPost;
