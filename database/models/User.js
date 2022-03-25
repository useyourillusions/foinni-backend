const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const validateEmail = email =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: [validateEmail],
    },
    password:  {
        type: String,
        required: true,
        trim: true
    },
    photo: {
        type: String,
        default: 'https://dummyimage.com/300x300/000/ff7800.png'
    },
    proofOfRefresh: {
        type: String,
        default: ''
    }
});

UserSchema.pre('save', function(next) {
    const user = this;
    const hash = bcrypt.hashSync(user.password, saltRounds);

    user.password = hash;
    next();
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
