"use client";

import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

function savePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Unable to save the ${key} preference.`, error);
  }
}

function hideUnavailableImage(image: HTMLImageElement) {
  image.hidden = true;

  const slide = image.closest<HTMLElement>(".slide");
  if (!slide) return;

  if (!Array.from(slide.querySelectorAll("img")).some((slideImage) => !slideImage.hidden)) {
    slide.hidden = true;
  }
}

export default function LegacyInteractions({
  children,
  contactForm = false,
}: {
  children: ReactNode;
  contactForm?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [formMessage, setFormMessage] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handlePreferenceClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest(".theme-toggle")) return;
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    savePreference("eden-site-theme", theme);
    const button = target.closest<HTMLButtonElement>(".theme-toggle");
    const isDark = theme === "dark";
    if (button) {
      button.textContent = isDark ? "☀" : "☾";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateBackToTopVisibility = () => {
      setShowBackToTop(window.scrollY > 240);
    };
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    updateBackToTopVisibility();

    const menuToggle = container.querySelector<HTMLElement>(".menu-toggle");
    const menu = container.querySelector<HTMLElement>("#nav-menu");
    const header = container.querySelector<HTMLElement>(".legacy-page > header");
    const navigation = container.querySelector<HTMLElement>(
      ".legacy-page > nav, .legacy-page > .main-menu",
    );
    const themeToggle = container.querySelector<HTMLButtonElement>(".theme-toggle");
    const updateTheme = (theme: "light" | "dark") => {
      document.documentElement.dataset.theme = theme;
      if (themeToggle) {
        const isDark = theme === "dark";
        themeToggle.textContent = isDark ? "☀" : "☾";
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
          "aria-label",
          isDark ? "Switch to light mode" : "Switch to dark mode",
        );
      }
    };
    const readPreference = (key: string) => {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.error(`Unable to read the ${key} preference.`, error);
        return null;
      }
    };
    const savedTheme = readPreference("eden-site-theme");
    updateTheme(savedTheme === "dark" ? "dark" : "light");

    const revealTargets = new Set(
      container.querySelectorAll<HTMLElement>(
        [
          ".page-content > *",
          ".page-content section",
          ".page-content article",
          ".page-content .card",
          ".page-content .feature-card",
          ".page-content .faculty-card",
          ".page-content .teacher-card",
          ".page-content .employee-section",
          ".site-footer",
        ].join(","),
      ),
    );
    let revealObserver: IntersectionObserver | null = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealTargets.forEach((element) => element.classList.add("scroll-reveal--visible"));
    } else if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("scroll-reveal--visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -6% 0px" },
      );
      Array.from(revealTargets).forEach((element, index) => {
        element.classList.add(
          index % 3 === 0
            ? "scroll-reveal--from-left"
            : index % 3 === 1
              ? "scroll-reveal--from-right"
              : "scroll-reveal--from-bottom",
        );
        element.style.setProperty(
          "--scroll-reveal-delay",
          `${Math.min((index % 4) * 65, 195)}ms`,
        );
        const bounds = element.getBoundingClientRect();
        const isInitiallyVisible =
          bounds.bottom > 0 &&
          bounds.top < window.innerHeight &&
          bounds.right > 0 &&
          bounds.left < window.innerWidth;

        if (isInitiallyVisible) {
          element.classList.add("scroll-reveal--visible");
        } else {
          revealObserver?.observe(element);
        }
      });
    } else {
      revealTargets.forEach((element) => element.classList.add("scroll-reveal--visible"));
    }
    const updateNavigationOffset = () => {
      if (header && navigation) {
        const topBarHeight =
          header.querySelector<HTMLElement>(".top-bar")?.offsetHeight ?? 0;
        header.style.setProperty(
          "--sticky-topbar-height",
          `${topBarHeight}px`,
        );
        navigation.style.setProperty(
          "--sticky-header-height",
          `${header.offsetHeight - topBarHeight}px`,
        );
      }
    };
    let headerObserver: ResizeObserver | null = null;
    if (header) {
      headerObserver = new ResizeObserver(updateNavigationOffset);
      headerObserver.observe(header);
    }
    updateNavigationOffset();
    let slides = Array.from(container.querySelectorAll<HTMLElement>(".slide")).filter(
      (slide) => !slide.hidden,
    );
    const slideshow = container.querySelector<HTMLElement>(".slideshow-box");
    const track = slideshow?.querySelector<HTMLElement>(".slideshow-track");
    const pagination = slideshow?.querySelector<HTMLElement>(".slideshow-pagination");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeSlideIndex = slides.findIndex((slide) =>
      slide.classList.contains("slide--active"),
    );
    if (activeSlideIndex < 0 && slides.length > 0) activeSlideIndex = 0;

    const showSlide = (index: number) => {
      slides = Array.from(container.querySelectorAll<HTMLElement>(".slide")).filter(
        (slide) => !slide.hidden,
      );
      if (slides.length === 0) {
        if (slideshow) slideshow.hidden = true;
        if (pagination) pagination.replaceChildren();
        return;
      }
      if (slideshow) slideshow.hidden = false;
      activeSlideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeSlideIndex;
        slide.classList.toggle("slide--active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.setAttribute("aria-label", `${slideIndex + 1} of ${slides.length}`);
      });
      track?.style.setProperty(
        "transform",
        `translate3d(-${activeSlideIndex * 100}%, 0, 0)`,
      );
      if (pagination) {
        if (pagination.children.length !== slides.length) {
          const dots = slides.map((_, slideIndex) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "slideshow-dot";
            dot.dataset.slideIndex = String(slideIndex);
            return dot;
          });
          pagination.replaceChildren(...dots);
        }
        Array.from(pagination.children).forEach((element, slideIndex) => {
          element.setAttribute(
            "aria-label",
            `Show image ${slideIndex + 1} of ${slides.length}`,
          );
          element.setAttribute(
            "aria-current",
            String(slideIndex === activeSlideIndex),
          );
        });
      }
    };

    showSlide(activeSlideIndex);

    const moveSlide = (direction: -1 | 1) => {
      showSlide(activeSlideIndex + direction);
    };
    const pauseSlideshow = () => window.clearInterval(slideshowTimer);
    const resumeSlideshow = () => {
      if (reducedMotion.matches || slides.length < 2 || document.hidden) return;
      pauseSlideshow();
      slideshowTimer = window.setInterval(() => moveSlide(1), 6000);
    };
    let slideshowTimer = 0;
    resumeSlideshow();

    const toggleMenu = () => {
      const isOpen = menu?.classList.toggle("show") ?? false;
      menuToggle?.setAttribute("aria-expanded", String(isOpen));
    };
    const handleMenuClick = (event: MouseEvent) => {
      event.preventDefault();
      toggleMenu();
    };
    const handleMenuKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMenu();
      }
    };
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("#nav-menu a") && menu?.classList.contains("show")) {
        menu.classList.remove("show");
        menuToggle?.setAttribute("aria-expanded", "false");
      }

      if (target.closest(".admission-print[data-action='print']")) {
        event.preventDefault();
        window.print();
        return;
      }

      const arrow = target.closest(".arrow-left, .arrow-right");
      if (arrow && slideshow?.contains(arrow)) {
        moveSlide(arrow.classList.contains("arrow-right") ? 1 : -1);
        pauseSlideshow();
        resumeSlideshow();
        return;
      }

      const dot = target.closest<HTMLButtonElement>(".slideshow-dot");
      if (dot && pagination?.contains(dot)) {
        const index = Number(dot.dataset.slideIndex);
        if (Number.isInteger(index)) {
          showSlide(index);
          pauseSlideshow();
          resumeSlideshow();
        }
      }
    };
    const handleSlideshowKeydown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      moveSlide(event.key === "ArrowRight" ? 1 : -1);
      pauseSlideshow();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseSlideshow();
      } else {
        resumeSlideshow();
      }
    };
    const handleMotionChange = () => {
      if (reducedMotion.matches) {
        pauseSlideshow();
      } else {
        resumeSlideshow();
      }
    };
    const handleSlideshowInteraction = () => pauseSlideshow();
    const handleSlideshowLeave = () => resumeSlideshow();
    const handleChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) ||
          !target.matches(".notice-filter select")) return;

      container.querySelectorAll<HTMLElement>(".notice-item").forEach((item) => {
        item.hidden =
          target.value !== "all" && item.dataset.category !== target.value;
      });
    };
    const handleInput = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.id !== "searchBox") return;
      const search = target.value.trim().toLocaleLowerCase();

      container.querySelectorAll<HTMLTableRowElement>("table tbody tr").forEach((row) => {
        const isHeading = row.querySelector("th") !== null;
        const matches = isHeading || row.textContent?.toLocaleLowerCase().includes(search);
        row.hidden = !matches;
      });
    };
    const handleImageError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) {
        hideUnavailableImage(event.target);
        showSlide(activeSlideIndex);
      }
    };

    if (menuToggle) {
      menuToggle.addEventListener("click", handleMenuClick);
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Toggle navigation");
      menuToggle.setAttribute("aria-controls", "nav-menu");
      if (!(menuToggle instanceof HTMLButtonElement)) {
        menuToggle.tabIndex = 0;
        menuToggle.setAttribute("role", "button");
        menuToggle.addEventListener("keydown", handleMenuKey);
      }
    }

    container.addEventListener("click", handleClick);
    container.addEventListener("change", handleChange);
    container.addEventListener("input", handleInput);
    container.addEventListener("error", handleImageError, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionChange);
    slideshow?.addEventListener("pointerenter", handleSlideshowInteraction);
    slideshow?.addEventListener("pointerleave", handleSlideshowLeave);
    slideshow?.addEventListener("focusin", handleSlideshowInteraction);
    slideshow?.addEventListener("focusout", handleSlideshowLeave);
    slideshow?.addEventListener("keydown", handleSlideshowKeydown);
    container.querySelectorAll("img").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) {
        hideUnavailableImage(image);
      }
    });
    showSlide(activeSlideIndex);

    return () => {
      menuToggle?.removeEventListener("click", handleMenuClick);
      if (menuToggle && !(menuToggle instanceof HTMLButtonElement)) {
        menuToggle.removeEventListener("keydown", handleMenuKey);
      }
      container.removeEventListener("click", handleClick);
      container.removeEventListener("change", handleChange);
      container.removeEventListener("input", handleInput);
      container.removeEventListener("error", handleImageError, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionChange);
      window.removeEventListener("scroll", updateBackToTopVisibility);
      headerObserver?.disconnect();
      revealObserver?.disconnect();
      slideshow?.removeEventListener("pointerenter", handleSlideshowInteraction);
      slideshow?.removeEventListener("pointerleave", handleSlideshowLeave);
      slideshow?.removeEventListener("focusin", handleSlideshowInteraction);
      slideshow?.removeEventListener("focusout", handleSlideshowLeave);
      slideshow?.removeEventListener("keydown", handleSlideshowKeydown);
      pauseSlideshow();
    };
  }, []);

  async function submitContactForm(event: FormEvent<HTMLDivElement>) {
    if (!contactForm || !(event.target instanceof HTMLFormElement)) return;

    const form = event.target;
    if (!form.querySelector('[name="name"]') ||
        !form.querySelector('[name="email"]') ||
        !form.querySelector('[name="message"]')) {
      return;
    }

    event.preventDefault();
    setFormMessage("Sending your message...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setFormMessage(result.error ?? "Your message could not be sent. Please try again.");
        return;
      }

      form.reset();
      setFormMessage(result.message ?? "Your message has been sent.");
    } catch {
      setFormMessage("Unable to reach the server. Please try again.");
    }
  }

  return (
    <div
      className="legacy-interactions"
      ref={containerRef}
      onClickCapture={handlePreferenceClick}
      onSubmitCapture={submitContactForm}
    >
      {children}
      {contactForm && (
        <p className="form-status" role="status" aria-live="polite">
          {formMessage}
        </p>
      )}
      {showBackToTop && (
        <button
          className="back-to-top"
          type="button"
          aria-label="Back to top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            })
          }
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            focusable="false"
          >
            <path
              d="M12 19V5m0 0L6 11m6-6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
