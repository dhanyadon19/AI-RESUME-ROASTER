const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

router.post("/", async (req, res) => {
    try {
        const { resumeText } = req.body;

        if (!resumeText) {
            return res.status(400).json({
                message: "Resume text is required"
            });
        }

        if (resumeText.length < 200) {
            return res.status(400).json({
                message: "Resume must contain at least 200 characters"
            });
        }

        const interaction = await ai.interactions.create({
            model: "gemini-3.5-flash-lite",
        
            input: `
        Review this resume.
        
        Return:
        1. A short witty roast
        2. Three major weaknesses
        3. Three concrete improvements
        
        Be concise and useful.
        
        Resume:
        ${resumeText}
            `,
        
            generation_config: {
                thinking_level: "minimal"
            }
        });

        res.json({
            roast: interaction.output_text
        });

    } catch (error) {
        console.error("Gemini API error:", error);

        res.status(500).json({
            message: "Failed to generate resume feedback",
            error: error.message
        });
    }
});

module.exports = router;