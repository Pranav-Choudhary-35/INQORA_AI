import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: [ 'user', 'ai' ],
            required: true,
        },
    },
    { timestamps: true }
);

// Add indexes for frequently queried fields
messageSchema.index({ chat: 1 });
messageSchema.index({ chat: 1, createdAt: -1 });

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;