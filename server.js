require("dotenv").config();

const express = require("express");
const cors = require("cors");

const roastRoutes = require("./routes/roast");

const app = express();

const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

// Allow your React frontend to call the backend
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://ai-resume-roaster-livid.vercel.app"
    ]
}));

// Allow Express to read JSON request bodies
app.use(express.json());


// --------------------------------------------------
// ROOT ROUTE
// --------------------------------------------------

app.get("/", (req, res) => {
    res.send("AI Resume Roaster backend is running.");
});


// --------------------------------------------------
// ROAST ROUTE
// --------------------------------------------------

app.use("/api/roast", roastRoutes);


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});