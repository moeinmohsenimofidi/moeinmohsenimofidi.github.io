// Live background: a slow network of agent nodes. Nearby nodes are linked, small pulses
// travel along the links like messages between agents, and a node ripples when one arrives.
// Kept faint on purpose; with reduced motion it draws a single still frame.
(() => {
  const cv = document.getElementById("bg");
  const ctx = cv?.getContext?.("2d");
  if (!ctx) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LABELS = ["AGENTS.md", "CLAUDE.md", "SKILL.md", ".cursorrules", "copilot-instructions.md", "settings.json", "tool_call()", "plan.md", "git diff", "mcp.json"];
  let W = 0, H = 0, dpr = 1, link = 150, nodes = [], pulses = [], ripples = [], colors = [], muted = "", last = 0, nextPulse = 0;

  const readColors = () => {
    const s = getComputedStyle(document.documentElement);
    colors = ["--accent", "--accent-2", "--accent-3"].map((v) => s.getPropertyValue(v).trim());
    muted = s.getPropertyValue("--muted").trim();
  };
  const rand = (a, b) => a + Math.random() * (b - a);

  const setup = () => {
    const sameWidth = W === innerWidth;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (sameWidth && nodes.length) return; // phone address bar showing or hiding: keep the nodes where they are
    link = Math.max(110, Math.min(170, W / 8));
    const n = Math.round(Math.max(16, Math.min(64, (W * H) / 24000)));
    const labels = [...LABELS].sort(() => Math.random() - 0.5);
    nodes = Array.from({ length: n }, (_, i) => ({
      x: rand(0, W), y: rand(0, H), vx: rand(-9, 9), vy: rand(-9, 9), // px per second
      r: rand(1.4, 2.6), c: i % 3, label: i % 5 === 0 ? labels[(i / 5) % labels.length] : null,
    }));
    pulses = []; ripples = [];
  };

  const neighbours = (a) => nodes.filter((b) => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < link);

  const draw = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    ctx.clearRect(0, 0, W, H);

    for (const p of nodes) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }

    // links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > link) continue;
      ctx.globalAlpha = (1 - d / link) * 0.5;
      ctx.strokeStyle = muted;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // start a new message between two linked nodes now and then
    if (!still && t > nextPulse) {
      nextPulse = t + rand(250, 700);
      const a = nodes[(Math.random() * nodes.length) | 0], nb = neighbours(a);
      if (nb.length) pulses.push({ a, b: nb[(Math.random() * nb.length) | 0], t: 0, dur: rand(1.1, 1.9), c: a.c });
    }
    pulses = pulses.filter((m) => {
      m.t += dt / m.dur;
      if (m.t >= 1) { ripples.push({ x: m.b.x, y: m.b.y, t: 0, c: m.c }); return false; }
      if (Math.hypot(m.a.x - m.b.x, m.a.y - m.b.y) > link * 1.15) return false; // the link broke
      const x = m.a.x + (m.b.x - m.a.x) * m.t, y = m.a.y + (m.b.y - m.a.y) * m.t;
      ctx.globalAlpha = 0.9; ctx.fillStyle = colors[m.c];
      ctx.shadowColor = colors[m.c]; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      return true;
    });
    ripples = ripples.filter((r) => {
      r.t += dt / 0.9;
      if (r.t >= 1) return false;
      ctx.globalAlpha = (1 - r.t) * 0.5; ctx.strokeStyle = colors[r.c];
      ctx.beginPath(); ctx.arc(r.x, r.y, 3 + r.t * 14, 0, Math.PI * 2); ctx.stroke();
      return true;
    });

    // nodes and their file names
    ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
    for (const p of nodes) {
      ctx.globalAlpha = 0.7; ctx.fillStyle = colors[p.c];
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      if (p.label) { ctx.globalAlpha = 0.4; ctx.fillStyle = muted; ctx.fillText(p.label, p.x + 7, p.y + 3.5); }
    }
    ctx.globalAlpha = 1;
    if (!still) requestAnimationFrame(draw);
  };

  readColors(); setup();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { setup(); if (still) draw(0); }, 150); });
  matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => { readColors(); if (still) draw(0); });
  requestAnimationFrame(draw);
})();
