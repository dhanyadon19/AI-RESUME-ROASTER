import { useState } from "react";
import api from "./api";

const MIN_CHARS = 200;

function App() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const remaining = MIN_CHARS - resumeText.length;
  const isValid = resumeText.length >= MIN_CHARS;

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
      const { data } = await api.post("/roast", { resumeText });
      setRoast(data.roast);
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  submitted && !isValid ? "text-orange-600" : "text-zinc-400"
                }
              >
                {isValid
                  ? "Ready to roast"
                  : `${Math.max(remaining, 0)} more characters needed`}
              </p>
              <p className="tabular-nums text-zinc-400">
                {resumeText.length} / {MIN_CHARS}
              </p>
            </div>
          </div>

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
            Reading every bullet like a hiring manager with too much coffee…
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
