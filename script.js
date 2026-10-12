/* ==========================================================
   Pinar Carkci – portfolio
   1. Starry sky      2. The cat         3. Mobile menu
   4. Project filter  5. Card glow       6. Scroll reveal
   ========================================================== */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Starry sky ---------- */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];
let shootingStar = null;

function buildSky() {
  // draw sharp on high-resolution screens
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  // more stars on bigger screens
  const count = Math.round((window.innerWidth * window.innerHeight) / 7000);
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() < 0.9 ? Math.random() * 1.1 + 0.3 : Math.random() * 1.2 + 1.3,
      phase: Math.random() * Math.PI * 2,   // where in its twinkle the star starts
      speed: Math.random() * 1.2 + 0.4,     // how fast it twinkles
      tint: Math.random() < 0.18 ? "#CDBBFF" : "#FFFFFF"
    });
  }
}

function drawSky(time) {
  const seconds = time / 1000;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const star of stars) {
    const twinkle = reducedMotion ? 0.75 : 0.55 + 0.45 * Math.sin(seconds * star.speed + star.phase);
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = star.tint;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // now and then a shooting star crosses the sky
  if (!reducedMotion) {
    if (!shootingStar && Math.random() < 0.0025) {
      shootingStar = {
        x: Math.random() * window.innerWidth * 0.7,
        y: Math.random() * window.innerHeight * 0.4,
        life: 0
      };
    }
    if (shootingStar) {
      shootingStar.life += 0.022;
      const headX = shootingStar.x + shootingStar.life * 420;
      const headY = shootingStar.y + shootingStar.life * 190;
      const trail = ctx.createLinearGradient(headX - 130, headY - 59, headX, headY);
      trail.addColorStop(0, "rgba(255, 255, 255, 0)");
      trail.addColorStop(1, "rgba(255, 255, 255, 0.9)");
      ctx.globalAlpha = Math.sin(Math.min(shootingStar.life, 1) * Math.PI);
      ctx.strokeStyle = trail;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(headX - 130, headY - 59);
      ctx.lineTo(headX, headY);
      ctx.stroke();
      if (shootingStar.life >= 1) shootingStar = null;
    }
  }

  ctx.globalAlpha = 1;
  if (!reducedMotion) requestAnimationFrame(drawSky);
}

buildSky();
requestAnimationFrame(drawSky);
window.addEventListener("resize", () => {
  buildSky();
  if (reducedMotion) requestAnimationFrame(drawSky);
});

/* ---------- 2. The cat ---------- */
const cat = document.getElementById("cat");
const eyes = cat.querySelectorAll(".eye");
const catBubble = document.getElementById("cat-bubble");
const catHint = document.getElementById("cat-hint");
const defaultHint = catHint.textContent;

// Each pupil slides a little towards the pointer
function lookAt(pointerX, pointerY) {
  eyes.forEach((eye) => {
    const box = eye.getBoundingClientRect();
    const dx = pointerX - (box.left + box.width / 2);
    const dy = pointerY - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const reach = Math.min(distance / 220, 1);     // far away = look further
    const moveX = (dx / distance) * 8 * reach;
    const moveY = (dy / distance) * 3.5 * reach;
    const pupil = eye.parentNode.querySelector(".pupil");
    pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
}
window.addEventListener("pointermove", (event) => lookAt(event.clientX, event.clientY), { passive: true });

// Petting: a slow blink and a purr
let petTimer;
cat.addEventListener("click", () => {
  cat.classList.add("is-petted");
  catBubble.classList.add("is-visible");
  catHint.textContent = "A slow blink means she trusts you.";

  clearTimeout(petTimer);
  petTimer = setTimeout(() => {
    cat.classList.remove("is-petted");
    catBubble.classList.remove("is-visible");
    catHint.textContent = defaultHint;
  }, 2200);
});

/* ---------- 3. Mobile menu ---------- */
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
  navLinks.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}
menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));
// close the menu after choosing a link
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

/* ---------- 4. Project filter ---------- */
const filterButtons = document.querySelectorAll(".filter");
const projects = document.querySelectorAll("#project-list .project");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    // mark the chosen button
    filterButtons.forEach((other) => {
      other.setAttribute("aria-pressed", String(other === button));
    });

    // show the matching cards, hide the rest
    projects.forEach((project) => {
      const matches = filter === "all" || project.dataset.category === filter;
      project.hidden = !matches;
      project.classList.remove("is-waiting");
    });
  });
});

/* ---------- 5. Card glow follows the pointer ---------- */
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  });
});

/* ---------- 6. Scroll reveal ---------- */
// Cards below the screen start hidden and slide in when you reach them.
// Without JavaScript (or with reduced motion) everything is simply visible.
if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("is-waiting");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach((element) => {
    const belowScreen = element.getBoundingClientRect().top > window.innerHeight;
    if (belowScreen) {
      element.classList.add("is-waiting");
      observer.observe(element);
    }
  });
}
