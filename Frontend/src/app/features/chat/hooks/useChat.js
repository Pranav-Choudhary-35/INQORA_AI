import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, appendToLastAiMessage, removeChat } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        dispatch(setLoading(true))
        const data = await sendMessage({ message, chatId })
        const { chat, aiMessage } = data
        if (!chatId)
            dispatch(createNewChat({
                chatId: chat._id,
                title: chat.title,
            }))
        dispatch(addNewMessage({
            chatId: chatId || chat._id,
            content: message,
            role: "user",
        }))
        dispatch(addNewMessage({
            chatId: chatId || chat._id,
            content: aiMessage.content,
            role: aiMessage.role,
        }))
        dispatch(setCurrentChatId(chat._id))
    }

    async function handleSendMessageStream({ message, chatId, controllerRef, onDone }) {
        const controller = new AbortController()
        controllerRef.current = {
            close: () => controller.abort()
        }

        try {
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ message, chat: chatId }),
                signal: controller.signal
            })

            if (!response.ok || !response.body) {
                throw new Error("Failed to start chat stream")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""
            let activeChatId = chatId

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const events = buffer.split("\n\n")
                buffer = events.pop() || ""

                for (const event of events) {
                    if (!event.startsWith("data: ")) continue
                    const data = JSON.parse(event.slice(6))

                    if (data.chat) {
                        activeChatId = data.chat._id
                        dispatch(createNewChat({
                            chatId: data.chat._id,
                            title: data.chat.title,
                        }))
                        dispatch(setCurrentChatId(data.chat._id))
                    } else if (data.chatId) {
                        activeChatId = data.chatId
                    }

                    if (data.chatId || data.chat) {
                        dispatch(addNewMessage({
                            chatId: activeChatId,
                            content: message,
                            role: "user",
                        }))
                        dispatch(addNewMessage({
                            chatId: activeChatId,
                            content: "",
                            role: "ai",
                        }))
                    }

                    if (data.done || data.error) {
                        return
                    }

                    if (data.token && activeChatId) {
                        dispatch(appendToLastAiMessage({
                            chatId: activeChatId,
                            token: data.token,
                        }))
                    }
                }
            }
        } catch (err) {
            if (err.name !== "AbortError") {
                dispatch(setError(err.message))
            }
        } finally {
            controllerRef.current = null
            onDone?.()
        }
    }

    async function handleGetChats() {
        dispatch(setLoading(true))
        const data = await getChats()
        const { chats } = data
        dispatch(setChats(chats.reduce((acc, chat) => {
            acc[ chat._id ] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        }, {})))
        dispatch(setLoading(false))
    }

    async function handleOpenChat(chatId, chats) {

        console.log(chats[ chatId ]?.messages.length)

        if (chats[ chatId ]?.messages.length === 0) {
            const data = await getMessages(chatId)
            const { messages } = data

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
            }))

            dispatch(addMessages({
                chatId,
                messages: formattedMessages,
            }))
        }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId) {
        // Optimistically remove from state
        dispatch(removeChat(chatId))
        try {
            await deleteChat(chatId)
        } catch (err) {
            // Determine the right error message based on HTTP status
            const status = err?.response?.status
            if (status === 404) {
                // Already gone — optimistic removal was correct, no rollback needed
                return { alreadyDeleted: true }
            }
            // For any other error, surface it so the caller can restore the item
            throw err
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleSendMessageStream,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
    }

}
