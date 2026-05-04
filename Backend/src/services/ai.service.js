import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
)

const agent = createAgent({
    model: mistralModel,
    tools: [ searchInternetTool ],
})

function getContentText(content) {
    if (!content) return "";
    if (typeof content === "string") return content;
    if (!Array.isArray(content)) return "";

    return content.map(block => {
        if (typeof block === "string") return block;
        return block?.text || block?.content || "";
    }).join("");
}

export function extractStreamToken(chunk) {
    const message = Array.isArray(chunk) ? chunk[ 0 ] : chunk;
    return getContentText(
        message?.content ||
        message?.content_blocks ||
        message?.contentBlocks ||
        message?.kwargs?.content ||
        message?.text
    );
}

function buildAgentMessages(messages) {
    return [
        new SystemMessage(`
            You are a helpful and precise assistant for answering questions.
            If you don't know the answer, say you don't know. 
            If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
        `),
        ...(messages.map(msg => {
            if (msg.role == "user") {
                return new HumanMessage(msg.content)
            } else if (msg.role == "ai") {
                return new AIMessage(msg.content)
            }
        }).filter(Boolean)) ]
}

export async function generateResponse(messages) {
    try {
        console.log(messages)

        const stream = await streamResponse(messages);
        let content = "";

        for await (const chunk of stream) {
            const token = extractStreamToken(chunk);
            if (token) {
                content += token;
            }
        }

        return content;
    } catch (err) {
        console.error("Error generating response:", err);
        throw new Error(`Failed to generate AI response: ${err.message}`);
    }

}

export async function streamResponse(messages) {
    return agent.stream(
        { messages: buildAgentMessages(messages) },
        { streamMode: "messages" }
    );
}

export async function generateChatTitle(message) {
    try {
        const response = await mistralModel.invoke([
            new SystemMessage(`
                You are a helpful assistant that generates concise and descriptive titles for chat conversations.
                
                User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
            `),
            new HumanMessage(`
                Generate a title for a chat conversation based on the following first message:
                "${message}"
                `)
        ])

        return response.text;
    } catch (err) {
        console.error("Error generating chat title:", err);
        // Return a default title if generation fails
        return "New Chat";
    }
}
