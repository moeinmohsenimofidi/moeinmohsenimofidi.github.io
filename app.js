(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ext = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;

  const ICONS = {
    github: '<path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.2 4.1 18.2 4.4 18.2 4.4c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/>',
    linkedin: '<path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/>',
    group: '<path d="M12 2 1 7l11 5 9-4.1V15h2V7L12 2zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.2-7-3.2z"/>',
    scholar: '<path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.8 3.9A9 9 0 0 1 12 10a9 9 0 0 1 7.2 3.4L24 9.5 12 0z"/>',
    orcid: '<path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zM8.1 17.5H6.6V7.1h1.5v10.4zM7.4 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10.4 6.3c0 3-1.9 5.2-5.3 5.2H9.6V7.1h2.9c3.5 0 5.3 2.3 5.3 5.2zm-1.6 0c0-2-1.2-3.8-4-3.8h-1.2v7.6h1.2c2.8 0 4-2 4-3.8z"/>',
    email: '<path d="M2 4h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm10 8.5L2.5 6.5v1.8l9.5 6 9.5-6V6.5L12 12.5z"/>',
  };
  const LABELS = { github: "GitHub", linkedin: "LinkedIn", group: "SE@UHD group page", scholar: "Google Scholar", orcid: "ORCID", email: "Email" };

  // ---------- Header / hero ----------
  document.title = S.name;
  $("name").textContent = S.name;
  $("role").textContent = S.role;
  $("group").innerHTML = `${ext(S.group.url, esc(S.group.name))}<br><span class="supervisor">Supervisor: ${esc(S.group.head)}</span>`;
  $("avatar").src = "logos/photo.jpg";
  $("avatar").alt = S.name;
  $("social").innerHTML = Object.entries(S.links).filter(([, u]) => u)
    .map(([k, u]) => `<a href="${esc(u)}" ${u.startsWith("mailto:") ? "" : 'target="_blank" rel="noopener"'} aria-label="${LABELS[k]}" title="${LABELS[k]}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></a>`).join("");

  const PIN = '<svg class="pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  $("contact").innerHTML = S.contact.map((c) => `<dt${c.icon ? ` title="${esc(c.key)}"` : ""}>${c.icon === "pin" ? PIN + `<span class="sr-only">${esc(c.key)}</span>` : esc(c.key)}</dt><dd>${c.href
    ? `<a href="${esc(c.href)}" ${c.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(c.value)}</a>`
    : esc(c.value)}</dd>`).join("");

  $("colophon").innerHTML = S.colophon.map(([k, v, u]) => `<dt>${esc(k)}</dt><dd>${u ? ext(u, esc(v)) : esc(v)}</dd>`).join("");
  $("c-year").textContent = new Date().getFullYear();
  $("c-name").textContent = S.name;

  // ---------- Research diagram (README) ----------
  const fileBox = (y, name) => `<g class="d-file" transform="translate(40 ${y})"><rect class="d-side" x="4" y="5" width="150" height="30" rx="6"/><rect width="150" height="30" rx="6"/><path class="d-ic" d="M11 8h6l4 4v11h-10z M17 8v4h4"/><text x="30" y="20">${name}</text></g>`;
  // Paths from each file to the agent; dots travel along them.
  const FLOWS = [42, 90, 138, 186].map((y, i) => `M190 ${y} C 232 ${y}, 240 ${122 + i * 4}, 280 ${122 + i * 4}`);
  const pulse = (d, i, dur = 2.4) => `<circle class="d-pulse" r="3"><animateMotion dur="${dur}s" begin="${(i * 0.6).toFixed(1)}s" repeatCount="indefinite" path="${d}"/></circle>`;
  const DIAGRAM = `
    <figure class="diagram">
      <svg viewBox="0 0 660 256" role="img" aria-labelledby="dg-t">
        <title id="dg-t">Instruction files such as AGENTS.md, CLAUDE.md, SKILL.md, settings and other configuration mechanisms feed into a coding agent, which changes the code. The files can drift from the code and contradict each other.</title>
        <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-head"/></marker><pattern id="dg-grid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1" class="d-grid"/></pattern></defs>
        <rect class="d-floor" x="2" y="2" width="656" height="252" rx="12" fill="url(#dg-grid)"/>
        ${fileBox(27, "AGENTS.md")}${fileBox(75, "CLAUDE.md")}${fileBox(123, "SKILL.md")}${fileBox(171, "settings.json")}
        <g class="d-more" aria-label="and other configuration mechanisms"><circle cx="115" cy="218" r="2.2"/><circle cx="115" cy="227" r="2.2"/><circle cx="115" cy="236" r="2.2"/></g>
        <path class="d-conflict" d="M34 92 h-10 v46 h10"/>
        <text class="d-label d-bad" x="14" y="115" transform="rotate(-90 14 115)" text-anchor="middle">conflict</text>
        ${FLOWS.map((d) => `<path class="d-flow" d="${d}" marker-end="url(#arr)"/>`).join("")}
        <g class="d-agent" transform="translate(282 100)"><rect class="d-side" x="5" y="6" width="128" height="56" rx="10"/><rect width="128" height="56" rx="10"/><circle class="d-live" cx="16" cy="18" r="3.5"/><text x="68" y="24" text-anchor="middle">coding agent</text><text class="d-sub" x="64" y="42" text-anchor="middle">reads the files</text></g>
        <path class="d-flow" d="M410 128 H478" marker-end="url(#arr)"/>
        <g class="d-file d-code" transform="translate(480 92)"><rect class="d-side" x="5" y="6" width="160" height="72" rx="10"/><rect width="160" height="72" rx="10"/><text x="80" y="22" text-anchor="middle">code &amp; pull requests</text>
          <g class="d-diff"><text class="d-add" x="14" y="41">+</text><rect class="d-add" x="26" y="35" width="96" height="5" rx="2"/>
          <text class="d-del" x="14" y="52">−</text><rect class="d-del" x="26" y="46" width="64" height="5" rx="2"/>
          <text class="d-add" x="14" y="63">+</text><rect class="d-add" x="26" y="57" width="118" height="5" rx="2"/></g></g>
        <g class="d-pulses">${FLOWS.map((d, i) => pulse(d, i)).join("")}${pulse("M410 128 H476", 1, 1.2)}</g>
        <path class="d-drift" d="M190 40 C 330 4, 520 14, 556 84"/>
        <g class="d-warn" transform="translate(560 84)"><circle r="8"/><text y="4" text-anchor="middle">!</text></g>
        <text class="d-label d-bad" x="375" y="58" text-anchor="middle">drift: stale reference to the code</text>
      </svg>
    </figure>`;

  // ---------- Citations (Google Scholar snapshot), shown as a breakdown in publications.bib ----------
  const C = S.citations;
  const citationsBox = () => `
    <details class="cites-details">
      <summary class="mono"><span class="cs-key">// citations</span>
        <span><b>${C.total}</b> citations · h-index <b>${C.hIndex}</b> · i10 <b>${C.i10}</b></span>
        <span class="cs-hint" aria-hidden="true"></span></summary>
      <div class="cites" aria-label="Citations per year">
        <div class="term-head mono"><span>$ scholar citations --by-year</span>${ext(S.links.scholar, "Google Scholar ↗")}</div>
        <div class="bars mono">${citationRows()}</div>
      </div>
    </details>`;
  // Each year is a row of BINS cells; cells light up one by one and numbers count up when the breakdown opens.
  const BINS = 40;
  const citationRows = () => {
    const rows = Object.entries(C.byYear);
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return rows.map(([y, n], r) => {
      const lit = n > 0 ? Math.max(1, Math.round((n / max) * BINS)) : 0;
      const cells = Array.from({ length: BINS }, (_, k) =>
        `<i class="cell${k < lit ? " lit" : ""}${k === lit - 1 ? " tip" : ""}" style="--k:${k};--r:${r}"></i>`).join("");
      return `<div class="bar-row" title="${n} citations in ${y}"><span class="yr">${y}</span>
        <span class="cells" aria-hidden="true">${cells}</span><span class="n count" data-to="${n}">${n}</span></div>`;
    }).join("");
  };

  // ---------- Sections, each shown as a file ----------
  const boldName = (authors) => {
    let out = esc(authors);
    for (const n of S.authorNames) out = out.replaceAll(esc(n), `<strong>${esc(n)}</strong>`);
    return out;
  };
  const pubs = (label, list) => !list.length ? "" : `<h3 class="mono">// ${label}</h3>` + list.map((p) => `
    <article class="pub">
      <span class="venue mono">${esc(p.venue)}${/\d{4}/.test(p.venue) ? "" : " " + p.year}${p.accept ? ` · acceptance rate ${esc(p.accept)}` : ""}</span>
      <div class="title">${ext("https://doi.org/" + p.doi, esc(p.title))}</div>
      <div class="authors">${boldName(p.authors)}</div>
      <div class="plinks mono">
        ${ext("https://doi.org/" + p.doi, "doi")}
        ${p.arxiv ? ext(`https://arxiv.org/pdf/${p.arxiv}`, "pdf") + ext(`https://arxiv.org/abs/${p.arxiv}`, "arXiv") : ""}
        ${(p.extra || []).map(([l, u]) => ext(u, esc(l))).join("")}
        ${BIB[p.doi] ? `<button class="bib-btn" data-doi="${esc(p.doi)}" aria-expanded="false">bib</button>` : ""}
      </div>
      ${BIB[p.doi] ? `<div class="bib" hidden><button class="bib-copy mono">copy</button><pre class="mono">${esc(BIB[p.doi])}</pre><div class="bib-src mono">source: ${DBLP[p.doi] ? ext(DBLP[p.doi].match(/biburl\s*=\s*\{([^}]*)\.bib\}/)[1], "dblp") : ext("https://doi.org/" + p.doi, "doi.org")}</div></div>` : ""}
    </article>`).join("");
  const entries = (label, list) => !list.length ? "" : `<h3 class="mono">// ${label}</h3>` + list.map((e) => `
    <div class="entry${e.logo ? " has-logo" : ""}">
      ${e.logo ? `<img class="entry-logo" src="logos/${esc(e.logo)}.svg" alt="" aria-hidden="true">` : ""}
      <div><div class="title">${esc(e.title)}</div><div class="sub">${esc(e.org)}${e.note ? " · " + esc(e.note) : ""}</div></div>
      <div class="side mono">${esc(e.years)}<br>${esc(e.place)}</div>
    </div>`).join("");

  // News as a timeline: filter chips by type, a year marker whenever the year changes, the first 5 items shown.
  const NEWS_SHOWN = 5;
  const newsFeed = () => {
    const types = [...new Set(S.news.map((n) => n.type).filter(Boolean))];
    const chips = `<div class="news-filter mono" role="group" aria-label="Filter news">` +
      [["all", S.news.length], ...types.map((t) => [t, S.news.filter((n) => n.type === t).length])]
        .map(([t, c], i) => `<button class="chip t-${t}" data-type="${t}" aria-pressed="${i === 0}">${t} <span>${c}</span></button>`).join("") + "</div>";
    let year = "";
    const items = S.news.map((n, i) => {
      const y = n.date.slice(-4), mark = y !== year ? `<li class="yr-mark mono" data-year="${y}">${y}</li>` : "";
      year = y;
      return mark + `<li class="item" data-type="${esc(n.type || "")}" data-year="${y}"${i >= NEWS_SHOWN ? " hidden" : ""}>
        <span class="when mono">${esc(n.date.replace(/ \d{4}$/, ""))}</span>
        <span class="what">${n.type ? `<span class="tag mono t-${esc(n.type)}">${esc(n.type)}</span>` : ""}${n.url ? ext(n.url, esc(n.text)) : esc(n.text)}</span></li>`;
    }).join("");
    const more = S.news.length > NEWS_SHOWN ? `<button id="log-more" class="more mono">show ${S.news.length - NEWS_SHOWN} older</button>` : "";
    return chips + `<ol class="log">${items}</ol>` + more;
  };

  // dblp entries where dblp has the paper, doi.org entries otherwise.
  const DBLP = window.DBLP_BIBTEX || {};
  const BIB = { ...(window.BIBTEX || {}), ...DBLP };
  const T = S.theses;
  const sections = [
    { id: "about", label: "About", path: "README.md", icon: "M↓", html: S.about.map((p) => `<p>${esc(p)}</p>`).join("") /* + DIAGRAM (hidden for now) */ },
    { id: "news", label: "News", path: "news/feed.log", icon: "≡", html: !S.news.length
      ? `<div class="feed-empty mono"><span class="t-prompt">$ tail -f news/feed.log</span><span>no news yet, check back later</span><span class="cursor"></span></div>`
      : newsFeed() },
    { id: "publications", label: "Publications", path: "research/publications.bib", icon: "{}", html:
      pubs("conference papers", S.conference) + pubs("journal articles", S.journal) +
      pubs("workshop papers", S.workshop) + pubs("book chapters", S.chapters) + pubs("preprints", S.preprints) + citationsBox() },
    { id: "teaching", label: "Teaching", path: "teaching/courses.yaml", icon: "Y", html: S.teaching.map((t) => `
      <div class="course">
        <div class="semester mono">${esc(t.term)}</div>
        <div>
          <div class="title">${esc(t.title)}</div>
          <div class="sub"><span class="kind mono">${esc(t.kind)}</span>${t.level ? ` · ${esc(t.level)}` : ""} · ${esc(t.place)}</div>
          <div class="sub">${esc(t.role)}</div>
        </div>
      </div>`).join("") },
    { id: "experience", label: "Experience", path: "experience.yaml", icon: "Y", html: entries("experience", S.experience) + entries("education", S.education) },
    { id: "theses", label: "Theses", path: "theses/OPEN_POSITIONS.md", icon: "M↓", badge: "open", html: `
      <div class="banner"><span class="pulse"></span><strong>Bachelor's and Master's theses</strong><span class="banner-sub">for students at Heidelberg University</span></div>
      <p>${esc(T.intro)}</p>
      <h3 class="mono">## Before you apply</h3>
      <ul class="checks mono-list">${T.requirements.map((t) => `<li><span class="box mono">[ ]</span>${esc(t)}</li>`).join("")}</ul>
      <p class="muted">${esc(T.note)}</p>
      <a class="cta mono" href="${esc(T.guidelines)}" target="_blank" rel="noopener">$ thesis guidelines ↗</a>` },
  ].filter((s) => s.html.trim());

  $("human").innerHTML = sections.map((s) => `
    <section class="file" id="${s.id}">
      <div class="tab mono"><span class="ic">${s.icon}</span><span class="path-txt">${esc(s.path)}</span>${s.badge ? `<span class="badge">${s.badge}</span>` : ""}</div>
      <div class="body">${s.html}</div>
    </section>`).join("");

  // Top bar: one link per section; the link of the section in view is marked.
  const navIn = document.querySelector(".topnav-in");
  navIn.innerHTML = `<span class="nav-links">` +
    sections.map((s) => `<a href="#${s.id}">${esc(s.label)}</a>`).join("") + "</span>";
  const navLinks = [...navIn.querySelectorAll(".nav-links a")];
  const seen = new Map();
  const markNav = () => {
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const cur = atEnd ? sections[sections.length - 1] : sections.find((s) => seen.get(s.id));
    navLinks.forEach((a) => a.classList.toggle("on", !!cur && a.hash === "#" + cur.id));
  };
  const navObs = new IntersectionObserver((list) => {
    list.forEach((en) => seen.set(en.target.id, en.isIntersecting));
    markNav();
  }, { rootMargin: "-60px 0px -60% 0px" });
  addEventListener("scroll", markNav, { passive: true });
  sections.forEach((s) => navObs.observe(document.getElementById(s.id)));

  // Play the bins and count-up each time the breakdown is opened.
  const citesDetails = document.querySelector(".cites-details");
  citesDetails?.addEventListener("toggle", () => {
    const box = citesDetails.querySelector(".cites");
    box.classList.remove("on");
    if (!citesDetails.open) return;
    void box.offsetWidth;
    box.classList.add("on");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    box.querySelectorAll(".count").forEach((el) => {
      const to = +el.dataset.to, t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  });

  document.querySelectorAll(".bib-btn").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".pub").querySelector(".bib");
    box.hidden = !box.hidden;
    b.setAttribute("aria-expanded", String(!box.hidden));
  }));
  const copyText = async (btn, text) => {
    try { await navigator.clipboard.writeText(text); btn.textContent = "copied"; }
    catch { btn.textContent = "copy failed"; }
    setTimeout(() => (btn.textContent = "copy"), 1500);
  };
  document.querySelectorAll(".bib-copy").forEach((b) => b.addEventListener("click", () => copyText(b, b.nextElementSibling.textContent)));
  // News: show only one type, or all; year markers without visible items are hidden.
  const newsLog = document.querySelector(".log");
  let newsType = "all", newsAll = false;
  const showNews = () => {
    let shownCount = 0;
    newsLog.querySelectorAll(".item").forEach((li) => {
      const match = newsType === "all" || li.dataset.type === newsType;
      li.hidden = !match || (newsType === "all" && !newsAll && shownCount >= NEWS_SHOWN);
      if (match) shownCount++;
    });
    newsLog.querySelectorAll(".yr-mark").forEach((m) => {
      m.hidden = ![...newsLog.querySelectorAll(`.item[data-year="${m.dataset.year}"]`)].some((li) => !li.hidden);
    });
    const more = $("log-more");
    if (more) more.hidden = newsAll || newsType !== "all";
  };
  if (newsLog) {
    showNews();
    document.querySelectorAll(".news-filter .chip").forEach((c) => c.addEventListener("click", () => {
      newsType = c.dataset.type;
      document.querySelectorAll(".news-filter .chip").forEach((o) => o.setAttribute("aria-pressed", String(o === c)));
      showNews();
    }));
    $("log-more")?.addEventListener("click", () => { newsAll = true; showNews(); });
  }

  // ---------- Command palette (⌘K, Ctrl+K or /) ----------
  const allPubs = [...S.conference, ...S.journal, ...S.workshop, ...S.chapters, ...S.preprints];
  const go = (id) => () => $(id).scrollIntoView({ behavior: "smooth" });
  const open = (url) => () => window.open(url, "_blank", "noopener");
  const commands = [
    ...sections.map((s) => ({ label: `open ${s.path}`, hint: "section", run: go(s.id) })),
    { label: "open llms.txt (plain-text version for AI agents)", hint: "link", run: open("llms.txt") },
    { label: "open thesis guidelines", hint: "link", run: open(T.guidelines) },
    { label: "copy email address", hint: "copy", run: () => navigator.clipboard?.writeText(S.contact.find((c) => c.key === "Email").value) },
    { label: "copy all BibTeX", hint: "copy", run: () => navigator.clipboard?.writeText(Object.values(BIB).join("\n\n")) },
    { label: "open Google Scholar", hint: "link", run: open(S.links.scholar) },
    { label: "open GitHub", hint: "link", run: open(S.links.github) },
    { label: "open LinkedIn", hint: "link", run: open(S.links.linkedin) },
    ...allPubs.map((p) => ({ label: p.title, hint: p.venue.replace(/ \(.*\)$/, ""), run: open(p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : "https://doi.org/" + p.doi) })),
    ...allPubs.filter((p) => BIB[p.doi]).map((p) => ({ label: `copy bibtex: ${p.title}`, hint: "copy", run: () => navigator.clipboard?.writeText(BIB[p.doi]) })),
  ];
  const pal = $("palette"), input = $("pal-input"), list = $("pal-list");
  let shown = [], sel = 0, lastFocus = null;
  const render = () => {
    const q = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    shown = commands.filter((c) => q.every((w) => (c.label + " " + c.hint).toLowerCase().includes(w))).slice(0, 12);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((c, i) =>
      `<li role="option" id="pal-${i}" aria-selected="${i === sel}" data-i="${i}"><span>${esc(c.label)}</span><span class="hint">${esc(c.hint)}</span></li>`).join("")
      : `<li class="none">no match</li>`;
    input.setAttribute("aria-activedescendant", shown.length ? `pal-${sel}` : "");
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  };
  const openPal = () => { lastFocus = document.activeElement; pal.hidden = false; input.value = ""; sel = 0; render(); input.focus(); };
  const closePal = () => { pal.hidden = true; lastFocus?.focus?.(); };
  const runSel = (i) => { const c = shown[i]; if (!c) return; closePal(); c.run(); };
  document.addEventListener("keydown", (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName);
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing && pal.hidden)) { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
  });
  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === "Enter") { e.preventDefault(); runSel(sel); }
    else if (e.key === "Escape") { e.preventDefault(); closePal(); }
  });
  list.addEventListener("click", (e) => { const li = e.target.closest("li[data-i]"); if (li) runSel(+li.dataset.i); });
  pal.addEventListener("click", (e) => { if (e.target === pal) closePal(); });

  // ---------- Scroll animations (each runs once, when a section first comes into view) ----------
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    document.body.classList.add("anim");
    const files = [...document.querySelectorAll("#human .file")];

    // Entries inside a section appear one after another.
    files.forEach((sec) => sec.querySelectorAll(".pub, .course, .entry, .checks li, .log li, .body > h3, .banner, .cta, .feed-empty")
      .forEach((el, i) => { el.classList.add("rise"); el.style.setProperty("--i", Math.min(i, 12)); }));

    // README diagram builds up: input files, the dots, arrows, agent, code, then the problems.
    const svg = document.querySelector(".diagram svg");
    if (svg) {
      const order = [".d-file:not(.d-code)", ".d-more", ".d-flow", ".d-agent", ".d-code", ".d-pulses", ".d-conflict, .d-drift, .d-warn, .d-bad"];
      let step = 0;
      order.forEach((sel) => {
        const els = [...svg.querySelectorAll(sel)];
        const each = sel === ".d-file:not(.d-code)";
        els.forEach((el) => { el.dataset.step = ""; el.style.setProperty("--s", step); if (each) step++; });
        if (!each) step++;
      });
    }

    // The file name in each tab header types itself out.
    const tabs = files.map((sec) => { const t = sec.querySelector(".path-txt"); t.dataset.full = t.textContent; t.textContent = ""; return t; });
    const typeTab = (t) => {
      let i = 0;
      t.classList.add("typing");
      const tick = () => { t.textContent = t.dataset.full.slice(0, ++i); i < t.dataset.full.length ? setTimeout(tick, 28) : t.classList.remove("typing"); };
      tick();
    };

    const io = new IntersectionObserver((items) => {
      for (const it of items) {
        if (!it.isIntersecting) continue;
        const sec = it.target;
        io.unobserve(sec);
        sec.classList.add("in");
        typeTab(tabs[files.indexOf(sec)]);
        // Thesis checklist ticks itself off.
        sec.querySelectorAll(".checks .box").forEach((b, i) => setTimeout(() => { b.textContent = "[✓]"; b.classList.add("done"); }, 900 + i * 380));
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    files.forEach((sec) => io.observe(sec));
  }

  // ---------- README diagram: tilts toward the pointer, like a board lying on a table ----------
  const dg = document.querySelector(".diagram");
  if (dg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover)").matches) {
    dg.addEventListener("pointermove", (e) => {
      const b = dg.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      dg.style.setProperty("--dx", `${(22 - y * 12).toFixed(2)}deg`);
      dg.style.setProperty("--dy", `${(x * 12).toFixed(2)}deg`);
    });
    dg.addEventListener("pointerleave", () => { dg.style.removeProperty("--dx"); dg.style.removeProperty("--dy"); });
  }

  // ---------- Business card: tilts slightly toward the pointer ----------
  const card = $("vcard");
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(hover: hover)").matches) {
    card.addEventListener("pointermove", (e) => {
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      card.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(0)}%`);
      card.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(0)}%`);
    });
    card.addEventListener("pointerleave", () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
  }

  // Sections are rendered by this script, so jump to a #hash link after rendering.
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
