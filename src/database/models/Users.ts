import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const saltRounds = 10;

const validateEmail = (email: string) =>
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);

const UsersSchema = new mongoose.Schema({
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
    refreshHashKey: {
        type: String,
        default: ''
    }
});

UsersSchema.pre('save', function(next) {
    const user = this;
    const hash = bcrypt.hashSync(user.password, saltRounds);

    user.password = hash;
    next();
});

UsersSchema.methods.comparePassword = function(password: string) {
    return bcrypt.compareSync(password, this.password)
};

export const Users = mongoose.model('User', UsersSchema);
