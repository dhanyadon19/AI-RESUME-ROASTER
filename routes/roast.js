const express = require("express");
const multer = require("multer");

const { generateRoast } = require("../lib/generateRoast");
const { extractPdfText } = require("../lib/extractPdfText");

const router = express.Router();

const MIN_CHARS = 200;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

// Keep uploads in memory only — no need to write resumes to disk.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are supported"));
        }
        cb(null, true);
    }
});

// --------------------------------------------------
// POST /api/roast  — paste-text flow (unchanged)
// --------------------------------------------------
router.post("/", async (req, res) => {
    try {
        const { resumeText } = req.body || {};

        if (!resumeText) {
            return res.status(400).json({
                message: "Resume text is required"
            });
        }

        if (resumeText.length < MIN_CHARS) {
            return res.status(400).json({
                message: `Resume must contain at least ${MIN_CHARS} characters`
            });
        }

        const roast = await generateRoast(resumeText);
        res.json({ roast });

    } catch (error) {
        console.error("Gemini API error:", error);
        res.status(500).json({
            message: "Failed to generate resume feedback",
            error: error.message
        });
    }
});

// --------------------------------------------------
// POST /api/roast/upload  — PDF upload flow
// --------------------------------------------------
router.post("/upload", (req, res) => {
    upload.single("resume")(req, res, async (uploadError) => {
        if (uploadError) {
            const message =
                uploadError.code === "LIMIT_FILE_SIZE"
                    ? "PDF is too large. Max size is 5MB."
                    : uploadError.message || "Failed to upload file";
            return res.status(400).json({ message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: "A PDF file is required" });
            }

            const resumeText = await extractPdfText(req.file.buffer);

            if (resumeText.length < MIN_CHARS) {
                return res.status(400).json({
                    message: `Extracted text must contain at least ${MIN_CHARS} characters`
                });
            }

            const roast = await generateRoast(resumeText);
            res.json({ roast, extractedText: resumeText });

        } catch (error) {
            console.error("PDF roast error:", error);
            const status = error.message?.startsWith("No readable text") ? 400 : 500;
            res.status(status).json({
                message: error.message || "Failed to process PDF",
            });
        }
    });
});

module.exports = router;
