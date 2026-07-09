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
    experience.forEach((job) => {
      const entry = el("div", "timeline-entry reveal");

      const meta = el(
        "div",
        "timeline-entry__meta",
        formatRange(job.start, job.end)
      );

      const role = el("div", "timeline-entry__role");
      role.textContent = job.role + " \u00b7 ";
      const company = el("span", "timeline-entry__company", job.company);
      role.appendChild(company);

      const bullets = el("ul", "timeline-entry__bullets");
      job.bullets.forEach((bullet) => {
        bullets.appendChild(el("li", "", bullet));
      });

      entry.append(meta, role, bullets);
      timeline.appendChild(entry);
    });
  }

  function renderSkills(skills) {
    const grid = document.getElementById("skills-grid");
    Object.keys(skills).forEach((category) => {
      const group = el("div", "skill-group reveal");
      const title = el("div", "skill-group__title", category);
      const tags = el("div", "skill-group__tags");
      skills[category].forEach((skill) => {
        tags.appendChild(el("span", "skill-tag", skill));
      });
      group.append(title, tags);
      grid.appendChild(group);
    });
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

      if (project.link) {
        const link = el("a", "project-card__link", "View project \u2192");
        link.href = project.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
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

    const email = el("a", "contact-link", contact.email);
    email.href = `mailto:${contact.email}`;
    wrap.appendChild(email);

    const phone = el("a", "contact-link", contact.phone);
    phone.href = `tel:${contact.phone.replace(/[^\d+]/g, "")}`;
    wrap.appendChild(phone);

    const linkedin = el("a", "contact-link", "LinkedIn");
    linkedin.href = contact.linkedinUrl || `https://${contact.linkedin}`;
    linkedin.target = "_blank";
    linkedin.rel = "noopener noreferrer";
    wrap.appendChild(linkedin);
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
    if (!bg || !hero) return;

    let ticking = false;

    function update() {
      const heroHeight = hero.offsetHeight;
      const scrollY = window.scrollY;
      if (scrollY < heroHeight) {
        bg.style.transform = `translateY(${scrollY * 0.18}px)`;
      }
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
      renderSkills(content.skills);
      renderProjects(content.projects);
      renderEducation(content.education, content.patents);
      renderContact(content.contact);
      renderFooter(content.hero.name);

      setupRevealObserver();
      setupStatCounters();
      setupParallax();
      hideLoadError();
    } catch (err) {
      console.error("Failed to render content:", err);
      showLoadError();
    }
  }

  function init() {
    loadAndRender();

    const retryButton = document.getElementById("retry-load");
    if (retryButton) {
      retryButton.addEventListener("click", () => loadAndRender());
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
