const localNav = document.querySelector(".local-nav");
const globalNav = document.querySelector(".global-nav");
const globalItems = document.querySelectorAll(".global-item");
const menuToggle = document.querySelector(".menu-toggle");
const actionTriggers = [
  ...document.querySelectorAll(".global-actions > .nav-icon"),
].filter((trigger) =>
  trigger.nextElementSibling?.classList.contains("action-submenu"),
);
const header = document.querySelector("header");
const heroVideo = document.querySelector(".neo-hero-video");
const motionVideos = document.querySelectorAll("[data-play-once]");

let activeItem = null;
let closeTimer = null;

const markPageReady = () => {
  if (document.body.classList.contains("is-page-ready")) {
    return;
  }

  requestAnimationFrame(() => {
    document.body.classList.add("is-page-ready");
  });
};

if (heroVideo) {
  if (heroVideo.readyState >= 2) {
    markPageReady();
  } else {
    heroVideo.addEventListener("loadeddata", markPageReady, { once: true });
    heroVideo.addEventListener("canplay", markPageReady, { once: true });
    heroVideo.addEventListener("error", markPageReady, { once: true });
    window.setTimeout(markPageReady, 1800);
  }
} else {
  markPageReady();
}

const prepareMotionVideo = (video) => {
  const shell = video.closest(
    ".neo-motion-wrap, .neo-hero-media, .neo-design-card",
  );

  if (!shell) {
    return;
  }

  const setReady = () => shell.classList.add("is-video-ready");
  const setError = () => {
    video.dataset.pendingPlay = "false";
    video.dataset.played = "false";
    shell.classList.add("is-video-error");
  };

  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("preload", "auto");

  video.addEventListener("loadeddata", setReady, { once: true });
  video.addEventListener("canplay", setReady, { once: true });
  video.addEventListener("play", () => {
    shell.classList.add("is-video-playing");
    shell.classList.add("is-playing");
    shell.classList.remove("is-video-error");
    shell.classList.remove("is-video-ended");
  });
  video.addEventListener("ended", () => {
    shell.classList.remove("is-video-playing");
    shell.classList.remove("is-playing");
    shell.classList.add("is-video-ended");
  });
  video.addEventListener("error", setError, { once: true });

  if (video.readyState >= 2) {
    setReady();
  } else {
    video.load();
  }
};

const playMotionVideo = (video) => {
  if (video.dataset.played === "true" || video.dataset.pendingPlay === "true") {
    return;
  }

  const shell = video.closest(
    ".neo-motion-wrap, .neo-hero-media, .neo-design-card",
  );
  let started = false;

  video.dataset.motionWanted = "true";

  const startPlayback = () => {
    if (started || video.dataset.played === "true") {
      return;
    }

    started = true;
    video.dataset.pendingPlay = "false";
    video.dataset.played = "true";

    try {
      video.currentTime = 0;
    } catch { }

    video.play().catch(() => {
      video.dataset.played = "false";
      started = false;
    });
  };

  video.dataset.pendingPlay = "true";
  shell?.classList.remove("is-video-error");

  if (video.readyState >= 2) {
    startPlayback();
    return;
  }

  video.addEventListener("loadeddata", startPlayback, { once: true });
  video.addEventListener("canplay", startPlayback, { once: true });
  video.load();
};

motionVideos.forEach(prepareMotionVideo);

if ("IntersectionObserver" in window) {
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        playMotionVideo(entry.target);
        motionObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px 12% 0px",
    },
  );

  motionVideos.forEach((video) => motionObserver.observe(video));
} else {
  motionVideos.forEach(playMotionVideo);
}

const retryPendingMotion = () => {
  motionVideos.forEach((video) => {
    if (
      video.dataset.motionWanted === "true" &&
      video.dataset.played !== "true"
    ) {
      playMotionVideo(video);
    }
  });
};

document.addEventListener("pointerdown", retryPendingMotion, { once: true });
document.addEventListener("keydown", retryPendingMotion, { once: true });

window.addEventListener("scroll", () => {
  const globalNavHeight = globalNav ? globalNav.offsetHeight : 44;

  if (localNav && window.scrollY > globalNavHeight) {
    localNav.classList.add("show");
    globalNav.classList.add("hide");
  } else if (localNav) {
    localNav.classList.remove("show");
    globalNav.classList.remove("hide");
  }
});

menuToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("mobile-menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));

  if (!isOpen) {
    closeSubmenu();
  }
});

document.querySelectorAll(".global-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("mobile-menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const clearCloseTimer = () => {
  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }
};

const getActiveSubmenu = () =>
  activeItem?.querySelector(".nav-submenu") ||
  (activeItem?.nextElementSibling?.classList.contains("action-submenu")
    ? activeItem.nextElementSibling
    : null);

const isActionTrigger = (item) =>
  item?.nextElementSibling?.classList.contains("action-submenu");

const isInSubmenuZone = (target) => {
  const activeSubmenu = getActiveSubmenu();

  return Boolean(
    target &&
    ((header && header.contains(target)) ||
      (activeSubmenu && activeSubmenu.contains(target))),
  );
};

const openSubmenu = (item) => {
  clearCloseTimer();

  if (activeItem && activeItem !== item) {
    activeItem.classList.remove("is-active");
  }

  activeItem = item;
  activeItem.classList.add("is-active");
  document.body.classList.add("global-submenu-open");
};

const closeSubmenu = () => {
  clearCloseTimer();

  if (activeItem) {
    activeItem.classList.remove("is-active");
    activeItem = null;
  }

  document.body.classList.remove("global-submenu-open");
};

const closeSubmenuSoon = () => {
  clearCloseTimer();
  closeTimer = window.setTimeout(closeSubmenu, 120);
};

globalItems.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    openSubmenu(item);
  });

  item.addEventListener("focusin", () => {
    openSubmenu(item);
  });

  item
    .querySelector(".nav-submenu")
    ?.addEventListener("mouseleave", (event) => {
      if (!isInSubmenuZone(event.relatedTarget)) {
        closeSubmenuSoon();
      }
    });
});

actionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();

    if (activeItem === trigger) {
      closeSubmenu();
      return;
    }

    openSubmenu(trigger);
    trigger.nextElementSibling?.querySelector("input")?.focus();
  });
});

header?.addEventListener("mouseleave", (event) => {
  if (isActionTrigger(activeItem)) {
    return;
  }

  if (!isInSubmenuZone(event.relatedTarget)) {
    closeSubmenuSoon();
  }
});

document.addEventListener("mousemove", (event) => {
  if (!activeItem || isActionTrigger(activeItem)) {
    return;
  }

  if (isInSubmenuZone(event.target)) {
    clearCloseTimer();
    return;
  }

  closeSubmenuSoon();
});

document.addEventListener("pointerdown", (event) => {
  if (!activeItem || isInSubmenuZone(event.target)) {
    return;
  }

  closeSubmenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.body.classList.remove("mobile-menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    closeSubmenu();
  }
});

document.querySelectorAll("[data-slider]").forEach((slider) => {
  const sliderName = slider.dataset.slider;
  const previousButton = document.querySelector(
    `[data-slider-prev="${sliderName}"]`,
  );
  const nextButton = document.querySelector(
    `[data-slider-next="${sliderName}"]`,
  );
  const sliderSection = slider.closest("section");
  const progressDots = sliderSection?.querySelectorAll(
    ".neo-progress-controls > span",
  );
  const playButton = sliderSection?.querySelector(".neo-play-control");
  let activeSlideIndex = 0;
  let sliderTimer = null;
  let highlightLoopRunning = false;
  let highlightLoopIndex = 0;
  let highlightLoopVideo = null;

  const updateSliderProgress = () => {
    if (!progressDots?.length) {
      return;
    }

    const slides = [...slider.children];
    const sliderRect = slider.getBoundingClientRect();
    const center = sliderRect.left + sliderRect.width / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const slideCenter = slideRect.left + slideRect.width / 2;
      const distance = Math.abs(center - slideCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    activeSlideIndex = closestIndex;

    progressDots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === closestIndex);
    });
  };

  const getSlideOffset = (index) => {
    const slides = [...slider.children];
    const slide = slides[index];
    const computedStyle = window.getComputedStyle(slider);
    const scrollPaddingLeft = Number.parseFloat(
      computedStyle.scrollPaddingLeft,
    );

    return slide
      ? Math.max(0, slide.offsetLeft - slider.offsetLeft - scrollPaddingLeft)
      : 0;
  };

  const scrollToSlide = (index) => {
    const slides = [...slider.children];

    if (!slides.length) {
      return;
    }

    const nextIndex = (index + slides.length) % slides.length;

    slider.scrollTo({
      left: getSlideOffset(nextIndex),
      behavior: "smooth",
    });
  };

  const scrollSlider = (direction) => {
    scrollToSlide(activeSlideIndex + direction);
  };

  const stopSlider = () => {
    if (sliderTimer) {
      window.clearInterval(sliderTimer);
      sliderTimer = null;
    }

    playButton?.classList.remove("is-running");
    playButton?.setAttribute("aria-label", "Phát điểm nổi bật");
  };

  const startSlider = () => {
    if (!playButton || sliderTimer) {
      return;
    }

    playButton.classList.add("is-running");
    playButton.setAttribute("aria-label", "Tạm dừng điểm nổi bật");
    sliderTimer = window.setInterval(() => {
      scrollToSlide(activeSlideIndex + 1);
    }, 3200);
  };

  const replayHighlightVideos = () => {
    const videos = slider.querySelectorAll(".neo-motion-video");

    if (!videos.length) {
      return;
    }

    playButton?.classList.add("is-running");
    playButton?.setAttribute("aria-label", "Phát lại video điểm nổi bật");

    videos.forEach((video) => {
      const shell = video.closest(".neo-motion-wrap");

      shell?.classList.remove("is-video-ended");
      shell?.classList.remove("is-video-error");
      video.dataset.pendingPlay = "false";
      video.dataset.played = "false";

      try {
        video.currentTime = 0;
      } catch {
        // Metadata may not be ready yet; play() below can still start once ready.
      }

      video.play().catch(() => {
        shell?.classList.add("is-video-error");
      });
    });

    window.setTimeout(() => {
      playButton?.classList.remove("is-running");
    }, 1200);
  };

  const getHighlightVideos = () => [
    ...slider.querySelectorAll(".neo-motion-video"),
  ];

  const stopHighlightVideoLoop = () => {
    if (!highlightLoopRunning && !highlightLoopVideo) {
      return;
    }

    highlightLoopRunning = false;
    playButton?.classList.remove("is-running");
    playButton?.setAttribute("aria-label", "Phát lại video điểm nổi bật");

    getHighlightVideos().forEach((video) => {
      video.onended = null;
      video.pause();
    });

    highlightLoopVideo = null;
  };

  const playHighlightVideoAt = (index) => {
    const videos = getHighlightVideos();

    if (!highlightLoopRunning || !videos.length) {
      stopHighlightVideoLoop();
      return;
    }

    const nextIndex = (index + videos.length) % videos.length;
    const video = videos[nextIndex];
    const shell = video.closest(".neo-motion-wrap");
    const slideIndex = [...slider.children].findIndex((slide) =>
      slide.contains(video),
    );

    highlightLoopIndex = nextIndex;
    highlightLoopVideo = video;

    getHighlightVideos().forEach((otherVideo) => {
      if (otherVideo !== video) {
        otherVideo.onended = null;
        otherVideo.pause();
      }
    });

    if (slideIndex >= 0) {
      activeSlideIndex = slideIndex;
      scrollToSlide(slideIndex);
      progressDots?.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === slideIndex);
      });
    }

    shell?.classList.remove("is-video-ended");
    shell?.classList.remove("is-video-error");
    video.dataset.pendingPlay = "false";
    video.dataset.played = "false";

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; play() below can still start once ready.
    }

    video.onended = () => {
      if (highlightLoopRunning) {
        playHighlightVideoAt(highlightLoopIndex + 1);
      }
    };

    video.play().catch(() => {
      shell?.classList.add("is-video-error");

      if (highlightLoopRunning) {
        window.setTimeout(
          () => playHighlightVideoAt(highlightLoopIndex + 1),
          350,
        );
      }
    });
  };

  const toggleHighlightVideoLoop = () => {
    if (highlightLoopRunning) {
      stopHighlightVideoLoop();
      return;
    }

    highlightLoopRunning = true;
    playButton?.classList.add("is-running");
    playButton?.setAttribute("aria-label", "Tạm dừng video điểm nổi bật");
    playHighlightVideoAt(highlightLoopIndex);
  };

  const stopHighlightSlideLoop = () => {
    highlightLoopRunning = false;
    window.clearTimeout(sliderTimer);
    sliderTimer = null;
    playButton?.classList.remove("is-running");
    playButton?.setAttribute("aria-label", "Phát lại video điểm nổi bật");

    slider.querySelectorAll(".neo-motion-video").forEach((video) => {
      video.onended = null;
      video.pause();
    });
  };

  const playHighlightSlideAt = (index) => {
    const slides = [...slider.children];

    if (!highlightLoopRunning || !slides.length) {
      stopHighlightSlideLoop();
      return;
    }

    const nextIndex = (index + slides.length) % slides.length;
    const slide = slides[nextIndex];
    const video = slide.querySelector(".neo-motion-video");
    const shell = video?.closest(".neo-motion-wrap");

    highlightLoopIndex = nextIndex;
    activeSlideIndex = nextIndex;
    scrollToSlide(nextIndex);

    progressDots?.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === nextIndex);
    });

    window.clearTimeout(sliderTimer);
    sliderTimer = null;

    slider.querySelectorAll(".neo-motion-video").forEach((otherVideo) => {
      if (otherVideo !== video) {
        otherVideo.onended = null;
        otherVideo.pause();
      }
    });

    if (!video) {
      sliderTimer = window.setTimeout(() => {
        playHighlightSlideAt(highlightLoopIndex + 1);
      }, 4200);
      return;
    }

    shell?.classList.remove("is-video-ended");
    shell?.classList.remove("is-video-error");
    video.dataset.pendingPlay = "false";
    video.dataset.played = "false";

    try {
      video.currentTime = 0;
    } catch {
      // Metadata may not be ready yet; play() below can still start once ready.
    }

    video.onended = () => {
      if (!highlightLoopRunning) {
        return;
      }

      sliderTimer = window.setTimeout(() => {
        playHighlightSlideAt(highlightLoopIndex + 1);
      }, 900);
    };

    video.play().catch(() => {
      shell?.classList.add("is-video-error");

      if (highlightLoopRunning) {
        sliderTimer = window.setTimeout(() => {
          playHighlightSlideAt(highlightLoopIndex + 1);
        }, 4200);
      }
    });
  };

  const toggleHighlightSlideLoop = () => {
    if (highlightLoopRunning) {
      stopHighlightSlideLoop();
      return;
    }

    highlightLoopRunning = true;
    playButton?.classList.add("is-running");
    playButton?.setAttribute("aria-label", "Tạm dừng video điểm nổi bật");
    playHighlightSlideAt(highlightLoopIndex);
  };

  previousButton?.addEventListener("click", () => {
    stopSlider();
    stopHighlightSlideLoop();
    scrollSlider(-1);
  });
  nextButton?.addEventListener("click", () => {
    stopSlider();
    stopHighlightSlideLoop();
    scrollSlider(1);
  });
  playButton?.addEventListener("click", () => {
    if (sliderName === "neo-highlights") {
      toggleHighlightSlideLoop();
      return;
    }

    if (sliderTimer) {
      stopSlider();
    } else {
      startSlider();
    }
  });
  progressDots?.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      stopSlider();
      scrollToSlide(index);
    });
  });
  slider.addEventListener(
    "scroll",
    () => requestAnimationFrame(updateSliderProgress),
    {
      passive: true,
    },
  );
  slider.addEventListener("pointerdown", stopSlider, { passive: true });
  slider.addEventListener("pointerdown", stopHighlightSlideLoop, {
    passive: true,
  });
  window.addEventListener("resize", updateSliderProgress, { passive: true });
  updateSliderProgress();

  if (sliderName === "neo-highlights") {
    playButton?.setAttribute("aria-label", "Phát lại video điểm nổi bật");
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
  const tabButtons = tabGroup.querySelectorAll("[data-tab]");
  const panels = tabGroup.querySelectorAll("[data-panel]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      tabButtons.forEach((tabButton) => {
        tabButton.classList.toggle("is-active", tabButton === button);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.panel === target);
      });
    });
  });
});

const closerItems = {
  colors: {
    title: "Màu sắc.",
    text: "Dòng sản phẩm MacBook nhiều màu sắc nhất từ trước đến nay. Chọn trong số bốn màu tuyệt đẹp với bàn phím cùng tông màu. Hình ảnh sản phẩm màu Bạc.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_colors_silver__bhbd7o8mxxzm_large_2x.jpg",
    alt: "MacBook Neo màu bạc nhìn từ mặt lưng",
    colors: ["#e3e4e5", "#efd8d6", "#e8e47d", "#58677f"],
  },
  durable: {
    title: "Thiết kế bền bỉ.",
    text: "MacBook Neo được chế tạo với vỏ nhôm tái chế bền chắc giúp thiết bị sở hữu 60% vật liệu tái chế tính theo trọng lượng.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_durable__d5xca9ckjjwy_large_2x.jpg",
    alt: "MacBook Neo được sử dụng trong phòng tập thể thao",
  },
  display: {
    title: "Màn hình.",
    text: "Với độ phân giải vượt trội và độ sáng 500 nit, màn hình Liquid Retina 13 inch giúp ảnh, trang web và video trở nên sống động.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_display__itqbv51zruy6_large_2x.jpg",
    alt: "Màn hình MacBook Neo hiển thị nội dung màu sắc",
  },
  keyboard: {
    title: "Bàn phím và bàn di.",
    text: "Magic Keyboard đem lại trải nghiệm gõ phím thoải mái và chính xác. Bàn di Multi-Touch lớn cho phép chạm, chụm, vuốt và bấm dễ dàng.",
    startImage:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_keyboard_startframe__fr7rxovk4bmi_large_2x.jpg",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_keyboard_endframe__bsph9ace3meq_large_2x.jpg",
    alt: "Bàn phím và bàn di của MacBook Neo",
  },
  touchid: {
    title: "Touch ID.",
    text: "Touch ID cho phép bạn mở khóa MacBook Neo, đăng nhập vào trang web và ứng dụng, cũng như tải ứng dụng chỉ với một chạm.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_touchid__e7m0tw3z13sm_large_2x.jpg",
    alt: "Cảm biến Touch ID trên MacBook Neo",
  },
  camera: {
    title: "Camera.",
    text: "Camera FaceTime HD 1080p cho hình ảnh rõ ràng và sắc nét trong các cuộc gọi video.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_camera__wehr0awavaam_large_2x.jpg",
    alt: "Camera FaceTime HD trên MacBook Neo",
  },
  audio: {
    title: "Micrô và loa.",
    text: "Hai loa hướng ngang mang đến âm thanh sống động, micrô kép giúp tách biệt và tăng cường độ trong trẻo cho giọng nói.",
    startImage:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_audio_startframe__eyyv3ns7eqie_large_2x.jpg",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_audio_endframe__cybgz641coae_large_2x.jpg",
    alt: "Âm thanh trên MacBook Neo",
  },
  connectivity: {
    title: "Kết nối.",
    text: "Hai cổng USB-C và một jack cắm tai nghe cho phép bạn kết nối phụ kiện, chuyển dữ liệu và sạc MacBook Neo.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_connectivity__f4pmdvbke2mq_large_2x.jpg",
    alt: "Các cổng kết nối trên MacBook Neo",
  },
};

document
  .querySelectorAll(".neo-closer-card[data-legacy-closer]")
  .forEach((closerCard) => {
    const tabGroup = closerCard.querySelector(".neo-closer-tabs");
    const buttons = tabGroup?.querySelectorAll("[data-closer-item]");
    const detail = closerCard.querySelector(".neo-closer-detail");
    const visual = closerCard.querySelector(".neo-closer-visual");
    const image = closerCard.querySelector("#neo-closer-image");
    const closeButton = closerCard.querySelector(".neo-closer-close");

    const setCloserItem = (key, expand = true) => {
      const item = closerItems[key];

      if (!item || !buttons?.length || !detail || !image || !visual) {
        return;
      }

      buttons.forEach((button) => {
        const isActive = button.dataset.closerItem === key;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-expanded", String(isActive && expand));
      });

      closerCard.classList.toggle("is-expanded", expand);
      detail.innerHTML = `
      <p><strong>${item.title}</strong> ${item.text}</p>
      ${item.colors
          ? `<div class="neo-color-dots" aria-label="Màu sắc của MacBook Neo">${item.colors
            .map(
              (color, index) =>
                `<span class="${index === 0 ? "is-active" : ""}" style="background:${color}"></span>`,
            )
            .join("")}</div>`
          : ""
        }
    `;

      visual.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = item.image;
        image.alt = item.alt;
        visual.classList.remove("is-changing");
      }, 140);
    };

    buttons?.forEach((button) => {
      button.addEventListener("click", () => {
        setCloserItem(button.dataset.closerItem, true);
      });
    });

    closeButton?.addEventListener("click", () => {
      closerCard.classList.remove("is-expanded");
      buttons?.forEach((button) => button.setAttribute("aria-expanded", "false"));
    });

    setCloserItem("colors", false);
  });

const neoCloserItems = {
  colors: {
    title: "Màu sắc.",
    text: "Dòng sản phẩm MacBook nhiều màu sắc nhất từ trước đến nay. Chọn trong số bốn màu tuyệt đẹp với bàn phím cùng tông màu.",
    video:
      "https://www.apple.com/105/media/us/macbook-neo/2026/eee281c9-06d4-45d9-9a37-ef16ad413279/anim/highlights-colors/large.mp4",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_hero_endframe__czpdxe2dmawm_large_2x.jpg",
    alt: "MacBook Neo màu xanh indigo mở màn hình trừu tượng",
    caption:
      "Màu sắc. Dòng sản phẩm MacBook nhiều màu sắc nhất từ trước đến nay.",
    colors: [
      {
        name: "Bạc",
        color: "#d9d8d4",
        image:
          "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_colors_silver__bhbd7o8mxxzm_large_2x.jpg",
        alt: "MacBook Neo màu bạc nhìn từ mặt lưng",
      },
      {
        name: "Hồng Phớt",
        color: "#eec9cb",
        image:
          "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_colors_blush__fji4uke74w2m_large_2x.jpg",
        alt: "MacBook Neo màu hồng phớt nhìn từ mặt lưng",
      },
      {
        name: "Vàng Citrus",
        color: "#f4cb4f",
        image:
          "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_colors_citrus__flplef60bpim_large_2x.jpg",
        alt: "MacBook Neo màu vàng citrus nhìn từ mặt lưng",
      },
      {
        name: "Xanh Indigo",
        color: "#4e628e",
        image:
          "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_colors_indigo__ee1m3vsakryq_large_2x.jpg",
        alt: "MacBook Neo màu xanh indigo nhìn từ mặt lưng",
      },
    ],
  },
  durable: {
    title: "Thiết kế bền bỉ.",
    text: "MacBook Neo được chế tạo với vỏ nhôm tái chế bền chắc giúp thiết bị sở hữu 60% vật liệu tái chế tính theo trọng lượng.",
    video:
      "https://www.apple.com/105/media/us/macbook-neo/2026/eee281c9-06d4-45d9-9a37-ef16ad413279/anim/design/xlarge.webm",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_durable__d5xca9ckjjwy_large_2x.jpg",
    alt: "MacBook Neo được sử dụng trong phòng tập thể thao",
    caption:
      "Thiết kế bền bỉ. Vỏ nhôm tái chế chắc chắn cho cuộc sống hàng ngày.",
  },
  display: {
    title: "Màn hình.",
    text: "Với độ phân giải vượt trội và độ sáng 500 nit, màn hình Liquid Retina 13 inch giúp ảnh, trang web và video trở nên sống động.",
    video:
      "https://www.apple.com/105/media/ww/macbook-neo/2026/eee281c9-06d4-45d9-9a37-ef16ad413279/anim/highlights-display/large.mp4",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_display__itqbv51zruy6_large_2x.jpg",
    alt: "Màn hình MacBook Neo hiển thị nội dung màu sắc",
    caption: "Màn hình. Liquid Retina 13 inch sáng rõ với một tỷ màu.",
  },
  keyboard: {
    title: "Bàn phím và bàn di.",
    text: "Magic Keyboard đem lại trải nghiệm gõ phím thoải mái và chính xác. Bàn di Multi-Touch lớn cho phép chạm, chụm, vuốt và bấm dễ dàng.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_keyboard_endframe__bsph9ace3meq_large_2x.jpg",
    alt: "Bàn phím và bàn di của MacBook Neo",
    caption:
      "Bàn phím và bàn di. Magic Keyboard cùng bàn di Multi-Touch rộng rãi.",
  },
  touchid: {
    title: "Touch ID.",
    text: "Touch ID cho phép bạn mở khóa MacBook Neo, đăng nhập vào trang web và ứng dụng, cũng như tải ứng dụng chỉ với một chạm.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_touchid__e7m0tw3z13sm_large_2x.jpg",
    alt: "Cảm biến Touch ID trên MacBook Neo",
    caption: "Touch ID. Mở khóa và xác thực an toàn chỉ bằng một chạm.",
  },
  camera: {
    title: "Camera.",
    text: "Camera FaceTime HD 1080p cho hình ảnh rõ ràng và sắc nét trong các cuộc gọi video.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_camera__wehr0awavaam_large_2x.jpg",
    alt: "Camera FaceTime HD trên MacBook Neo",
    caption: "Camera. FaceTime HD 1080p giúp bạn luôn rõ nét trong cuộc gọi.",
  },
  audio: {
    title: "Micrô và loa.",
    text: "Hai loa hướng ngang mang đến âm thanh sống động, micrô kép giúp tách biệt và tăng cường độ trong trẻo cho giọng nói.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_audio_endframe__cybgz641coae_large_2x.jpg",
    alt: "Âm thanh trên MacBook Neo",
    caption: "Micrô và loa. Âm thanh sống động và giọng nói rõ ràng.",
  },
  connectivity: {
    title: "Kết nối.",
    text: "Hai cổng USB-C và một jack cắm tai nghe cho phép bạn kết nối phụ kiện, chuyển dữ liệu và sạc MacBook Neo.",
    image:
      "https://www.apple.com/v/macbook-neo/b/images/overview/product-viewer/pv_connectivity__f4pmdvbke2mq_large_2x.jpg",
    alt: "Các cổng kết nối trên MacBook Neo",
    caption: "Kết nối. USB-C, sạc và jack cắm tai nghe trong tầm tay.",
  },
};

Object.values(neoCloserItems).forEach((item) => {
  [
    item.image,
    item.startImage,
    ...(item.colors?.map((color) => color.image) || []),
  ]
    .filter(Boolean)
    .forEach((source) => {
      const image = new Image();
      image.src = source;
    });

  if (item.video) {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = item.video;
  }
});

document.querySelectorAll(".neo-closer-card").forEach((closerCard) => {
  const buttons = closerCard.querySelectorAll("[data-closer-item]");
  const detail = closerCard.querySelector(".neo-closer-detail");
  const visual = closerCard.querySelector(".neo-closer-visual");
  const image = closerCard.querySelector("#neo-closer-image");
  const video = closerCard.querySelector("#neo-closer-video");
  const caption = visual?.querySelector("figcaption");
  const closeButton = closerCard.querySelector(".neo-closer-close");
  const prevButton = closerCard.querySelector("[data-closer-prev]");
  const nextButton = closerCard.querySelector("[data-closer-next]");
  const closerKeys = Object.keys(neoCloserItems);
  let selectedColorIndex = 0;
  let closerImageTimer;
  let closerMotionTimer;
  let closerMotionId = 0;

  const clearMotionClasses = () => {
    visual?.classList.remove(
      "is-changing",
      "is-color-picking",
      "is-feature-motion",
    );
    closerCard.classList.remove("is-step-up", "is-step-down");
  };

  const updateImage = (source, alt, text, options = {}) => {
    const motionId = ++closerMotionId;
    window.clearTimeout(closerImageTimer);
    window.clearTimeout(closerMotionTimer);
    clearMotionClasses();

    if (video && !options.videoSource) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      visual?.classList.remove("is-video-active");
    }

    if (options.startSource && image) {
      image.src = options.startSource;
      image.alt = alt;
    }

    visual?.classList.add(
      "is-changing",
      options.colorPick ? "is-color-picking" : "is-feature-motion",
    );

    if (options.direction) {
      closerCard.classList.add(options.direction > 0 ? "is-step-down" : "is-step-up");
    }

    const animateCurrentImage = () => {
      const media = options.videoSource && video ? video : image;

      if (!media?.animate) {
        return;
      }

      media.getAnimations().forEach((animation) => animation.cancel());

      const distance = options.colorPick ? 92 : options.direction ? options.direction * 86 : 48;
      const keyframes = options.colorPick
        ? [
          {
            opacity: 0,
            transform: `translateX(${distance}px) scale(0.96)`,
            filter: "blur(14px) saturate(0.78)",
          },
          {
            opacity: 1,
            transform: "translateX(-8px) scale(1.012)",
            filter: "blur(0) saturate(1.08)",
            offset: 0.72,
          },
          {
            opacity: 1,
            transform: "translateX(0) scale(1)",
            filter: "blur(0) saturate(1)",
          },
        ]
        : [
          {
            opacity: 0,
            transform: `translateY(${options.direction ? distance : 34}px) scale(1.035)`,
            filter: "blur(12px)",
          },
          {
            opacity: 1,
            transform: "translateY(-6px) scale(1.01)",
            filter: "blur(0)",
            offset: 0.68,
          },
          {
            opacity: 1,
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
        ];

      media.animate(keyframes, {
        duration: options.colorPick ? 760 : 680,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "both",
      });
    };

    const commitImage = () => {
      if (motionId !== closerMotionId) {
        return;
      }

      if (options.videoSource && video) {
        image?.classList.add("is-fallback-hidden");
        video.src = options.videoSource;
        video.poster = source;
        video.currentTime = 0;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        visual?.classList.add("is-video-active");
        video.load();
        video.play().catch(() => {
          visual?.classList.remove("is-video-active");
          image?.classList.remove("is-fallback-hidden");
        });
      } else {
        image?.classList.remove("is-fallback-hidden");
      }

      if (image) {
        image.src = source;
        image.alt = alt;
      }
      if (caption) {
        caption.textContent = text;
      }
      visual?.classList.remove("is-changing");
      window.requestAnimationFrame(animateCurrentImage);
    };

    const decodedImage = new Image();
    decodedImage.src = source;

    if (options.startSource) {
      closerImageTimer = window.setTimeout(commitImage, 110);
    } else if (decodedImage.decode) {
      decodedImage.decode().then(commitImage).catch(commitImage);
    } else {
      closerImageTimer = window.setTimeout(commitImage, 0);
    }

    closerMotionTimer = window.setTimeout(clearMotionClasses, 820);
  };

  const updateIcons = (activeKey, expanded) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.closerItem === activeKey;
      const icon = button.querySelector("span:not(.neo-swatch)");

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-expanded", String(isActive && expanded));

      if (icon) {
        icon.textContent = isActive && expanded ? "×" : "+";
      }
    });
  };

  const updateColorSwatch = (color) => {
    const swatch = closerCard.querySelector(".neo-swatch");

    if (swatch) {
      swatch.style.background = color || "";
    }
  };

  const getCloserCopy = (item, activeColor) =>
    `${item.text}${activeColor ? ` Hình ảnh sản phẩm màu ${activeColor.name}.` : ""}`;

  const renderCloserItem = (key, expanded = true, colorIndex = 0, options = {}) => {
    const item = neoCloserItems[key];

    if (!item || !detail || !image || !visual) {
      return;
    }

    if (key === "colors") {
      selectedColorIndex = expanded ? colorIndex : 0;
    }

    const activeColor =
      expanded && item.colors ? item.colors[selectedColorIndex] : null;

    closerCard.dataset.activeCloser = key;
    closerCard.style.setProperty(
      "--closer-detail-offset",
      `${closerKeys.indexOf(key) * 54}px`,
    );
    closerCard.style.setProperty(
      "--closer-detail-space",
      item.colors ? "200px" : "150px",
    );
    closerCard.classList.toggle("is-expanded", expanded);
    updateIcons(key, expanded);
    updateColorSwatch(activeColor?.color);

    detail.innerHTML = `
      <p data-closer-copy><strong>${item.title}</strong> ${getCloserCopy(item, activeColor)}</p>
      ${item.colors
        ? `<div class="neo-color-dots neo-color-picker" aria-label="Màu sắc của MacBook Neo">${item.colors
          .map(
            (color, index) =>
              `<button type="button" class="${index === selectedColorIndex ? "is-active" : ""}" style="background:${color.color}" data-closer-color="${index}" aria-label="${color.name}"></button>`,
          )
          .join("")}</div>`
        : ""
      }
    `;

    updateImage(
      activeColor?.image || item.image,
      activeColor?.alt || item.alt,
      activeColor
        ? `${item.caption} Hình ảnh sản phẩm màu ${activeColor.name}.`
        : item.caption,
      {
        direction: options.direction,
        startSource: expanded && !activeColor ? item.startImage : null,
        videoSource: expanded && !activeColor ? item.video : null,
      },
    );

    detail.querySelectorAll("[data-closer-color]").forEach((colorButton) => {
      colorButton.addEventListener("click", () => {
        const nextIndex = Number(colorButton.dataset.closerColor || 0);
        const nextColor = item.colors?.[nextIndex];

        if (!nextColor) {
          return;
        }

        selectedColorIndex = nextIndex;
        detail
          .querySelectorAll("[data-closer-color]")
          .forEach((button) =>
            button.classList.toggle("is-active", button === colorButton),
          );
        colorButton.classList.add("is-picking");
        window.setTimeout(() => colorButton.classList.remove("is-picking"), 520);
        const copy = detail.querySelector("[data-closer-copy]");

        if (copy) {
          copy.innerHTML = `<strong>${item.title}</strong> ${getCloserCopy(item, nextColor)}`;
        }

        updateColorSwatch(nextColor.color);
        updateImage(
          nextColor.image,
          nextColor.alt,
          `${item.caption} Hình ảnh sản phẩm màu ${nextColor.name}.`,
          { colorPick: true },
        );
      });
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        const nextKey = button.dataset.closerItem;
        renderCloserItem(
          nextKey,
          true,
          nextKey === "colors" ? selectedColorIndex : 0,
        );
      });
    });
  });

  closeButton?.addEventListener("click", () => {
    window.requestAnimationFrame(() => {
      renderCloserItem("colors", false);
    });
  });

  const shiftCloserItem = (direction) => {
    const currentIndex = closerKeys.indexOf(closerCard.dataset.activeCloser);
    const nextIndex =
      (currentIndex + direction + closerKeys.length) % closerKeys.length;

    const arrow = direction < 0 ? prevButton : nextButton;
    arrow?.classList.add("is-pressed");
    window.setTimeout(() => arrow?.classList.remove("is-pressed"), 260);

    renderCloserItem(closerKeys[nextIndex], true, 0, { direction });
  };

  prevButton?.addEventListener("click", () => shiftCloserItem(-1));
  nextButton?.addEventListener("click", () => shiftCloserItem(1));

  renderCloserItem("colors", false);
});

document.querySelectorAll(".play-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const media = event.currentTarget.closest(
      ".neo-story-media, .neo-design-card, .sample-love-media, .intro-visual",
    );
    const video = media?.querySelector(".neo-motion-video");

    if (!media || !video) {
      media?.classList.toggle("is-playing");
      return;
    }

    if (!video.paused && !video.ended) {
      video.pause();
      media.classList.remove("is-playing");
      return;
    }

    media.classList.add("is-playing");
    media.classList.remove("is-video-ended");
    media.classList.remove("is-video-error");
    video.dataset.pendingPlay = "false";
    video.dataset.played = "false";

    try {
      video.currentTime = 0;
    } catch { }

    video.play().catch(() => {
      media.classList.add("is-video-error");
      media.classList.remove("is-playing");
    });
  });
});
