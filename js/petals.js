/**
 * Matrix-style falling cherry blossom petals (🌸)
 */
(function initPetals() {
  const layer = document.getElementById("petal-layer");
  if (!layer) return;

  const PETAL = "🌸";
  const MAX_PETALS = 48;
  const SPAWN_INTERVAL_MS = 280;

  const petals = [];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createPetal() {
    if (petals.length >= MAX_PETALS) return;

    const el = document.createElement("span");
    el.className = "petal";
    el.textContent = PETAL;
    el.setAttribute("aria-hidden", "true");

    const size = randomBetween(0.9, 1.6);
    const startX = randomBetween(0, 100);
    const duration = randomBetween(6, 14);
    const delay = randomBetween(0, 2);
    const drift = randomBetween(-80, 80);
    const spin = randomBetween(-720, 720);
    const opacity = randomBetween(0.35, 0.85);

    el.style.setProperty("--petal-size", `${size}rem`);
    el.style.setProperty("--petal-opacity", String(opacity));
    el.style.left = `${startX}%`;

    layer.appendChild(el);

    const petal = {
      el,
      startY: -40,
      drift,
      spin,
      duration: duration * 1000,
      delay: delay * 1000,
      spawnedAt: performance.now(),
    };

    petals.push(petal);
  }

  function tick(now) {
    const viewH = window.innerHeight;

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      const elapsed = now - p.spawnedAt - p.delay;

      if (elapsed < 0) continue;

      const t = Math.min(elapsed / p.duration, 1);
      const y = p.startY + t * (viewH + 80);
      const x = p.drift * Math.sin(t * Math.PI * 2);
      const rot = p.spin * t;

      p.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;

      if (t >= 1) {
        p.el.remove();
        petals.splice(i, 1);
      }
    }

    requestAnimationFrame(tick);
  }

  createPetal();
  setInterval(createPetal, SPAWN_INTERVAL_MS);
  requestAnimationFrame(tick);

  window.addEventListener("resize", () => {
    /* petals recalc on next frame via innerHeight */
  });
})();
