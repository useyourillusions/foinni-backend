import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Users',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        photo: {
            type: String,
            required: true,
            trim: true,
        },
  },
});

MessageSchema.pre('save', function(next) {
    this.author.id = new mongoose.Types.ObjectId(this.author.id);
    next();
});

// Duplicate the ID field.
// MessageSchema.virtual('id').get(function(){
    // @ts-ignore
    // return this._id.toHexString();
// });

// Ensure virtual fields are serialised.
// MessageSchema.set('toJSON', {
    // virtuals: true
// });

export const Message = mongoose.model('Message', MessageSchema);