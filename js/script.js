/**
 * script.js
 * Fetches data/content.json, renders every section of the page from it,
 * and wires up the scroll animations, hero typing effect, stat count-up,
 * and a subtle parallax effect.
 *
 * To update site content, edit data/content.json only — this file should
 * not need to change for routine content updates.
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ----------------------------------------------------------
   * Small render helpers
   * ---------------------------------------------------------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    const paths = {
      arrow: ["M5 12h14", "m13 6 6 6-6 6"],
      external: ["M14 5h5v5", "m19 5-8 8", "M17 12v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5"],
      repository: ["M7 3.5a3.5 3.5 0 0 0-1 6.82V13a2 2 0 0 0 2 2h1v-2H8v-1.24a3.5 3.5 0 1 0-2 0V13a2 2 0 0 0 2 2h1v4h6v-4h1a2 2 0 0 0 2-2v-1.18a3.5 3.5 0 1 0-2 0V13h-1v2h1a2 2 0 0 0 2-2v-2.68A3.5 3.5 0 1 0 17 3.5"],
      mail: ["M4 6h16v12H4z", "m4 7 8 6 8-6"],
      phone: ["M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6L17 12l4 1.5v3c0 1.1-.9 2-2 2C10.2 18.5 5.5 13.8 5.5 5c0-1.1.4-2 1.5-2Z"],
      linkedin: ["M6 9v9", "M6 6v.01", "M10 18v-5a4 4 0 0 1 8 0v5", "M10 9v9"],
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("icon", `icon--${name}`);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    (paths[name] || []).forEach((d) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function toolIcon(name) {
    const brands = {
      "C": "c", "C++": "cplusplus", "Java (J2EE/J2SE)": "openjdk", Python: "python", R: "r",
      "REST APIs": "fastapi", "Spring Boot": "springboot", Flask: "flask", Microservices: "apache", "Client-Server Architecture": "socketdotio",
      "Apache Spark": "apachespark", Airflow: "apacheairflow", Databricks: "databricks", SQL: "sqlite", MongoDB: "mongodb", Oracle: "oracle", MySQL: "mysql", Firebase: "firebase",
      Azure: "microsoftazure", "AWS EC2": "amazonaws", "AWS S3": "amazonaws", Docker: "docker", Kubernetes: "kubernetes", "CI/CD": "githubactions", Git: "git", Linux: "linux",
      LLMs: "openai", LangChain: "langchain", "Hugging Face": "huggingface", TensorFlow: "tensorflow", "Scikit-learn": "scikitlearn", spaCy: "spacy", NLP: "huggingface", MLflow: "mlflow", RAG: "weaviate", "AI Agents (CrewAI)": "crewai", Transformers: "huggingface",
      "R Shiny": "r", Plotly: "plotly", Tableau: "tableau", "Power BI": "powerbi", Matplotlib: "matplotlib", Seaborn: "python",
      React: "react", Angular: "angular", "HTML/CSS": "html5", Tailwind: "tailwindcss", "Material UI": "mui", PHP: "php",
    };
    const brand = brands[name];
    if (brand) {
      const image = el("img", "tool-icon tool-icon--brand");
      image.src = `https://cdn.simpleicons.org/${brand}/a5f3fc`;
      image.alt = "";
      image.width = 32;
      image.height = 32;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => image.replaceWith(genericToolIcon()));
      return image;
    }
    return genericToolIcon();
  }

  function genericToolIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const nodes = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.classList.add("tool-icon");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", "m16 3 11 6v14l-11 6L5 23V9l11-6Zm0 0v12m11-6-11 6L5 9");
    nodes.setAttribute("d", "M12 17h.01M20 17h.01M16 23h.01");
    svg.append(path, nodes);
    return svg;
  }

  function formatRange(start, end) {
    return `${start} \u2014 ${end}`;
  }

  /* ----------------------------------------------------------
   * Section renderers — each takes its slice of content.json
   * ---------------------------------------------------------- */
  function renderHero(hero) {
    document.getElementById("hero-name").textContent = hero.name;
    document.getElementById("hero-title").textContent = hero.title;
    startTyping(hero.taglines);
  }

  function renderSummary(summary) {
    document.getElementById("summary-text").textContent = summary.text;

    const grid = document.getElementById("stats-grid");
    summary.stats.forEach((stat) => {
      const card = el("div", "stat reveal");
      const value = el("div", "stat__value");
      value.dataset.target = stat.value;
      value.dataset.suffix = stat.suffix || "";
      value.textContent = "0" + (stat.suffix || "");
      const label = el("div", "stat__label", stat.label);
      card.append(value, label);
      grid.appendChild(card);
    });
  }

  function renderExperience(experience) {
    const timeline = document.getElementById("timeline");
    experience.forEach((job, index) => {
      const entry = el("article", "timeline-entry reveal" + (index === 0 ? " is-expanded" : ""));
      const toggle = el("button", "timeline-entry__toggle");
      toggle.type = "button";
      toggle.setAttribute("aria-expanded", index === 0 ? "true" : "false");

      const date = el("div", "timeline-entry__date", formatRange(job.start, job.end));
      const heading = el("div", "timeline-entry__heading");
      const role = el("div", "timeline-entry__role", job.role);
      const company = el("div", "timeline-entry__company", job.company);
      const location = el("div", "timeline-entry__location", job.location);
      const indicator = el("span", "timeline-entry__indicator", "+");
      heading.append(role, company, location);
      toggle.append(date, heading, indicator);

      const details = el("div", "timeline-entry__details");
      const detailsContent = el("div", "timeline-entry__details-content");
      const bullets = el("ul", "timeline-entry__bullets");
      job.bullets.forEach((bullet) => bullets.appendChild(el("li", "", bullet)));
      detailsContent.appendChild(bullets);
      if (job.impact) {
        const impact = el("aside", "timeline-entry__impact");
        const impactLabel = el("span", "timeline-entry__impact-label", "Impact / XYZ");
        impact.append(impactLabel, el("p", "timeline-entry__impact-copy", job.impact));
        detailsContent.appendChild(impact);
      }
      details.appendChild(detailsContent);
      entry.append(toggle, details);
      toggle.addEventListener("click", () => {
        const expanded = entry.classList.toggle("is-expanded");
        toggle.setAttribute("aria-expanded", String(expanded));
      });
      timeline.appendChild(entry);
    });
  }

  function renderSkills(skills, proficiency) {
    const grid = document.getElementById("skills-grid");
    const tools = Object.entries(skills).flatMap(([category, names]) =>
      names.map((name) => ({
        name,
        category,
        level: proficiency[name] || 70,
      }))
    );
    const dashboard = el("div", "skills-dashboard");
    const treemap = el("div", "skills-treemap");
    const detail = el("aside", "skill-detail reveal");
    detail.setAttribute("aria-live", "polite");
    let activeTool;

    function selectTool(tool, tile) {
      if (activeTool && activeTool.tile) activeTool.tile.classList.remove("is-selected");
      activeTool = { ...tool, tile };
      tile.classList.add("is-selected");
      detail.innerHTML = "";
      const eyebrow = el("p", "skill-detail__eyebrow", tool.category);
      const name = el("h3", "skill-detail__name", tool.name);
      const level = el("p", "skill-detail__level", `${tool.level}% proficiency`);
      const meter = el("div", "skill-detail__meter");
      const fill = el("span", "");
      fill.style.width = `${tool.level}%`;
      meter.appendChild(fill);
      const description = el("p", "skill-detail__copy", tool.level >= 85 ? "Advanced, production-focused experience." : tool.level >= 70 ? "Strong working proficiency." : "Working knowledge and active practice.");
      detail.append(eyebrow, name, level, meter, description);
    }

    Object.entries(skills).forEach(([category, names], index) => {
      const group = el("section", "skills-treemap__group");
      group.style.setProperty("--hue", 208 + index * 19);
      group.style.setProperty("--group-span", Math.max(3, Math.min(6, Math.ceil(names.length / 2))));
      const heading = el("h3", "skills-treemap__heading", category);
      const tiles = el("div", "skills-treemap__tiles");
      names.forEach((name) => {
        const tool = tools.find((entry) => entry.name === name);
        const tile = el("button", "skill-tile");
        tile.type = "button";
        tile.style.setProperty("--weight", Math.max(3, Math.round(tool.level / 14)));
        tile.setAttribute("aria-label", `${tool.name}, ${tool.level}% proficiency`);
        tile.append(toolIcon(name), el("span", "skill-tile__label", name));
        tile.addEventListener("click", () => selectTool(tool, tile));
        tiles.appendChild(tile);
        if (tool.name === "Python") activeTool = { ...tool, tile };
      });
      group.append(heading, tiles);
      treemap.appendChild(group);
    });

    dashboard.append(treemap);
    grid.append(dashboard, detail);
    selectTool(activeTool || tools[0], activeTool && activeTool.tile);
  }

  function renderProjects(projects) {
    const grid = document.getElementById("projects-grid");
    projects.forEach((project) => {
      const card = el(
        "div",
        "project-card reveal" + (project.placeholder ? " project-card--placeholder" : "")
      );
      card.append(el("div", "project-card__title", project.title));
      card.append(el("div", "project-card__desc", project.description));

      if (project.tags && project.tags.length) {
        const tagWrap = el("div", "project-card__tags");
        project.tags.forEach((tag) => {
          tagWrap.appendChild(el("span", "project-card__tag", tag));
        });
        card.appendChild(tagWrap);
      }

      if (project.updatedAt) {
        const meta = el("div", "project-card__meta");
        const date = new Date(project.updatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        meta.textContent = `Last updated ${date}`;
        card.appendChild(meta);
      }

      if (project.link) {
        const link = el("a", "project-card__link", "View repository");
        link.href = project.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.append(icon("repository"), icon("external"));
        card.appendChild(link);
      }

      grid.appendChild(card);
    });
  }

  function renderEducation(education, patents) {
    const eduList = document.getElementById("education-list");
    education.forEach((item) => {
      const wrap = el("div", "edu-item reveal");
      wrap.append(el("div", "edu-item__degree", item.degree));
      wrap.append(el("div", "edu-item__school", item.school));
      wrap.append(el("div", "edu-item__years", item.years));
      eduList.appendChild(wrap);
    });

    const patentList = document.getElementById("patents-list");
    patents.forEach((item) => {
      const wrap = el("div", "patent-item reveal");
      wrap.append(el("div", "patent-item__title", item.title));
      wrap.append(el("div", "patent-item__detail", item.detail));
      patentList.appendChild(wrap);
    });
  }

  function renderContact(contact) {
    const wrap = document.getElementById("contact-links");

    const intro = el("p", "contact__intro", "Have a role, project, or idea in mind? I’d be glad to connect.");
    const email = el("a", "contact__primary-link", "Start a conversation");
    email.href = `mailto:${contact.email}`;
    email.setAttribute("aria-label", `Email ${contact.email}`);
    email.append(icon("mail"), icon("arrow"));

    const linkedin = el("a", "contact__linkedin-button", "Connect on LinkedIn");
    linkedin.href = contact.linkedinUrl || `https://${contact.linkedin}`;
    linkedin.target = "_blank";
    linkedin.rel = "noopener noreferrer";
    linkedin.append(icon("linkedin"), icon("external"));

    const details = el("div", "contact__details");

    function addContactDetail(label, value, href, iconName) {
      const link = el("a", "contact-detail", "");
      link.href = href;
      const labelEl = el("span", "contact-detail__label", label);
      labelEl.prepend(icon(iconName));
      const valueEl = el("span", "contact-detail__value", value);
      link.append(labelEl, valueEl);
      details.appendChild(link);
    }

    addContactDetail("Email", contact.email, `mailto:${contact.email}`, "mail");
    addContactDetail("Phone", contact.phone, `tel:${contact.phone.replace(/[^\d+]/g, "")}`, "phone");

    wrap.append(intro, email, linkedin, details);
  }

  function renderFooter(name) {
    const year = new Date().getFullYear();
    document.getElementById(
      "footer-text"
    ).textContent = `\u00a9 ${year} ${name} \u2014 built with plain HTML, CSS, and JS.`;
  }

  /* ----------------------------------------------------------
   * Hero typing effect
   * ---------------------------------------------------------- */
  function startTyping(taglines) {
    const textEl = document.getElementById("hero-typing-text");
    const identity = document.getElementById("hero-identity");

    if (prefersReducedMotion || !taglines || !taglines.length) {
      textEl.textContent = taglines && taglines.length ? taglines[taglines.length - 1] : "";
      identity.classList.add("is-visible");
      return;
    }

    let taglineIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const TYPE_SPEED = 55;
    const DELETE_SPEED = 30;
    const PAUSE_AFTER_TYPE = 1100;
    const PAUSE_AFTER_DELETE = 300;

    function tick() {
      const current = taglines[taglineIndex];
      const isLast = taglineIndex === taglines.length - 1;

      if (!deleting) {
        charIndex++;
        textEl.textContent = current.slice(0, charIndex);

        if (charIndex === current.length) {
          if (isLast) {
            // Finished the final tagline — stop typing, reveal identity.
            identity.classList.add("is-visible");
            return;
          }
          setTimeout(() => {
            deleting = true;
            tick();
          }, PAUSE_AFTER_TYPE);
          return;
        }
      } else {
        charIndex--;
        textEl.textContent = current.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          taglineIndex++;
          setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }
      }

      setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
    }

    tick();
  }

  /* ----------------------------------------------------------
   * Scroll-reveal via IntersectionObserver
   * ---------------------------------------------------------- */
  function setupRevealObserver() {
    const targets = document.querySelectorAll(".reveal");

    if (prefersReducedMotion) {
      targets.forEach((t) => t.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((t) => observer.observe(t));
  }

  /* ----------------------------------------------------------
   * Stat count-up, triggered once when the stats grid scrolls in
   * ---------------------------------------------------------- */
  function setupStatCounters() {
    const stats = document.querySelectorAll(".stat__value");
    if (!stats.length) return;

    if (prefersReducedMotion) {
      stats.forEach((stat) => {
        stat.textContent = stat.dataset.target + stat.dataset.suffix;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    stats.forEach((stat) => observer.observe(stat));
  }

  function animateCount(node) {
    const target = parseFloat(node.dataset.target);
    const suffix = node.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(target * eased);
      node.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
   * Subtle parallax on the hero background, throttled via rAF
   * ---------------------------------------------------------- */
  function setupParallax() {
    if (prefersReducedMotion) return;

    const bg = document.getElementById("hero-bg");
    const hero = document.getElementById("hero");
    const stage = document.querySelector(".hero__stage");
    if (!bg || !hero) return;

    let ticking = false;

    function update() {
      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY;
      if (scrollY < heroHeight) {
        bg.style.transform = `translateY(${scrollY * 0.18}px)`;
        if (stage) stage.style.setProperty("--scroll-shift", `${scrollY * -0.08}px`);
      }
      document.documentElement.style.setProperty(
        "--scroll-progress",
        `${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))}`
      );
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    hero.addEventListener("pointermove", (event) => {
      const bounds = hero.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;
      if (stage) {
        stage.style.setProperty("--pointer-x", `${x}deg`);
        stage.style.setProperty("--pointer-y", `${y}deg`);
      }
    });
    hero.addEventListener("pointerleave", () => {
      if (stage) {
        stage.style.removeProperty("--pointer-x");
        stage.style.removeProperty("--pointer-y");
      }
    });
    window.dispatchEvent(new Event("scroll"));
  }

  function setupTiltInteractions() {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    document.querySelectorAll(".project-card, .stat, .skill-group").forEach((card) => {
      card.classList.add("has-tilt");
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${x * 7}deg`);
        card.style.setProperty("--tilt-y", `${y * -7}deg`);
        card.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
        card.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--tilt-x");
        card.style.removeProperty("--tilt-y");
        card.style.removeProperty("--glow-x");
        card.style.removeProperty("--glow-y");
      });
    });
  }

  function setupNavigation() {
    const links = [...document.querySelectorAll(".nav__links a")];
    const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));
    const sections = [...document.querySelectorAll("main section[id]")];
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible || !byId.has(visible.target.id)) return;
      links.forEach((link) => link.classList.toggle("is-active", link === byId.get(visible.target.id)));
    }, { rootMargin: "-25% 0px -65%", threshold: [0.01, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  function setupScrollScenes() {
    const scenes = document.querySelectorAll(".scroll-scene");
    if (!scenes.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      scenes.forEach((scene) => scene.classList.add("is-active"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    }, { threshold: 0.5 });
    scenes.forEach((scene) => observer.observe(scene));
  }

  /* ----------------------------------------------------------
   * Boot
   * ---------------------------------------------------------- */
  function showLoadError() {
    document.getElementById("main-content").hidden = true;
    document.getElementById("load-error").hidden = false;
  }

  function hideLoadError() {
    document.getElementById("main-content").hidden = false;
    document.getElementById("load-error").hidden = true;
  }

  function resetRenderedSections() {
    // Clear any partial render so a retry doesn't duplicate content.
    [
      "stats-grid",
      "timeline",
      "skills-grid",
      "projects-grid",
      "education-list",
      "patents-list",
      "contact-links",
    ].forEach((id) => {
      const node = document.getElementById(id);
      if (node) node.innerHTML = "";
    });
  }

  const MAX_AUTO_RETRIES = 2;
  const RETRY_DELAY_MS = 1200;

  async function fetchContent() {
    const response = await fetch("data/content.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function loadAndRender(attempt = 0) {
    let content;
    try {
      content = await fetchContent();
    } catch (err) {
      console.error(`Failed to load content.json (attempt ${attempt + 1}):`, err);
      if (attempt < MAX_AUTO_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        return loadAndRender(attempt + 1);
      }
      showLoadError();
      return;
    }

    try {
      resetRenderedSections();
      renderHero(content.hero);
      renderSummary(content.summary);
      renderExperience(content.experience);
      renderSkills(content.skills, content.skillProficiency || {});
      renderProjects(content.projects);
      renderEducation(content.education, content.patents);
      renderContact(content.contact);
      renderFooter(content.hero.name);

      setupRevealObserver();
      setupStatCounters();
      setupParallax();
      setupTiltInteractions();
      hideLoadError();
    } catch (err) {
      console.error("Failed to render content:", err);
      showLoadError();
    }
  }

  function init() {
    loadAndRender();
    setupNavigation();
    setupScrollScenes();

    const retryButton = document.getElementById("retry-load");
    if (retryButton) {
      retryButton.addEventListener("click", () => loadAndRender());
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
