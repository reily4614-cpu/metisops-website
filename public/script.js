const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");
let w, h, pts;

function resize() {
  w = canvas.width = innerWidth * devicePixelRatio;
  h = canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  pts = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - .5) * .22 * devicePixelRatio,
    vy: (Math.random() - .5) * .22 * devicePixelRatio
  }));
}
resize();
addEventListener("resize", resize);

function draw() {
  ctx.clearRect(0, 0, w, h);
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
  });
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 150 * devicePixelRatio) {
        ctx.strokeStyle = `rgba(214,162,74,${(1 - d / (150 * devicePixelRatio)) * .12})`;
        ctx.lineWidth = .7 * devicePixelRatio;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  pts.forEach(p => {
    ctx.fillStyle = "rgba(255,211,124,.45)";
    ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 * devicePixelRatio, 0, Math.PI * 2); ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

// Duplicate marquee tracks for a seamless infinite loop (skipped when reduced motion is preferred)
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion) {
  document.querySelectorAll(".tech-track").forEach(track => {
    const items = Array.from(track.children);
    items.forEach(item => {
      const copy = item.cloneNode(true);
      copy.classList.add("clone");
      copy.setAttribute("aria-hidden", "true");
      track.appendChild(copy);
    });
  });
}

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: .13 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const WEB3FORMS_ACCESS_KEY = "4bafc66e-62e5-4a9d-a44e-0da53c75b2e0";

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector("button");
  const original = btn.textContent;

  btn.disabled = true;
  btn.textContent = "Sending…";

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: "New MetisOps inquiry",
    from_name: "MetisOps Website",
    ...Object.fromEntries(new FormData(form).entries()),
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      form.reset();
      btn.textContent = "Sent ✓";
    } else {
      btn.textContent = "Error — try again";
    }
  } catch (err) {
    btn.textContent = "Error — try again";
  } finally {
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 2800);
  }
});
