import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

// Pagination limit
const MESSAGES_PER_PAGE = 50;

export async function sendMessage(req, res) {

    const { message, chat: chatId } = req.body;


    let title = null, chat = null;

    if (!chatId) {
        title = await generateChatTitle(message);
        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    })

    // Use lean() for read-only queries to improve performance
    const messages = await messageModel.find({ chat: chatId || chat._id }).lean();

    const result = await generateResponse(messages);

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: result,
        role: "ai"
    })


    res.status(201).json({
        title,
        chat,
        aiMessage
    })

}

export async function getChats(req, res) {
    const user = req.user

    // Use lean() for better performance on read-only queries
    const chats = await chatModel.find({ user: user.id }).lean().sort({ createdAt: -1 })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || MESSAGES_PER_PAGE;
    const skip = (page - 1) * limit;

    try {
        // Verify chat ownership
        const chat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        }).lean();

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false
            })
        }

        // Get total count for pagination
        const total = await messageModel.countDocuments({ chat: chatId });

        // Fetch paginated messages sorted by creation date
        const messages = await messageModel.find({
            chat: chatId
        }).lean().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.status(200).json({
            message: "Messages retrieved successfully",
            success: true,
            messages: messages.reverse(), // Reverse to show chronological order
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving messages",
            success: false,
            err: err.message
        })
    }
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    try {
        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: req.user.id
        })

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false
            })
        }

        // Delete all associated messages
        await messageModel.deleteMany({
            chat: chatId
        })

        res.status(200).json({
            message: "Chat deleted successfully",
            success: true
        })
    } catch (err) {
        res.status(500).json({
            message: "Error deleting chat",
            success: false,
            err: err.message
        })
    }
}