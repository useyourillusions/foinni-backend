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
  date_added: {
    type: Date,
    required: true,
  }
});

export const Message = mongoose.model('Message', MessageSchema);