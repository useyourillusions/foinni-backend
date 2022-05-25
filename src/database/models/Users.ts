import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { createHash } from 'crypto';

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
        default: 'https://avatars.dicebear.com/api/bottts/default.svg'
    },
    refreshHashKey: {
        type: String,
        default: ''
    }
});

UsersSchema.pre('save', function(next) {
    const user = this;
    const hash = bcrypt.hashSync(user.password, saltRounds);
    const hashPhoto = createHash('sha256').update(user.email).digest('hex');

    user.password = hash;
    user.photo = `https://avatars.dicebear.com/api/bottts/${hashPhoto}.svg`
    next();
});

UsersSchema.methods.comparePassword = function(password: string) {
    return bcrypt.compareSync(password, this.password)
};

export const Users = mongoose.model('User', UsersSchema);
