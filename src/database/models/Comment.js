const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    userId: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    adId: {
        ref: 'Advertisement',
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
