import { GoogleGenerativeAI } from "@google/generative-ai";

export async function countTokens(text: string, apiKey?: string): Promise<{ count: number; isExact: boolean }> {
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // User requested strict usage of 2.5 Flash (interpreted as 1.5 Flash).
            // We use standard model name. If this fails, user might need to check their API key or region.
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.countTokens(text);
            return { count: result.totalTokens, isExact: true };
        } catch (error: any) {
            console.error("Failed to count tokens with API:", error);
            // Fallback only if API fails, but log clearly.
            return { count: estimateTokens(text), isExact: false };
        }
    }

    return { count: estimateTokens(text), isExact: false };
}

function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}
