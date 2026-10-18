// effects.js — black & white background effects
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; // be kind to users who disabled motion
  }

  /* ---------- 1. Particle canvas ---------- */
  const canvas = document.createElement("canvas");
  canvas.id = "fx-canvas";
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0, particles = [];

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width  = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    spawnParticles();
  }

  function spawnParticles() {
    const count = Math.min(90, Math.floor((w * h) / 24000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r:  Math.random() * 1.3 + 0.3,
        a:  Math.random() * 0.55 + 0.15,
      });
    }
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0, ready: false };
  window.addEventListener("mousemove", (e) => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
    if (!mouse.ready) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.ready = true; }
  });

  function draw() {
    ctx.clearRect(0, 0, w, h);

    if (mouse.ready) {
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      let boost = 0;
      if (mouse.ready) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) boost = (1 - d2 / 26000) * 0.75;
      }

      const alpha = Math.min(1, p.a + boost);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + boost * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
      ctx.fill();
    }

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          const alpha = (1 - d2 / 14000) * 0.14;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(255,255,255," + alpha + ")";
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();

  /* ---------- 2. Mouse spotlight ---------- */
  const spot = document.createElement("div");
  spot.style.cssText = [
    "position:fixed", "inset:0", "pointer-events:none", "z-index:1",
    "background:radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.07), transparent 65%)",
    "transition:background 0.08s linear",
  ].join(";");
  document.body.prepend(spot);

  window.addEventListener("mousemove", (e) => {
    const px = (e.clientX / window.innerWidth)  * 100;
    const py = (e.clientY / window.innerHeight) * 100;
    spot.style.setProperty("--mx", px + "%");
    spot.style.setProperty("--my", py + "%");
  });

  /* ---------- 3. Film grain overlay ---------- */
  const noise = document.createElement("div");
  noise.style.cssText = [
    "position:fixed", "inset:0", "pointer-events:none", "z-index:999",
    "opacity:0.05", "mix-blend-mode:screen",
    'background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
  ].join(";");
  document.body.appendChild(noise);
})();
