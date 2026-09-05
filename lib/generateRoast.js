const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/**
 * Sends resume text to Gemini and returns the roast/feedback text.
 * Shared by both the paste-text route and the PDF-upload route so
 * the prompt and model config only live in one place.
 */
async function generateRoast(resumeText) {
    const interaction = await ai.interactions.create({
        model: "gemini-3.5-flash-lite",

        input: `
Review this resume.

Return:
1. One short witty roast
2. Three major weaknesses
3. Three concrete improvements

Keep the entire response under 250 words.
Be concise, specific, and useful.

Resume:
${resumeText}
        `,

        generation_config: {
            thinking_level: "minimal",
            max_output_tokens: 400
        }
    });

    return interaction.output_text;
}

module.exports = { generateRoast };
