// Live background: a Claude Code session and a GitHub Copilot session, each wired to the
// configuration mechanisms that AgentTorrent (se-uhd.de/agenttorrent) records in repositories:
// context files, skills, settings, rules, subagents, MCP, hooks, plugins, commands and LSP.
// Each session fixes one issue in the lifecycle order the tool follows. Nodes and arrows appear
// as the session first uses them. An arrow points the way the first message travels: into the
// agent for what it reads, out of it for what it calls. A log in the corner narrates each step.
// When the commit lands, the session fades and a new one starts with another issue.
// Pulse colors: blue = read, green = call, purple = result. Reduced motion: one finished session.
(() => {
  const cv = document.getElementById("bg");
  const ctx = cv?.getContext?.("2d");
  if (!ctx) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MONO = "'JetBrains Mono', ui-monospace, monospace";

  // [category label, group]: group 0 = configuration the tool reads (page), 1 = capability it
  // calls (diamond), 2 = what the session does or writes (dot).
  const CAT = {
    context: ["context file", 0], rules: ["rule", 0], commands: ["command", 0], settings: ["settings", 0],
    skills: ["skill", 1], subagents: ["subagent", 1], mcp: ["MCP server", 1], hooks: ["hook", 1],
    plugins: ["plugin", 1], lsp: ["LSP server", 1],
    tool: ["tool call", 2], plan: ["planning document", 2], commit: ["commit", 2],
  };
  const KIND = { call: 0, read: 1, result: 2 };
  const MARK = { call: "→", read: "←", result: "↩" };

  // nodes: id → [label, category, angle in degrees (0 = right, 90 = down), distance from the agent]
  // script: [from, to, kind, log line, condition]. The condition is a probability, or the id of a
  // node that an earlier step must have brought in. {x} fills from the session's task.
  const TOOLS = {
    claude: {
      name: "Claude Code",
      nodes: {
        settings: [".claude/settings.json", "settings", 196, 1],
        plugin: ["{plugin} plugin", "plugins", 218, 1.75],
        lsp: ["typescript-language-server", "lsp", 240, 1.45],
        pre: ["PreToolUse", "hooks", 262, 1],
        post: ["PostToolUse", "hooks", 292, 1.05],
        agentsmd: ["AGENTS.md", "context", 150, 1.75],
        claudemd: ["CLAUDE.md", "context", 166, 1.05],
        rules: [".claude/rules/{area}.md", "rules", 128, 1.1],
        cmd: [".claude/commands/fix-issue.md", "commands", 98, 1],
        mcp: ["github (.mcp.json)", "mcp", 322, 1.15],
        sub: [".claude/agents/explorer.md", "subagents", 350, 1.05],
        skill: [".claude/skills/{skill}/SKILL.md", "skills", 22, 1.15],
        plan: ["specs/fix-{n}/plan.md", "plan", 52, 1.05],
        edit: ["Edit {file}", "tool", 330, 1.5],
        bash: ["Bash: npm test", "tool", 70, 1.3],
        commit: ["{hash} Co-Authored-By: Claude", "commit", 40, 1.8],
      },
      config: [["settings", "pre"], ["settings", "post"]], // hooks are defined in settings.json
      script: [
        ["settings", "agent", "read", "SessionStart: load .claude/settings.json"],
        ["settings", "plugin", "read", "enabledPlugins: {plugin}", 0.75],
        ["plugin", "lsp", "call", "{plugin} starts typescript-language-server", "plugin"],
        ["agentsmd", "claudemd", "read", "CLAUDE.md imports @AGENTS.md", 0.7],
        ["claudemd", "agent", "read", "CLAUDE.md loaded into context"],
        ["cmd", "agent", "read", "user: /fix-issue {n}"],
        ["agent", "mcp", "call", "mcp__github__get_issue({n})", 0.85],
        ["mcp", "agent", "result", "issue #{n}: {bug}", "mcp"],
        ["agent", "sub", "call", "delegate the search to the explorer subagent", 0.75],
        ["sub", "agent", "result", "explorer: the cause is in {file}", "sub"],
        ["agent", "plan", "call", "write specs/fix-{n}/plan.md", 0.65],
        ["rules", "agent", "read", "path src/{area}/** matches .claude/rules/{area}.md"],
        ["agent", "pre", "call", "PreToolUse hook runs before Edit"],
        ["pre", "agent", "result", "hook exits 0: edit allowed"],
        ["agent", "edit", "call", "Edit {file}"],
        ["agent", "post", "call", "PostToolUse hook: prettier --write"],
        ["lsp", "agent", "result", "LSP diagnostics: 0 errors", "lsp"],
        ["skill", "agent", "read", "skill {skill} loaded on demand", 0.65],
        ["agent", "bash", "call", "Bash: npm test"],
        ["bash", "agent", "result", "{tests} tests passed"],
        ["agent", "commit", "call", "git commit {hash}, Co-Authored-By: Claude"],
      ],
    },
    copilot: {
      name: "GitHub Copilot",
      nodes: {
        settings: [".vscode/settings.json", "settings", 196, 1],
        hooks: [".github/hooks/guard.json", "hooks", 262, 1],
        agentsmd: ["AGENTS.md", "context", 150, 1.75],
        instr: [".github/copilot-instructions.md", "context", 166, 1.05],
        rules: [".github/instructions/{area}.instructions.md", "rules", 128, 1.1],
        prompt: [".github/prompts/fix-issue.prompt.md", "commands", 98, 1],
        mcp: ["github (.vscode/mcp.json)", "mcp", 322, 1.15],
        sub: [".github/agents/planner.agent.md", "subagents", 350, 1.05],
        skill: [".github/skills/{skill}/SKILL.md", "skills", 22, 1.15],
        plan: ["specs/fix-{n}/plan.md", "plan", 52, 1.05],
        edit: ["editFiles {file}", "tool", 330, 1.5],
        term: ["runInTerminal: npm test", "tool", 70, 1.3],
        commit: ["{hash} Co-authored-by: Copilot", "commit", 40, 1.8],
      },
      config: [],
      script: [
        ["settings", "agent", "read", "load .vscode/settings.json"],
        ["instr", "agent", "read", "read .github/copilot-instructions.md"],
        ["agentsmd", "agent", "read", "read AGENTS.md", 0.7],
        ["prompt", "agent", "read", "user: /fix-issue {n}"],
        ["agent", "mcp", "call", "github: get_issue #{n}", 0.85],
        ["mcp", "agent", "result", "issue #{n}: {bug}", "mcp"],
        ["agent", "sub", "call", "hand off to the planner agent", 0.75],
        ["sub", "plan", "call", "planner writes specs/fix-{n}/plan.md", "sub"],
        ["plan", "agent", "read", "plan.md comes back to the agent", "sub"],
        ["rules", "agent", "read", "applyTo src/{area}/** adds {area}.instructions.md"],
        ["agent", "hooks", "call", "preToolUse hook runs before editFiles"],
        ["hooks", "agent", "result", "hook: allow"],
        ["agent", "edit", "call", "editFiles {file}"],
        ["skill", "agent", "read", "skill {skill} loaded on demand", 0.65],
        ["agent", "term", "call", "runInTerminal: npm test"],
        ["term", "agent", "result", "{tests} tests passed"],
        ["agent", "commit", "call", "git commit {hash}, Co-authored-by: Copilot"],
      ],
    },
  };
  const TASKS = [
    { area: "api", file: "src/api/users.ts", bug: "500 on an empty name" },
    { area: "auth", file: "src/auth/session.ts", bug: "session expires too early" },
    { area: "db", file: "src/db/migrate.ts", bug: "migration runs twice" },
    { area: "ui", file: "src/ui/table.tsx", bug: "table loses its sort order" },
  ];

  const STEP = 1.15, GAP = 0.5, GROW = 0.45; // seconds per message, pause before it, arrow draw-in
  let W = 0, H = 0, dpr = 1, scenes = [], colors = [], muted = "", last = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[(Math.random() * a.length) | 0];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const backOut = (x) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = ["--accent", "--accent-2", "--accent-3"].map((v) => s.getPropertyValue(v).trim());
    muted = s.getPropertyValue("--muted").trim();
  };

  const newSession = (sc) => {
    const def = TOOLS[sc.tool];
    const v = { ...pick(TASKS), n: 100 + ((Math.random() * 900) | 0), skill: pick(["changelog", "api-docs", "release-notes"]),
      plugin: pick(["ts-tools", "web-dev"]), tests: 24 + ((Math.random() * 120) | 0), hash: Math.random().toString(16).slice(2, 9) };
    const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);
    const used = new Set(["agent"]);
    sc.steps = [];
    for (const [a, b, kind, log, cond] of def.script) {
      if (typeof cond === "number" && Math.random() > cond) continue;
      if (typeof cond === "string" && !used.has(cond)) continue;
      used.add(a); used.add(b);
      sc.steps.push({ a, b, kind, log: fill(log) });
    }
    sc.fill = fill; sc.def = def;
    sc.nodes = { agent: { id: "agent", born: 0, hit: -9 } };
    sc.edges = []; sc.ripples = []; sc.log = [];
    sc.i = 0; sc.t = -1; sc.clock = 0; sc.phase = "run"; sc.wait = 0; sc.alpha = 0;
    sc.session = (sc.session || 0) + 1;
  };

  const addNode = (sc, id) => {
    if (sc.nodes[id]) return;
    const [label, cat, ang, dist] = sc.def.nodes[id];
    let text = sc.fill(label);
    if (W < 700 && !text.includes(" ")) text = text.split("/").slice(text.endsWith("SKILL.md") ? -2 : -1).join("/"); // phones: file name only
    sc.nodes[id] = { id, label: text, cat, ang, dist, born: sc.clock, hit: -9 };
    for (const [a, b] of sc.def.config) if (sc.nodes[a] && sc.nodes[b]) addEdge(sc, a, b, true);
  };
  const addEdge = (sc, a, b, dashed = false) => {
    if (!sc.edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))) sc.edges.push({ a, b, dashed, born: sc.clock });
  };
  const begin = (sc, st) => {
    addNode(sc, st.a); addNode(sc, st.b); addEdge(sc, st.a, st.b);
    sc.log.push({ text: st.log, kind: st.kind, born: sc.clock });
    if (sc.log.length > 5) sc.log.shift();
  };

  const setup = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const want = W >= 900 ? ["claude", "copilot"] : [scenes[0]?.tool || pick(["claude", "copilot"])];
    if (scenes.map((s) => s.tool).join() !== want.join()) {
      scenes = want.map((tool) => { const sc = { tool }; newSession(sc); return sc; });
      if (still) for (const sc of scenes) { sc.steps.forEach((st) => begin(sc, st)); sc.clock = 60; sc.phase = "hold"; sc.alpha = 1; sc.i = sc.steps.length; }
    }
    if (scenes.length === 2) {
      const rx = W * 0.12, ry = H * 0.28;
      Object.assign(scenes[0], { cx: W * 0.25, cy: H * 0.5, rx, ry, flip: false, side: "left" });
      Object.assign(scenes[1], { cx: W * 0.75, cy: H * 0.5, rx, ry, flip: true, side: "right" });
    } else Object.assign(scenes[0], { cx: W / 2, cy: H * 0.5, rx: W * 0.27, ry: H * 0.26, flip: false, side: "left" });
  };

  const pos = (sc, n) => {
    if (n.id === "agent") return { x: sc.cx, y: sc.cy };
    const a = (n.ang * Math.PI) / 180, k = sc.flip ? -1 : 1;
    const wob = Math.sin(sc.clock * 0.4 + n.ang) * 3;
    return { x: clamp(sc.cx + k * Math.cos(a) * sc.rx * n.dist + wob, 14, W - 14), y: clamp(sc.cy + Math.sin(a) * sc.ry * n.dist + wob, 20, H - 40) };
  };
  const trim = (p, q, g1, g2) => {
    const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    return { x1: p.x + ux * g1, y1: p.y + uy * g1, x2: q.x - ux * g2, y2: q.y - uy * g2, ux, uy };
  };
  const gap = (n) => (n.id === "agent" ? 14 : 9);

  const update = (sc, dt) => {
    sc.clock += dt;
    if (sc.phase === "run") {
      sc.alpha = Math.min(1, sc.alpha + dt / 0.8);
      const st = sc.steps[sc.i];
      if (sc.t === -1) { begin(sc, st); sc.t = -GAP / STEP; }
      sc.t += dt / STEP;
      if (sc.t >= 1) {
        const n = sc.nodes[st.b];
        n.hit = sc.clock;
        sc.ripples.push({ n, born: sc.clock, c: KIND[st.kind], big: st.b === "commit" });
        sc.i++; sc.t = -1;
        if (sc.i >= sc.steps.length) { sc.phase = "hold"; sc.wait = 4; }
      }
    } else if (sc.phase === "hold") {
      if (!still && (sc.wait -= dt) <= 0) sc.phase = "fade";
    } else if ((sc.alpha -= dt / 1.4) <= 0) {
      if (scenes.length === 1) sc.tool = sc.tool === "claude" ? "copilot" : "claude";
      newSession(sc);
    }
  };

  const drawScene = (sc) => {
    const A = sc.alpha, c = sc.clock;
    const P = {};
    for (const id in sc.nodes) P[id] = pos(sc, sc.nodes[id]);

    // the harness: a slow dashed orbit around the agent, and the session's progress on it
    ctx.globalAlpha = 0.13 * A; ctx.strokeStyle = muted; ctx.lineWidth = 1;
    ctx.setLineDash([2, 7]); ctx.lineDashOffset = -c * 6;
    ctx.beginPath(); ctx.ellipse(sc.cx, sc.cy, sc.rx * 0.55, sc.ry * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    const done = sc.i / sc.steps.length;
    ctx.globalAlpha = 0.55 * A; ctx.strokeStyle = colors[0]; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sc.cx, sc.cy, 18, -Math.PI / 2, -Math.PI / 2 + done * Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 1;

    // arrows grow out of their source when first used
    for (const e of sc.edges) {
      const g = trim(P[e.a], P[e.b], gap(sc.nodes[e.a]), gap(sc.nodes[e.b]));
      const p = clamp((c - e.born) / GROW, 0, 1);
      const x2 = g.x1 + (g.x2 - g.x1) * p, y2 = g.y1 + (g.y2 - g.y1) * p;
      ctx.globalAlpha = (e.dashed ? 0.22 : 0.34) * A; ctx.strokeStyle = muted; ctx.fillStyle = muted;
      if (e.dashed) ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(g.x1, g.y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);
      if (p === 1 && !e.dashed) {
        ctx.beginPath(); ctx.moveTo(g.x2, g.y2);
        ctx.lineTo(g.x2 - g.ux * 6 - g.uy * 3, g.y2 - g.uy * 6 + g.ux * 3);
        ctx.lineTo(g.x2 - g.ux * 6 + g.uy * 3, g.y2 - g.uy * 6 - g.ux * 3);
        ctx.fill();
      }
    }

    // the message in flight, with a short trail
    const st = sc.steps[sc.i];
    if (sc.phase === "run" && st && sc.t > 0) {
      const g = trim(P[st.a], P[st.b], gap(sc.nodes[st.a]), gap(sc.nodes[st.b]));
      const at = (t) => ({ x: g.x1 + (g.x2 - g.x1) * t, y: g.y1 + (g.y2 - g.y1) * t });
      const e = 1 - (1 - sc.t) ** 2, h = at(e), tl = at(Math.max(0, e - 0.25));
      const col = colors[KIND[st.kind]];
      const gr = ctx.createLinearGradient(tl.x, tl.y, h.x, h.y);
      gr.addColorStop(0, "transparent"); gr.addColorStop(1, col);
      ctx.globalAlpha = 0.9 * A; ctx.strokeStyle = gr; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(h.x, h.y); ctx.stroke();
      ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(h.x, h.y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }

    sc.ripples = sc.ripples.filter((r) => {
      const t = (c - r.born) / (r.big ? 1.6 : 0.9);
      if (t >= 1) return false;
      const p = pos(sc, r.n);
      ctx.globalAlpha = (1 - t) * 0.6 * A; ctx.strokeStyle = colors[r.c];
      for (let k = 0; k < (r.big ? 3 : 1); k++) {
        const tt = t - k * 0.15;
        if (tt > 0) { ctx.beginPath(); ctx.arc(p.x, p.y, 6 + tt * (r.big ? 34 : 14), 0, Math.PI * 2); ctx.stroke(); }
      }
      return true;
    });

    // nodes and their labels, with the AgentTorrent mechanism underneath
    for (const id in sc.nodes) {
      const n = sc.nodes[id], p = P[id];
      const s = backOut(clamp((c - n.born) / 0.5, 0, 1)), flash = Math.max(0, 1 - (c - n.hit) / 0.8);
      if (id === "agent") {
        const r = 5 + Math.sin(c * 2.2) * 0.7 + flash * 2;
        ctx.globalAlpha = A; ctx.fillStyle = colors[0]; ctx.shadowColor = colors[0]; ctx.shadowBlur = 14 + flash * 10;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.25 * A; ctx.strokeStyle = colors[0];
        ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.7 * A; ctx.fillStyle = muted; ctx.textAlign = "center";
        ctx.font = `600 12px ${MONO}`; ctx.fillText(sc.def.name, p.x, p.y + 34);
        continue;
      }
      const [catName, group] = CAT[n.cat], col = colors[group === 0 ? 1 : group === 1 ? 2 : 0];
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s, s);
      ctx.globalAlpha = (0.75 + flash * 0.25) * A; ctx.strokeStyle = col; ctx.fillStyle = col;
      if (flash) { ctx.shadowColor = col; ctx.shadowBlur = 12 * flash; }
      if (group === 0) { ctx.strokeRect(-3.5, -4.5, 7, 9); ctx.beginPath(); ctx.moveTo(-1.5, -1.5); ctx.lineTo(1.5, -1.5); ctx.moveTo(-1.5, 1); ctx.lineTo(1.5, 1); ctx.stroke(); }
      else if (group === 1) { ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 0); ctx.lineTo(0, 5); ctx.lineTo(-5, 0); ctx.closePath(); ctx.stroke(); }
      else if (n.cat === "commit") { ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-4, 0); ctx.moveTo(4, 0); ctx.lineTo(9, 0); ctx.stroke(); }
      else { ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore(); ctx.shadowBlur = 0;

      ctx.font = `400 10px ${MONO}`;
      const half = Math.max(ctx.measureText(n.label).width, ctx.measureText(catName).width) / 2;
      const lx = clamp(p.x, 6 + half, W - 6 - half);
      ctx.textAlign = "center";
      ctx.globalAlpha = (0.45 + flash * 0.3) * A * Math.min(1, s); ctx.fillStyle = muted;
      ctx.fillText(n.label, lx, p.y + 17);
      ctx.font = `400 9px ${MONO}`; ctx.globalAlpha = 0.3 * A * Math.min(1, s); ctx.fillStyle = col;
      ctx.fillText(catName, lx, p.y + 28);
    }

    // session log in the corner; left out on phones, where it would sit under the text
    if (W < 700) return;
    const left = sc.side === "left", x = left ? 18 : W - 18;
    ctx.textAlign = left ? "left" : "right";
    const lines = sc.log.slice(-5);
    lines.forEach((l, k) => {
      const y = H - 20 - (lines.length - 1 - k) * 15, age = lines.length - 1 - k;
      const shown = still ? l.text : l.text.slice(0, Math.floor((c - l.born) * 55));
      ctx.font = `400 10px ${MONO}`;
      ctx.globalAlpha = (age === 0 ? 0.75 : 0.5 - age * 0.08) * A;
      const mark = MARK[l.kind] + " ";
      if (left) {
        ctx.fillStyle = colors[KIND[l.kind]]; ctx.fillText(mark, x, y);
        ctx.fillStyle = muted; ctx.fillText(shown, x + ctx.measureText(mark).width, y);
      } else {
        ctx.fillStyle = muted; ctx.fillText(shown, x, y);
        ctx.fillStyle = colors[KIND[l.kind]]; ctx.fillText(mark, x - ctx.measureText(shown).width, y);
      }
    });
    ctx.font = `600 10px ${MONO}`; ctx.globalAlpha = 0.6 * A; ctx.fillStyle = colors[0];
    ctx.fillText(`● ${sc.def.name} · session ${sc.session} · ${sc.i}/${sc.steps.length}`, x, H - 20 - 5 * 15 - 4);
  };

  const draw = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (const sc of scenes) { if (!still) update(sc, dt); drawScene(sc); }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
    if (!still) requestAnimationFrame(draw);
  };

  readColors(); setup();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { setup(); if (still) draw(0); }, 150); });
  matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => { readColors(); if (still) draw(0); });
  requestAnimationFrame(draw);
})();
