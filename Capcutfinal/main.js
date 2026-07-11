const previewImages = {
  personA:
    "https://p16-seeyou-sg.ibyteimg.com/tos-alisg-i-2zwwjm3azk-sg/5c48a0b582ac4f8a8ed411480183cd91~tplv-2zwwjm3azk-compress%3Aq75.image",
  personB:
    "https://p16-seeyou-sg.ibyteimg.com/tos-alisg-i-2zwwjm3azk-sg/f1d0d9fc4a8b492881a4c2c15ea3ec15~tplv-2zwwjm3azk-compress%3Aq75.image",
};

const toolGroups = {
  image: [
    {
      title: "Công cụ xóa nền",
      text: "Xóa nền hình ảnh ngay lập tức bằng AI chỉ với 1 lần nhấp, phù hợp cho ảnh sản phẩm, ảnh chân dung và nội dung mạng xã hội.",
      img: previewImages.personB,
    },
    {
      title: "Công cụ nâng cấp hình ảnh",
      text: "Cải thiện chất lượng và độ phân giải ảnh bằng AI để hình ảnh sắc nét, có thể đăng ngay hoặc dùng cho tiếp thị.",
      img: previewImages.personA,
    },
    {
      title: "Công cụ điều chỉnh kích thước hình ảnh",
      text: "Nhanh chóng điều chỉnh kích thước và tỷ lệ khung hình phù hợp cho mạng xã hội, trang web, quảng cáo và nội dung số.",
      img: previewImages.personB,
    },
    {
      title: "Trình chỉnh sửa ảnh",
      text: "Chỉnh sửa ảnh trực tuyến với cắt xén thông minh, bộ lọc và hiệu ứng nâng cao ngay trên trình duyệt.",
      img: previewImages.personA,
    },
  ],
  video: [
    {
      title: "Trình chỉnh sửa video trực tuyến",
      text: "Xén, cắt, thêm hiệu ứng chuyển tiếp và phụ đề, xuất video HD cho YouTube, TikTok và Reels.",
      img: previewImages.personA,
    },
    {
      title: "Xóa nền video",
      text: "Xóa nền khỏi video chỉ với 1 lần nhấp, tạo nội dung gọn gàng cho TikTok, Reels và quảng cáo.",
      img: previewImages.personB,
    },
    {
      title: "Trình chuyển đổi video",
      text: "Chuyển đổi video thành MP4, MOV, AVI và nhiều định dạng khác mà vẫn giữ chất lượng.",
      img: previewImages.personA,
    },
    {
      title: "Thêm phụ đề vào video",
      text: "Tạo phụ đề tự động chính xác bằng nhiều ngôn ngữ và chỉnh sửa trực tiếp trong trình duyệt.",
      img: previewImages.personB,
    },
  ],
  audio: [
    {
      title: "Chuyển văn bản thành lời nói",
      text: "Chuyển văn bản thành giọng nói AI tự nhiên để tạo thuyết minh nhanh cho video và podcast.",
      img: previewImages.personB,
    },
    {
      title: "Trích xuất âm thanh",
      text: "Chuyển video thành âm thanh MP3 hoặc WAV chất lượng cao để tái sử dụng trong dự án mới.",
      img: previewImages.personA,
    },
    {
      title: "Loại bỏ tiếng ồn",
      text: "Lọc sạch tiếng ồn nền khỏi âm thanh trong video và cải thiện chất lượng giọng nói ngay lập tức.",
      img: previewImages.personB,
    },
    {
      title: "Cải thiện giọng nói",
      text: "Tăng độ rõ, tăng âm lượng và trau chuốt chất lượng giọng nói cho bản ghi chuyên nghiệp.",
      img: previewImages.personA,
    },
  ],
  template: [
    {
      title: "Mẫu cho Reels và TikTok",
      text: "Chỉnh sửa video ngắn thịnh hành với thiết kế hiện đại, văn bản, nhạc và hiệu ứng trong vài phút.",
      img: previewImages.personA,
    },
    {
      title: "Mẫu dùng cho mạng xã hội",
      text: "Tạo video cuốn hút cho Instagram, Facebook và TikTok với thiết kế có thể dùng ngay.",
      img: previewImages.personB,
    },
    {
      title: "Mẫu hiệu ứng AI",
      text: "Biến ảnh và clip thành video sống động với hiệu ứng chuyển tiếp thông minh và nhạc tự động.",
      img: previewImages.personA,
    },
    {
      title: "Mẫu kinh doanh",
      text: "Tạo video khuyến mãi, quảng cáo và nội dung thương hiệu với thiết kế tùy chỉnh.",
      img: previewImages.personB,
    },
  ],
};

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const tabButtons = document.querySelectorAll("[data-tab]");
const toolList = document.querySelector("[data-tool-list]");
const toolVisual = document.querySelector("[data-tool-visual]");
const toolImg = document.querySelector("[data-tool-img]");
const reviewCards = document.querySelectorAll(".review-card");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 8);
}

function closeMobileMenu() {
  menuToggle.classList.remove("open");
  nav.classList.remove("open");
}

function renderTools(group, activeIndex = 0) {
  const items = toolGroups[group];
  toolList.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = `tool-card${index === activeIndex ? " active" : ""}`;
    card.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p>`;
    card.addEventListener("click", () => renderTools(group, index));
    toolList.appendChild(card);
  });

  toolVisual.classList.add("switching");
  window.setTimeout(() => {
    toolImg.src = items[activeIndex].img;
    toolImg.alt = items[activeIndex].title;
    toolVisual.classList.remove("switching");
  }, 170);
}

function animateCounter(counter) {
  const target = Number(counter.dataset.count);
  const isRating = target === 47;
  let frame = 0;
  const frames = 76;

  function tick() {
    frame += 1;
    const progress = Math.min(frame / frames, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    counter.textContent = isRating ? (value / 10).toFixed(1) : value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  tick();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");

      if (entry.target.classList.contains("stat")) {
        const counter = entry.target.querySelector("[data-count]");
        if (counter && !counter.dataset.done) {
          counter.dataset.done = "true";
          animateCounter(counter);
        }
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal, .stat").forEach((element) => {
  revealObserver.observe(element);
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    renderTools(button.dataset.tab);
  });
});

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("open");
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.querySelectorAll("[data-tilt]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(max-width: 1120px)").matches) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

let reviewIndex = 0;
window.setInterval(() => {
  reviewCards[reviewIndex].classList.remove("active");
  reviewIndex = (reviewIndex + 1) % reviewCards.length;
  reviewCards[reviewIndex].classList.add("active");
}, 4200);

window.addEventListener("scroll", updateHeader, { passive: true });

updateHeader();
renderTools("image");
