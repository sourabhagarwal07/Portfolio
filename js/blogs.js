(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const escape = (value) => String(value).replace(/[&<>"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char]));
  const inline = (text) => escape(text).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const date = (value) => new Intl.DateTimeFormat("en-US", {month:"short",day:"numeric",year:"numeric"}).format(new Date(`${value}T00:00:00`));
  function markdown(source) {
    let list = false; let html = ""; const close = () => { if (list) { html += "</ul>"; list = false; } };
    source.replace(/\r/g, "").split("\n").forEach((line) => {
      if (/^# /.test(line)) { close(); html += `<h1>${inline(line.slice(2))}</h1>`; }
      else if (/^## /.test(line)) { close(); html += `<h2>${inline(line.slice(3))}</h2>`; }
      else if (/^### /.test(line)) { close(); html += `<h3>${inline(line.slice(4))}</h3>`; }
      else if (/^- /.test(line)) { if (!list) { html += "<ul>"; list = true; } html += `<li>${inline(line.slice(2))}</li>`; }
      else if (!line.trim()) close(); else { close(); html += `<p>${inline(line)}</p>`; }
    }); close(); return html;
  }
  function renderList(posts) {
    const target = $("blog-list"); if (!target) return;
    target.innerHTML = posts.map((post, index) => `<a class="blog-card ${index === 0 ? "blog-card--feature" : ""}" href="blog.html?post=${encodeURIComponent(post.slug)}"><p class="blog-card__meta">${date(post.date)} <span>·</span> ${escape(post.readTime)}</p><h2>${escape(post.title)}</h2><p>${escape(post.description)}</p><div class="blog-card__tags">${post.tags.map((tag) => `<span>${escape(tag)}</span>`).join("")}</div><span class="blog-card__link">Read article <b>→</b></span></a>`).join("");
  }
  async function renderArticle(posts) {
    const target = $("article"); if (!target) return;
    const slug = new URLSearchParams(location.search).get("post"); const post = posts.find((item) => item.slug === slug) || posts[0];
    if (!post) throw new Error("No post found");
    const response = await fetch(`data/blogs/${encodeURIComponent(post.slug)}.md`); if (!response.ok) throw new Error("Post unavailable");
    document.title = `${post.title} — Sourabh Agarwal`;
    target.innerHTML = `<header class="article__header"><p class="eyebrow">// ${post.tags.map(escape).join(" · ")}</p><p class="article__meta">${date(post.date)} · ${escape(post.readTime)}</p></header>${markdown(await response.text())}`;
  }
  async function init() {
    const year = $("year"); if (year) year.textContent = new Date().getFullYear();
    try { const response = await fetch("data/blogs/index.json"); if (!response.ok) throw new Error("Index unavailable"); const posts = await response.json(); renderList(posts); await renderArticle(posts); }
    catch (error) { const target = $("blog-list") || $("article"); if (target) target.innerHTML = "<p class='blog-error'>Writing could not be loaded. Please try again shortly.</p>"; console.error(error); }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
