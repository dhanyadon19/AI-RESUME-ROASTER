import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-resume-roaster-production-0444.up.railway.app/api",
});

export default api;