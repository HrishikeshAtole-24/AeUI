import Head from "next/head";
import { useMemo, useState } from "react";
import styles from "@/styles/Home.module.css";

const starterPrompt =
  "Create a modern hero section with a title, supporting text, a primary button, and a subtle gradient background.";

const starterCode = `function GeneratedComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-8">
      <div className="max-w-2xl space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Powered by Groq · React + Tailwind</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 leading-tight">
          Build beautiful UIs at the speed of a prompt.
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          Describe the component you want. We generate production-ready React code with sensible styling so you can ship faster.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded-lg shadow-lg shadow-sky-500/30 transition">Generate UI</button>
          <button className="px-5 py-3 border border-slate-700 text-slate-200 rounded-lg hover:border-slate-500 transition">View Code</button>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-left text-slate-200">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold">Smart defaults</p>
            <p className="text-slate-400 mt-1">Opinionated prompts keep outputs consistent.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold">Live preview</p>
            <p className="text-slate-400 mt-1">Render directly in a sandboxed iframe.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="font-semibold">Edit-friendly</p>
            <p className="text-slate-400 mt-1">Keep refining with follow-up prompts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratedComponent;`;

function normalizeCode(raw) {
  if (!raw) return "";
  return raw.replace(/export\s+default\s+/g, "").trim();
}

function buildSandboxHtml(componentCode, styling) {
  const safeCode = normalizeCode(componentCode);
  const stylingCdn =
    styling === "bootstrap"
      ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />'
      : styling === "tailwind"
      ? '<script src="https://cdn.tailwindcss.com"></script>'
      : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${stylingCdn}
    <style>
      body { margin: 0; background: #05070f; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" data-presets="react">
      ${safeCode}

      const Fallback = () => React.createElement('div', { style: { color: '#e2e8f0', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' } }, 'Define GeneratedComponent or export default a React component.');
      const Entry = typeof GeneratedComponent !== 'undefined' ? GeneratedComponent : (typeof App !== 'undefined' ? App : Fallback);
      try {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Entry));
      } catch (err) {
        const el = document.getElementById('root');
        el.innerHTML = '<pre style="color:#fca5a5; padding:16px; font-family:SFMono-Regular,Consolas,Menlo,monospace; white-space:pre-wrap;">' + err.message + '</pre>';
      }
    </script>
  </body>
</html>`;
}

export default function Home() {
  const [prompt, setPrompt] = useState(starterPrompt);
  const [framework, setFramework] = useState("react");
  const [styling, setStyling] = useState("tailwind");
  const [view, setView] = useState("preview");
  const [generatedCode, setGeneratedCode] = useState(starterCode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const sandboxHtml = useMemo(
    () => buildSandboxHtml(generatedCode, styling),
    [generatedCode, styling]
  );

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, framework, styling }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate code");
      }

      const data = await response.json();
      setGeneratedCode(data.code || starterCode);
      setView("preview");
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError("Copy failed. You can select and copy manually.");
    }
  };

  return (
    <>
      <Head>
        <title>Groq UI Generator</title>
        <meta name="description" content="Prompt to React UI generator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.app}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.kicker}>Groq powered</p>
            <h1 className={styles.title}>Frontend prompt-to-code</h1>
          </div>
          <div className={styles.tags}>
            <span className={styles.pill}>React</span>
            <span className={styles.pill}>Tailwind</span>
            <span className={styles.pill}>Sandboxed preview</span>
          </div>
        </header>

        <main className={styles.shell}>
          <section className={styles.outputPanel}>
            <div className={styles.outputHeader}>
              <div className={styles.tabs}>
                {(["preview", "code"]).map((mode) => (
                  <button
                    key={mode}
                    className={mode === view ? styles.tabActive : styles.tab}
                    onClick={() => setView(mode)}
                  >
                    {mode === "preview" ? "Preview" : "Code"}
                  </button>
                ))}
              </div>
              <div className={styles.badge}>Live iframe sandbox</div>
            </div>

            <div className={styles.outputBody}>
              {view === "preview" ? (
                <iframe
                  title="Preview"
                  className={styles.iframe}
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={sandboxHtml}
                />
              ) : (
                <div className={styles.codeWrap}>
                  <div className={styles.codeActions}>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className={styles.codeBlock}>
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.promptPanel}>
            <div className={styles.panelHeader}>
              <p className={styles.kicker}>Prompt</p>
              <h2 className={styles.panelTitle}>Describe your UI</h2>
            </div>

            <label className={styles.label} htmlFor="prompt">
              Instruction
            </label>
            <textarea
              id="prompt"
              className={styles.textarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build a dashboard hero with stats cards and a CTA"
              rows={8}
            />

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="framework">
                  Framework
                </label>
                <select
                  id="framework"
                  className={styles.select}
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                >
                  <option value="react">React</option>
                  <option value="next">Next.js</option>
                  <option value="vanilla">Vanilla JS</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="styling">
                  Styling
                </label>
                <select
                  id="styling"
                  className={styles.select}
                  value={styling}
                  onChange={(e) => setStyling(e.target.value)}
                >
                  <option value="tailwind">Tailwind (default)</option>
                  <option value="bootstrap">Bootstrap</option>
                  <option value="custom">Custom (Groq decides)</option>
                </select>
              </div>
            </div>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button
              className={styles.generate}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate with Groq"}
            </button>

            <p className={styles.helper}>
              We build an opinionated prompt so Groq returns a single, runnable component named
              <span className={styles.helperStrong}> GeneratedComponent</span>. The preview runs in an isolated iframe.
            </p>
          </aside>
        </main>
      </div>
    </>
  );
}
