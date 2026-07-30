"use strict";

document.documentElement.classList.remove("no-js");
document.documentElement.lang = "en";

const state = {
  theme: "light",
  motion: "full",
  copyTimer: null,
};

const storageKeys = {
  theme: "tien-portfolio-theme",
  motion: "tien-portfolio-motion",
};

function readStorage(type, key) {
  try {
    return window[type].getItem(key);
  } catch (_error) {
    return null;
  }
}

function writeStorage(type, key, value) {
  try {
    window[type].setItem(key, value);
  } catch (_error) {}
}

function updateThemeControl() {
  const button = document.querySelector("[data-theme-toggle]");
  const label = document.querySelector("[data-theme-label]");
  if (!button || !label) return;

  const isDark = state.theme === "dark";
  label.textContent = isDark ? "Light" : "Dark";
  button.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode",
  );
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute("content", theme === "dark" ? "#0a111b" : "#050c17");
  updateThemeControl();
}

function initTheme() {
  const storedTheme = readStorage("localStorage", storageKeys.theme);
  applyTheme(storedTheme === "dark" ? "dark" : "light");

  document
    .querySelector("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      writeStorage("localStorage", storageKeys.theme, nextTheme);
    });
}

function updateMotionControl() {
  const button = document.querySelector("[data-motion-toggle]");
  const label = document.querySelector("[data-motion-label]");
  if (!button || !label) return;

  const isFull = state.motion === "full";
  label.textContent = isFull ? "Motion On" : "Motion Off";
  button.setAttribute(
    "aria-label",
    isFull ? "Turn motion effects off" : "Turn motion effects on",
  );
  button.setAttribute("aria-pressed", String(isFull));
}

function resetPointerMotion() {
  const heroMedia = document.querySelector("[data-hero-media]");
  heroMedia?.style.setProperty("--hero-shift-x", "0px");
  heroMedia?.style.setProperty("--hero-shift-y", "0px");
  heroMedia?.style.setProperty("--spot-x", "50%");
  heroMedia?.style.setProperty("--spot-y", "45%");
  document.querySelectorAll(".project-panel").forEach((panel) => {
    panel.style.setProperty("--project-shift-x", "0px");
    panel.style.setProperty("--project-shift-y", "0px");
  });
}

function applyMotion(motion) {
  state.motion = motion;
  document.documentElement.dataset.motion = motion;
  if (motion === "reduced") {
    resetPointerMotion();
  }
  updateMotionControl();
}

function initMotion() {
  const storedMotion = readStorage("localStorage", storageKeys.motion);
  applyMotion(storedMotion === "reduced" ? "reduced" : "full");

  document
    .querySelector("[data-motion-toggle]")
    ?.addEventListener("click", () => {
      const nextMotion = state.motion === "full" ? "reduced" : "full";
      applyMotion(nextMotion);
      writeStorage("localStorage", storageKeys.motion, nextMotion);
    });
}

function initMobileMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  const header = document.querySelector("[data-header]");
  if (!button || !menu) return;
  let lastFocused = null;
  const focusable = () => [
    ...menu.querySelectorAll("a[href], button:not([disabled])"),
  ];

  const close = (restoreFocus = true) => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
    header?.classList.remove("is-menu-open");
    if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  const open = () => {
    lastFocused = document.activeElement;
    header?.classList.remove("is-hidden");
    header?.classList.add("is-menu-open");
    menu.hidden = false;
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-label", "Close navigation");
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(() => focusable()[0]?.focus());
  };

  button.addEventListener("click", () => {
    button.getAttribute("aria-expanded") === "true" ? close() : open();
  });
  menu.querySelectorAll("[data-mobile-link]").forEach((link) => {
    link.addEventListener("click", () => close());
  });
  document.addEventListener("keydown", (event) => {
    if (button.getAttribute("aria-expanded") !== "true") return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (
      window.innerWidth >= 1024 &&
      button.getAttribute("aria-expanded") === "true"
    )
      close(false);
  });
}

function initNavigation() {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-header-progress]");
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const sections = links
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);
  let lastScrollY = window.scrollY;
  let headerFrame = null;
  const setActive = (id) =>
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      active
        ? link.setAttribute("aria-current", "page")
        : link.removeAttribute("aria-current");
    });
  const syncActiveLink = (currentScrollY) => {
    if (currentScrollY < 80) {
      setActive("home");
      return;
    }
    const headerHeight = header?.offsetHeight ?? 60;
    const probe = currentScrollY + headerHeight + window.innerHeight * 0.2;
    let activeSection = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) activeSection = section;
    });
    if (activeSection) setActive(activeSection.id);
  };
  const updateHeader = () => {
    headerFrame = null;
    const currentScrollY = Math.max(window.scrollY, 0);
    const scrollRange = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    const delta = currentScrollY - lastScrollY;
    const menuIsOpen = document.body.classList.contains("menu-open");
    const dialogIsOpen = document.body.classList.contains("dialog-open");
    const canAutoHide = window.innerWidth >= 1024;

    header?.classList.toggle("is-scrolled", currentScrollY > 16);
    header?.classList.toggle(
      "is-hidden",
      canAutoHide &&
        currentScrollY > (header?.offsetHeight ?? 60) * 2 &&
        delta > 5 &&
        !menuIsOpen &&
        !dialogIsOpen,
    );
    syncActiveLink(currentScrollY);
    if (!canAutoHide || delta < -5 || currentScrollY < 80)
      header?.classList.remove("is-hidden");
    if (progress)
      progress.style.transform = `scaleX(${Math.min(currentScrollY / scrollRange, 1)})`;
    if (Math.abs(delta) > 3) lastScrollY = currentScrollY;
  };
  const requestHeaderUpdate = () => {
    if (headerFrame !== null) return;
    headerFrame = window.requestAnimationFrame(updateHeader);
  };
  updateHeader();
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
  window.addEventListener("resize", requestHeaderUpdate);
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      const headerOffset =
        document.querySelector("[data-header]")?.offsetHeight ?? 64;
      const destination =
        target.id === "home"
          ? 0
          : Math.max(
              target.getBoundingClientRect().top +
                window.scrollY -
                headerOffset,
              0,
            );
      if (state.motion !== "full") {
        window.scrollTo(0, destination);
        history.replaceState(null, "", link.hash);
        return;
      }
      const start = window.scrollY;
      const distance = destination - start;
      const startTime = performance.now();
      const frame = (now) => {
        const progress = Math.min((now - startTime) / 500, 1);
        window.scrollTo(0, start + distance * easeInOutCubic(progress));
        if (progress < 1) window.requestAnimationFrame(frame);
        else history.replaceState(null, "", link.hash);
      };
      window.requestAnimationFrame(frame);
    });
  });
}

function animateCounters() {
  document.querySelectorAll(".stat strong").forEach((counter) => {
    const finalValue = Number.parseInt(counter.textContent, 10);
    if (!Number.isFinite(finalValue)) return;
    if (state.motion !== "full") {
      counter.textContent = String(finalValue).padStart(2, "0");
      return;
    }
    counter.textContent = "00";
    const start = performance.now();
    const update = (now) => {
      if (state.motion !== "full") {
        counter.textContent = String(finalValue).padStart(2, "0");
        return;
      }
      const progress = Math.min((now - start) / 3000, 1);
      const value = Math.round(finalValue * (1 - (1 - progress) ** 3));
      counter.textContent = String(value).padStart(2, "0");
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  });
}

function initScrollProgress() {
  const process = document.querySelector("[data-process]");
  const processProgress = document.querySelector("[data-process-progress]");
  let queued = false;
  const calculate = () => {
    queued = false;
    if (process && processProgress && innerWidth >= 1024) {
      const rect = process.getBoundingClientRect();
      const value = Math.max(
        0,
        Math.min(
          1,
          (innerHeight * 0.75 - rect.top) / Math.max(rect.height * 0.75, 1),
        ),
      );
      processProgress.style.width = `${value * 100}%`;
    }
  };
  const request = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(calculate);
  };
  calculate();
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
}

function initReferenceAnimations() {
  const elements = [...document.querySelectorAll("[data-reveal]")];
  let revealFrame = null;
  const updateReveals = () => {
    revealFrame = null;
    const viewportTrigger = window.scrollY + window.innerHeight;
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementTrigger = rect.top + window.scrollY + 120;
      if (viewportTrigger >= elementTrigger) {
        element.classList.add("is-revealed");
      }
    });
  };
  const requestRevealUpdate = () => {
    if (revealFrame !== null) return;
    revealFrame = window.requestAnimationFrame(updateReveals);
  };

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(updateReveals);
  });
  window.addEventListener("scroll", requestRevealUpdate, { passive: true });
  window.addEventListener("resize", requestRevealUpdate);
  animateCounters();
  initScrollProgress();
}

function initProjectViews() {
  document
    .querySelectorAll("[data-project]")
    .forEach((project, projectIndex) => {
      const buttons = [...project.querySelectorAll("[data-project-view]")];
      const panels = [...project.querySelectorAll("[data-view-panel]")];
      buttons.forEach((button, buttonIndex) => {
        const panel = panels.find(
          (item) => item.dataset.viewPanel === button.dataset.projectView,
        );
        button.id = `project-${projectIndex}-tab-${buttonIndex}`;
        button.setAttribute(
          "aria-controls",
          `project-${projectIndex}-panel-${buttonIndex}`,
        );
        if (panel) {
          panel.id = `project-${projectIndex}-panel-${buttonIndex}`;
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", button.id);
        }
        const select = () => {
          buttons.forEach((item) => {
            const selected = item === button;
            item.setAttribute("aria-selected", String(selected));
            item.tabIndex = selected ? 0 : -1;
          });
          panels.forEach((item) => {
            const visible =
              item.dataset.viewPanel === button.dataset.projectView;
            item.hidden = !visible;
            item.classList.toggle("is-visible", visible);
          });
        };
        button.addEventListener("click", select);
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          const direction = event.key === "ArrowRight" ? 1 : -1;
          const next =
            buttons[
              (buttonIndex + direction + buttons.length) % buttons.length
            ];
          next.focus();
          next.click();
        });
      });
    });
}

function initLearningSlider() {
  const slider = document.querySelector("[data-learning-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-learning-track]");
  const slides = [...slider.querySelectorAll("[data-learning-slide]")];
  const dots = [...slider.querySelectorAll("[data-learning-dot]")];
  const previous = slider.querySelector("[data-learning-prev]");
  const next = slider.querySelector("[data-learning-next]");
  const counter = slider.querySelector("[data-learning-counter]");
  const live = slider.querySelector("[data-learning-live]");
  if (!track || slides.length === 0) return;

  let activeIndex = 0;
  let dragStart = null;
  slider.tabIndex = 0;

  const showSlide = (requestedIndex, announce = true) => {
    const visibleCount =
      window.innerWidth <= 767 ? 1 : window.innerWidth <= 1023 ? 2 : 3;
    const maxIndex = Math.max(slides.length - visibleCount, 0);
    activeIndex =
      requestedIndex > maxIndex
        ? 0
        : requestedIndex < 0
          ? maxIndex
          : requestedIndex;
    const offset = slides[activeIndex].offsetLeft - track.offsetLeft;
    track.style.transform = `translate3d(-${offset}px, 0, 0)`;

    slides.forEach((slide, index) => {
      const isVisible =
        index >= activeIndex && index < activeIndex + visibleCount;
      slide.setAttribute("aria-hidden", String(!isVisible));
      slide.querySelectorAll("a, button").forEach((control) => {
        control.tabIndex = isVisible ? 0 : -1;
      });
    });
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.hidden = index > maxIndex;
      dot.classList.toggle("is-active", isActive);
      isActive
        ? dot.setAttribute("aria-current", "true")
        : dot.removeAttribute("aria-current");
    });

    const start = String(activeIndex + 1).padStart(2, "0");
    const end = String(
      Math.min(activeIndex + visibleCount, slides.length),
    ).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");
    if (counter)
      counter.textContent =
        visibleCount === 1
          ? `${start} / ${total}`
          : `${start}–${end} / ${total}`;
    if (live && announce) {
      const topic =
        slides[activeIndex].querySelector(".building-eyebrow")?.textContent ??
        `topic ${activeIndex + 1}`;
      live.textContent = `Showing ${topic}`;
    }
  };

  previous?.addEventListener("click", () => showSlide(activeIndex - 1));
  next?.addEventListener("click", () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  slider.addEventListener("keydown", (event) => {
    if (event.target.closest("a, button")) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") showSlide(0);
    else if (event.key === "End") showSlide(slides.length - 1);
    else showSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  slider.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    dragStart = { x: event.clientX, id: event.pointerId };
    slider.setPointerCapture?.(event.pointerId);
  });
  slider.addEventListener("pointerup", (event) => {
    if (!dragStart || dragStart.id !== event.pointerId) return;
    const distance = event.clientX - dragStart.x;
    dragStart = null;
    if (Math.abs(distance) < 45) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  });
  slider.addEventListener("pointercancel", () => {
    dragStart = null;
  });
  window.addEventListener("resize", () => showSlide(activeIndex, false));

  showSlide(0, false);
}

function initCaseStudy() {
  const dialog = document.querySelector("[data-case-dialog]");
  const openButton = document.querySelector("[data-case-study-open]");
  const closeButton = document.querySelector("[data-case-study-close]");
  if (!dialog || !openButton || !closeButton) return;
  const close = () => {
    typeof dialog.close === "function"
      ? dialog.close()
      : dialog.removeAttribute("open");
    document.body.classList.remove("dialog-open");
    openButton.focus();
  };
  openButton.addEventListener("click", () => {
    typeof dialog.showModal === "function"
      ? dialog.showModal()
      : dialog.setAttribute("open", "");
    document.body.classList.add("dialog-open");
    closeButton.focus();
  });
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
}

async function copyText(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_error) {
      /* use fallback */
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  textarea.remove();
  return success;
}

function initClipboard() {
  const button = document.querySelector("[data-copy-email]");
  const label = document.querySelector("[data-copy-label]");
  const live = document.querySelector("[data-live-region]");
  if (!button || !label) return;
  button.addEventListener("click", async () => {
    const message = (await copyText("ngoctien20022005@gmail.com"))
      ? "Email copied"
      : "Could not copy email";
    label.textContent = message;
    if (live) live.textContent = message;
    clearTimeout(state.copyTimer);
    state.copyTimer = setTimeout(() => {
      label.textContent = "Copy Email";
    }, 2000);
  });
}

function initImageFallbacks() {
  document.querySelectorAll("img[data-fallback]").forEach((image) => {
    const replace = () => {
      if (!image.isConnected) return;
      const fallback = document.createElement("div");
      fallback.className = "image-fallback";
      fallback.setAttribute("role", "img");
      fallback.setAttribute("aria-label", image.alt || image.dataset.fallback);
      fallback.textContent = image.dataset.fallback;
      image.replaceWith(fallback);
    };
    image.addEventListener("error", replace, { once: true });
    if (image.complete && image.naturalWidth === 0) replace();
  });
}

function initPointerMotion() {
  const heroMedia = document.querySelector("[data-hero-media]");
  if (heroMedia) {
    heroMedia.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch" || state.motion !== "full") return;
        const rect = heroMedia.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width),
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height),
        );
        heroMedia.style.setProperty("--hero-shift-x", `${(x - 0.5) * 12}px`);
        heroMedia.style.setProperty("--hero-shift-y", `${(y - 0.5) * 12}px`);
        heroMedia.style.setProperty("--spot-x", `${x * 100}%`);
        heroMedia.style.setProperty("--spot-y", `${y * 100}%`);
      },
      { passive: true },
    );
    heroMedia.addEventListener("pointerleave", () => {
      heroMedia.style.setProperty("--hero-shift-x", "0px");
      heroMedia.style.setProperty("--hero-shift-y", "0px");
      heroMedia.style.setProperty("--spot-x", "50%");
      heroMedia.style.setProperty("--spot-y", "45%");
    });
  }

  document.querySelectorAll(".project-panel").forEach((panel) => {
    panel.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch" || state.motion !== "full") return;
        const rect = panel.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        panel.style.setProperty("--project-shift-x", `${x * 8}px`);
        panel.style.setProperty("--project-shift-y", `${y * 8}px`);
      },
      { passive: true },
    );
    panel.addEventListener("pointerleave", () => {
      panel.style.setProperty("--project-shift-x", "0px");
      panel.style.setProperty("--project-shift-y", "0px");
    });
  });
}

function initIcons() {
  window.lucide?.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function prioritizeInternContent() {
  const main = document.querySelector("main");
  if (!main) return;
  ["work", "stack", "services", "evidence", "building", "values"].forEach(
    (id) => {
      const section = document.getElementById(id);
      if (section) main.append(section);
    },
  );
}

function init() {
  prioritizeInternContent();
  initMotion();
  initTheme();
  initIcons();
  initMobileMenu();
  initNavigation();
  initSmoothScroll();
  initProjectViews();
  initLearningSlider();
  initCaseStudy();
  initClipboard();
  initImageFallbacks();
  initPointerMotion();
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  initReferenceAnimations();
}

document.addEventListener("DOMContentLoaded", init);
