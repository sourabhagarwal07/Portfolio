const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

async function main() {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

  const dom = new JSDOM(html, {
    url: "http://localhost:8000/index.html",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
  });

  const { window } = dom;

  // Polyfill fetch to read content.json straight off disk, matching what
  // the real fetch("data/content.json") would resolve to on the server.
  window.fetch = async (url) => {
    const filePath = path.join(__dirname, url.toString());
    const data = fs.readFileSync(filePath, "utf8");
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(data),
    };
  };

  // Polyfill matchMedia (not implemented in jsdom, but every real browser has it)
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });

  // Polyfill IntersectionObserver (not implemented in jsdom)
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  window.addEventListener("error", (e) => {
    console.error("RUNTIME ERROR:", e.error ? e.error.stack : e.message);
    process.exitCode = 1;
  });

  window.onunhandledrejection = (e) => {
    console.error("UNHANDLED REJECTION:", e.reason);
    process.exitCode = 1;
  };

  // Load and execute script.js manually (jsdom doesn't fetch local <script src> files by default reliably here)
  const scriptContent = fs.readFileSync(path.join(__dirname, "js/script.js"), "utf8");
  const scriptEl = window.document.createElement("script");
  scriptEl.textContent = scriptContent;

  try {
    window.document.body.appendChild(scriptEl);
  } catch (err) {
    console.error("SYNC ERROR ON SCRIPT INSERT:", err.stack);
    process.exit(1);
  }

  // DOMContentLoaded already fired by the time we append synchronously in jsdom with runScripts,
  // so dispatch it manually to trigger init().
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true, cancelable: true }));

  // Give async init() time to run
  await new Promise((resolve) => setTimeout(resolve, 500));

  const errorVisible = window.document.getElementById("load-error").hidden === false;
  console.log("load-error visible:", errorVisible);
  console.log("hero-name text:", window.document.getElementById("hero-name").textContent);
  console.log("timeline children count:", window.document.getElementById("timeline").children.length);
  console.log("stats-grid children count:", window.document.getElementById("stats-grid").children.length);

  if (errorVisible) process.exitCode = 1;
}

main().catch((err) => {
  console.error("SCRIPT CRASHED:", err.stack);
  process.exitCode = 1;
});
