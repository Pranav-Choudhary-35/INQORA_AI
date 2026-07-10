import { tavily as Tavily } from "@tavily/core"

const tavily = Tavily({
    apiKey: process.env.TAVILY_API_KEY,
})


export const searchInternet = async ({ query }) => {
    const results = await tavily.search(query, {
        maxResults: 5,
    })

    // Format into clean text for the LLM — never expose raw JSON/images to the model output
    const formatted = results.results
        .map((r, i) =>
            `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content?.trim() || "No content available."}`
        )
        .join("\n\n---\n\n")

    return `Search results for: "${query}"\n\n${formatted}`
}