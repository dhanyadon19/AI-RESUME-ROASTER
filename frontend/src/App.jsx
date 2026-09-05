import { useState } from "react";
import api from "./api";

const MIN_CHARS = 200;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend limit

function App() {
  const [mode, setMode] = useState("paste"); // "paste" | "upload"

  // Paste-text state
  const [resumeText, setResumeText] = useState("");

  // Upload state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const remaining = MIN_CHARS - resumeText.length;
  const isPasteValid = resumeText.length >= MIN_CHARS;
  const isUploadValid = Boolean(file);
  const isValid = mode === "paste" ? isPasteValid : isUploadValid;

  function switchMode(nextMode) {
    setMode(nextMode);
    setSubmitted(false);
    setError("");
  }

  function validateAndSetFile(candidate) {
    setError("");
    if (!candidate) return;

    if (candidate.type !== "application/pdf") {
      setFile(null);
      setError("Please upload a PDF file.");
      return;
    }

    if (candidate.size > MAX_FILE_BYTES) {
      setFile(null);
      setError("PDF is too large. Max size is 5MB.");
      return;
    }

    setFile(candidate);
  }

  function handleFileInputChange(event) {
    validateAndSetFile(event.target.files?.[0]);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setError("");

    if (!isValid) {
      return;
    }

    setLoading(true);
    setRoast("");

    try {
      if (mode === "paste") {
        const { data } = await api.post("/roast", { resumeText });
        setRoast(data.roast);
      } else {
        const formData = new FormData();
        formData.append("resume", file);
        const { data } = await api.post("/roast/upload", formData);
        setRoast(data.roast);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-16">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-orange-500 uppercase">
            SaaS · Instant feedback
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            AI Resume Roaster
          </h1>
          <p className="mx-auto mt-3 max-w-md text-balance text-zinc-500">
            Paste your resume. Get a witty roast, then actually useful advice.
          </p>
        </header>

        {/* Mode toggle */}
        <div className="mb-4 inline-flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode("paste")}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "paste"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => switchMode("upload")}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === "upload"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Upload PDF
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "paste" ? (
            <div>
              <label htmlFor="resume" className="sr-only">
                Resume text
              </label>
              <textarea
                id="resume"
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste your resume here…"
                rows={12}
                disabled={loading}
                className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-800 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <p
                  className={
                    submitted && !isPasteValid ? "text-orange-600" : "text-zinc-400"
                  }
                >
                  {isPasteValid
                    ? "Ready to roast"
                    : `${Math.max(remaining, 0)} more characters needed`}
                </p>
                <p className="tabular-nums text-zinc-400">
                  {resumeText.length} / {MIN_CHARS}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="resume-file" className="sr-only">
                Resume PDF
              </label>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
                  isDragging
                    ? "border-orange-400 bg-orange-50"
                    : "border-zinc-200 bg-white"
                } ${loading ? "opacity-60" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mb-3 h-8 w-8 text-orange-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9m0 0-3 3m3-3 3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3.75 3.75 0 0 1 4.132 5.303A4.5 4.5 0 0 1 17.25 19.5H6.75Z"
                  />
                </svg>

                {file ? (
                  <>
                    <p className="text-sm font-medium text-zinc-800">{file.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {(file.size / 1024).toFixed(0)} KB · Ready to roast
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      disabled={loading}
                      className="mt-3 text-xs font-medium text-orange-500 underline underline-offset-2 hover:text-orange-600"
                    >
                      Choose a different file
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-zinc-700">
                      Drag and drop your resume PDF here
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">or</p>
                    <label
                      htmlFor="resume-file"
                      className="mt-3 cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
                    >
                      Browse files
                    </label>
                    <input
                      id="resume-file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileInputChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <p className="mt-3 text-xs text-zinc-400">PDF only · Max 5MB</p>
                  </>
                )}
              </div>
              {submitted && !isUploadValid && (
                <p className="mt-2 text-xs text-orange-600">
                  Please choose a PDF file to continue.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {loading ? "Roasting…" : "Roast my resume"}
          </button>
        </form>

        {loading && (
          <p className="mt-6 text-center text-sm text-zinc-500" aria-live="polite">
            {mode === "upload"
              ? "Extracting text and reading every bullet like a hiring manager with too much coffee…"
              : "Reading every bullet like a hiring manager with too much coffee…"}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {roast && (
          <article className="animate-fade-in mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-orange-500 uppercase">
              The roast
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {roast}
            </p>
          </article>
        )}
      </main>
    </div>
  );
}

export default App;
