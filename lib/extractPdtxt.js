const { PDFParse } = require("pdf-parse");

/**
 * Extracts plain text from a PDF file buffer.
 * Throws a friendly error if the PDF has no extractable text
 * (e.g. it's a scanned image with no text layer).
 */
async function extractPdfText(buffer) {
    const parser = new PDFParse({ data: buffer });

    try {
        const result = await parser.getText();
        const text = (result.text || "").trim();

        if (!text) {
            throw new Error(
                "No readable text found in this PDF. It may be a scanned image — try a text-based PDF or paste the text instead."
            );
        }

        return text;
    } finally {
        await parser.destroy();
    }
}

module.exports = { extractPdfText };
