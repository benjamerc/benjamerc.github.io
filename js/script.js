/* ---------- Theme toggle (dark by default) ---------- */

const themeToggle = document.querySelector(".theme-toggle");

if (themeToggle) {
  const root = document.documentElement;

  function syncToggleLabel() {
    const isDark = root.getAttribute("data-theme") === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
  }

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
      // Storage blocked (private mode, etc.): the switch still works for this visit
    }
    syncToggleLabel();
  });

  syncToggleLabel();
  themeToggle.hidden = false;
}

/* ---------- Carousel ---------- */

const carousel = document.querySelector(".carousel");

if (carousel) {
  const track = carousel.querySelector(".carousel-track");
  const images = carousel.querySelectorAll(".carousel-track img");
  const prevBtn = carousel.querySelector(".carousel-btn.prev");
  const nextBtn = carousel.querySelector(".carousel-btn.next");
  const dotsContainer = carousel.querySelector(".carousel-dots");

  let index = 0;
  const dots = [];

  images.forEach((img, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Ir a la imagen ${i + 1} de ${images.length}`);
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  });

  function goTo(newIndex) {
    // Loop around at both ends
    index = (newIndex + images.length) % images.length;
    update();
  }

  function update() {
    // Percent-based, so it stays correct on resize without recalculating widths
    track.style.transform = `translateX(-${index * 100}%)`;

    images.forEach((img, i) => {
      img.setAttribute("aria-hidden", i === index ? "false" : "true");
    });

    dots.forEach((dot, i) => {
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  // Arrow keys while focus is inside the carousel
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goTo(index - 1);
    if (event.key === "ArrowRight") goTo(index + 1);
  });

  // Touch swipe
  let startX = null;
  let startY = null;

  track.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });

  track.addEventListener("touchend", (event) => {
    if (startX === null) return;

    const dx = event.changedTouches[0].clientX - startX;
    const dy = event.changedTouches[0].clientY - startY;

    // Only horizontal, deliberate swipes
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }

    startX = null;
    startY = null;
  });

  update();
}

/* ---------- Scroll reveal ----------
   Runs only when <html> has the "motion" class (set in <head> when the user
   allows motion) and IntersectionObserver exists. Only elements that start
   below the fold are hidden, and each one is revealed once. If this script
   does not run, everything stays visible. */

const motionEnabled = document.documentElement.classList.contains("motion");

if (motionEnabled && "IntersectionObserver" in window) {
  const STAGGER_CAP = 10; // max 10 × 40ms = 400ms extra delay per grid

  // Single elements: section titles, lead text, project cards, education card, contact list
  const singles = document.querySelectorAll(
    ".section-title, .section-body > :not(.tech-list)"
  );

  // Grids whose children appear one after another
  const staggered = document.querySelectorAll(".tech-list");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });

  const isBelowFold = (el) => el.getBoundingClientRect().top > window.innerHeight;

  singles.forEach((el) => {
    if (isBelowFold(el)) {
      el.classList.add("reveal");
      observer.observe(el);
    }
  });

  staggered.forEach((grid) => {
    if (isBelowFold(grid)) {
      Array.from(grid.children).forEach((child, i) => {
        child.style.setProperty("--i", Math.min(i, STAGGER_CAP));
      });
      grid.classList.add("reveal-stagger");
      observer.observe(grid);
    }
  });
}
