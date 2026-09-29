/*
 * =========================================================
 * Syed Abu Khalid Portfolio — Shared JavaScript
 * =========================================================
 * This file is loaded by every HTML page in the portfolio.
 *
 * Main responsibilities:
 * 1. Active navigation + responsive mobile drawer
 * 2. Dark/light theme persistence + dynamic logo swapping
 * 3. tsParticles background
 * 4. Home typing effect + accessible/fallback role text
 * 5. Profile gear rotation with scroll-performance optimization
 * 6. Skills modal
 * 7. Grouped image lightbox with previous/next controls
 * 8. Homepage certificate preview modal
 * 9. Certificate/badge filter buttons
 * 10. Continuous marquee support with reduced-motion handling
 * 11. Independent snapshot/testimonial carousels
 * 12. Project preview iframe modal
 * 13. Contact form validation
 * 14. Keyboard accessibility and modal body locking
 * 15. vCard TXT download
 * 16. Automatic image lazy-loading/decoding fallbacks
 * 17. Previous/next navigation for the inner portfolio pages
 *
 * The code is intentionally defensive. Each feature first checks
 * whether the elements it needs actually exist on the current page.
 * This allows the same script.js file to be safely loaded by every page.
 * =========================================================
 */

(function () {
  "use strict";

  /* =======================================================
     SMALL DOM HELPERS
     -------------------------------------------------------
     These helpers keep the rest of the file readable and avoid
     repeating querySelector/querySelectorAll boilerplate.
     ======================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /*
   * These are the gallery groups that should have their own
   * previous/next navigation sequence.
   *
   * IMPORTANT:
   * "Testimonials" is included here so testimonial images never
   * get mixed with certificates, badges, logos, or project snapshots.
   */
  const imageGalleryGroups = new Set([
    "Certificates",
    "Badges",
    "Logos",
    "Testimonials",
    "Project_Shoaib_Arif_Snaps",
    "Project_Zubair_Alam_Snaps"
  ]);

  /* =======================================================
     SHARED BODY-LOCK HELPER
     -------------------------------------------------------
     The CSS can use .modal-open to prevent the page underneath
     a modal/lightbox from scrolling. A fallback inline style is
     also kept in sync for layouts that do not define the class.
     ======================================================= */

  let bodyLockCount = 0;
  let bodyOverflowBeforeLock = "";

  const lockBody = (lock) => {
    if (!document.body) return;

    if (lock) {
      if (bodyLockCount === 0) {
        bodyOverflowBeforeLock = document.body.style.overflow;
      }

      bodyLockCount += 1;
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      return;
    }

    bodyLockCount = Math.max(0, bodyLockCount - 1);

    if (bodyLockCount === 0) {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = bodyOverflowBeforeLock;
    }
  };

  /* =======================================================
     1. ACTIVE NAVIGATION + MOBILE DRAWER
     ======================================================= */

  function initNavigation() {
    const currentPath =
      window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    const navLinks = $$(".nav-links a");
    const hamburgerBtn = $("#hamburgerBtn");

    /*
     * Code 1 uses .nav-links, while Code 2 optionally used an
     * explicit #siteNavigation wrapper. Support both without
     * requiring either one to be changed in the HTML.
     */
    const navMenu = $("#siteNavigation") || $(".nav-links");

    /* Highlight the current page and expose it to screen readers. */
    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");

      const href = (link.getAttribute("href") || "")
        .split("/")
        .pop()
        .toLowerCase();

      if (href === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });

    if (!hamburgerBtn || !navMenu) return;

    /* Stable accessibility state for the three-line hamburger button. */
    hamburgerBtn.setAttribute(
      "aria-label",
      hamburgerBtn.classList.contains("active")
        ? "Close navigation menu"
        : "Open navigation menu"
    );

    hamburgerBtn.setAttribute(
      "aria-expanded",
      hamburgerBtn.classList.contains("active") ? "true" : "false"
    );

    const closeMobileMenu = () => {
      hamburgerBtn.classList.remove("active");
      navMenu.classList.remove("nav-active", "is-open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Open navigation menu");
      document.body.classList.remove("nav-open");
    };

    const toggleMobileMenu = () => {
      const willOpen = !navMenu.classList.contains("nav-active");

      hamburgerBtn.classList.toggle("active", willOpen);
      navMenu.classList.toggle("nav-active", willOpen);
      navMenu.classList.toggle("is-open", willOpen);
      hamburgerBtn.setAttribute("aria-expanded", String(willOpen));
      hamburgerBtn.setAttribute(
        "aria-label",
        willOpen ? "Close navigation menu" : "Open navigation menu"
      );
      document.body.classList.toggle("nav-open", willOpen);
    };

    hamburgerBtn.addEventListener("click", toggleMobileMenu);

    /* Selecting a page closes the drawer automatically. */
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });

    /* Escape closes the mobile drawer. */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    /*
     * If the user rotates/resizes from mobile into desktop width,
     * the drawer is reset so the desktop layout starts cleanly.
     */
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
  }

  /* =======================================================
     2. PAGE PREVIOUS / NEXT ARROW NAVIGATION
     -------------------------------------------------------
     These arrows are generated automatically on the inner pages:
       Skills → Certifications → Badges → Education
       → Experience → Projects → Contact
     The sequence wraps around so each page has both controls.
     ======================================================= */

  function initInnerPageNavigation() {
    const currentPath =
      window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    const innerPageOrder = [
      { file: "Skills.html", label: "Skills" },
      { file: "Certifications.html", label: "Certifications" },
      { file: "Badges.html", label: "Badges" },
      { file: "Education.html", label: "Education" },
      { file: "Experience.html", label: "Experience" },
      { file: "Projects.html", label: "Projects" },
      { file: "Contact.html", label: "Contact" }
    ];

    const currentPageIndex = innerPageOrder.findIndex(
      (page) => page.file.toLowerCase() === currentPath
    );

    if (currentPageIndex === -1) return;

    /* Do not create duplicates if the script is accidentally initialized twice. */
    if ($(".page-navigation")) return;

    const previousPage =
      innerPageOrder[
        (currentPageIndex - 1 + innerPageOrder.length) % innerPageOrder.length
      ];

    const nextPage =
      innerPageOrder[(currentPageIndex + 1) % innerPageOrder.length];

    const pageNavigation = document.createElement("nav");
    pageNavigation.className = "page-navigation";
    pageNavigation.setAttribute(
      "aria-label",
      "Previous and next portfolio pages"
    );

    pageNavigation.innerHTML = `
      <a class="page-nav-link" href="${previousPage.file}" aria-label="Go to ${previousPage.label}">
        <span class="page-nav-arrow" aria-hidden="true">&#10094;</span>
        <span class="page-nav-label">${previousPage.label}</span>
      </a>

      <a class="page-nav-link" href="${nextPage.file}" aria-label="Go to ${nextPage.label}">
        <span class="page-nav-label">${nextPage.label}</span>
        <span class="page-nav-arrow" aria-hidden="true">&#10095;</span>
      </a>
    `;

    const mainElement = $("main");
    if (mainElement) {
      mainElement.appendChild(pageNavigation);
    }
  }

  /* =======================================================
     3. HOME PAGE TYPEWRITER EFFECT
     -------------------------------------------------------
     The visible role text is expected to contain fallback text
     in the HTML. JavaScript then replaces it with the animated
     sequence when motion is allowed.
     ======================================================= */

  function initTypewriter() {
    const target = $("#typedRole");
    if (!target) return;

    const roles = [
      "Software Developer",
      "Specializing in Agentic AI integrations",
      "Data Analyst",
      "Cybersecurity enthusiast"
    ];

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*
     * Keep a static, readable fallback when the user prefers reduced motion.
     * This is also useful if JavaScript becomes unavailable after page load.
     */
    if (reduceMotion) {
      target.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typingSpeed = 62;
    const deletingSpeed = 36;
    const pauseBetweenRoles = 1500;
    const pauseAfterDeleting = 450;

    target.textContent = "";

    const typeEffect = () => {
      const currentRole = roles[roleIndex];

      if (deleting) {
        charIndex -= 1;
      } else {
        charIndex += 1;
      }

      target.textContent = currentRole.substring(0, charIndex);

      if (!deleting && charIndex === currentRole.length) {
        deleting = true;
        window.setTimeout(typeEffect, pauseBetweenRoles);
        return;
      }

      if (deleting && charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(typeEffect, pauseAfterDeleting);
        return;
      }

      window.setTimeout(
        typeEffect,
        deleting ? deletingSpeed : typingSpeed
      );
    };

    typeEffect();
  }

  /* =======================================================
     4. THEME HELPERS + DYNAMIC LOGO SWAPPING
     ======================================================= */

  let particlesInstance = null;

  const isLightTheme = () =>
    document.documentElement.getAttribute("data-theme") === "light";

  const getParticleColor = (light) =>
    light ? "#0077b6" : "#00ff87";

  function updateLogosForTheme(light) {
    /*
     * These rules preserve Code 1's exact logo swapping behavior.
     * Only logos that have dedicated light/dark files are changed.
     */
    const logoRules = [
      {
        selector: 'img[src*="Oracle_d_logo"], img[src*="Oracle_l_logo"]',
        dark: "Logos/Oracle_d_logo.webp",
        light: "Logos/Oracle_l_logo.png"
      },
      {
        selector: 'img[src*="Anthropic_d_logo"], img[src*="Anthropic_l_logo"]',
        dark: "Logos/Anthropic_d_logo.png",
        light: "Logos/Anthropic_l_logo.png"
      },
      {
        selector: 'img[src*="Cisco_logo"], img[src*="Cisco_l_logo"]',
        dark: "Logos/Cisco_logo.webp",
        light: "Logos/Cisco_l_logo.png"
      },
      {
        selector: 'img[src*="IBM_logo"], img[src*="IBM_lt_logo"]',
        dark: "Logos/IBM_logo.webp",
        light: "Logos/IBM_lt_logo.png"
      },
      {
        selector:
          'img[src*="CONFLUENT-Developer_dt_o_logo"], img[src*="CONFLUENT-Developer_lt_o_logo_2"]',
        dark: "Logos/CONFLUENT-Developer_dt_o_logo.png",
        light: "Logos/CONFLUENT-Developer_lt_o_logo_2.png"
      },
      {
        selector: 'img[src*="ICE_dt_1"], img[src*="ICE_lt_1"]',
        dark: "Logos/ICE_dt_1.png",
        light: "Logos/ICE_lt_1.png"
      },
      {
        selector:
          'img[src*="Olevels_dt_logo"], img[src*="olevels_lt_logo"]',
        dark: "Logos/Olevels_dt_logo.png",
        light: "Logos/olevels_lt_logo.png"
      }
    ];

    logoRules.forEach(({ selector, dark, light: lightSrc }) => {
      $$(selector).forEach((img) => {
        img.src = light ? lightSrc : dark;
      });
    });
  }

  const destroyParticles = () => {
    if (
      particlesInstance &&
      typeof particlesInstance.destroy === "function"
    ) {
      try {
        particlesInstance.destroy();
      } catch (error) {
        /* The visual background is optional; never break the page for it. */
      }
    }

    particlesInstance = null;
  };

  const initTsParticles = (light) => {
    if (!window.tsParticles || typeof window.tsParticles.load !== "function") {
      return;
    }

    const container = $("#tsparticles");
    if (!container) return;

    destroyParticles();

    const particleColor = getParticleColor(light);

    const options = {
      fullScreen: { enable: false },
      fpsLimit: 60,
      background: { color: { value: "transparent" } },
      particles: {
        number: {
          value: 65,
          density: {
            enable: true,
            area: 800
          }
        },
        color: { value: particleColor },
        shape: { type: "circle" },
        opacity: {
          value: 0.5,
          random: false
        },
        size: {
          value: { min: 1.5, max: 3.5 }
        },
        links: {
          enable: true,
          distance: 140,
          color: particleColor,
          opacity: 0.35,
          width: 1
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "bounce" },
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detectsOn: "window",
        events: {
          onHover: {
            enable: true,
            mode: ["grab", "attract"]
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 180,
            links: { opacity: 0.75 }
          },
          attract: {
            distance: 220,
            duration: 0.4,
            factor: 3,
            speed: 1
          }
        }
      },
      detectRetina: true
    };

    try {
      /*
       * Code 1's API form is kept first because it is compatible with
       * the common tsParticles browser build used by the portfolio.
       * A second signature is provided as a safe fallback for builds
       * that expose the object-only load API.
       */
      let loadResult;

      try {
        loadResult = window.tsParticles.load("tsparticles", options);
      } catch (firstError) {
        loadResult = window.tsParticles.load({
          id: "tsparticles",
          options
        });
      }

      Promise.resolve(loadResult)
        .then((instance) => {
          particlesInstance = instance || null;
        })
        .catch((error) => {
          console.warn("tsParticles could not be initialized:", error);
        });
    } catch (error) {
      console.warn("tsParticles could not be initialized:", error);
    }
  };

  /* =======================================================
     5. THEME TOGGLE
     -------------------------------------------------------
     Code 1's localStorage key is preserved so an existing saved
     theme remains valid. Code 2's key is also accepted for users
     coming from that script.
     ======================================================= */

  function initTheme() {
    const themeToggleBtn = $("#themeToggleBtn");
    const themeIcon = themeToggleBtn?.querySelector("i");

    const savedTheme =
      localStorage.getItem("theme") ||
      localStorage.getItem("portfolio-theme");

    const applyTheme = (light) => {
      if (light) {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        localStorage.setItem("portfolio-theme", "light");

        themeIcon?.classList.remove("fa-sun");
        themeIcon?.classList.add("fa-moon");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "dark");
        localStorage.setItem("portfolio-theme", "dark");

        themeIcon?.classList.remove("fa-moon");
        themeIcon?.classList.add("fa-sun");
      }

      if (themeToggleBtn) {
        themeToggleBtn.setAttribute(
          "aria-label",
          light ? "Switch to dark mode" : "Switch to light mode"
        );
        themeToggleBtn.setAttribute("aria-pressed", light ? "true" : "false");
      }

      updateLogosForTheme(light);
      initTsParticles(light);
    };

    applyTheme(savedTheme === "light");

    themeToggleBtn?.addEventListener("click", () => {
      applyTheme(!isLightTheme());
    });
  }

  /* =======================================================
     6. PROFILE GEAR SCROLL ROTATION
     -------------------------------------------------------
     requestAnimationFrame prevents repeated layout work on every
     raw scroll event. The gear logic is completely independent of
     the mobile/desktop navigation state.
     ======================================================= */

  function initGearRotation() {
    const gearRing = $(".gear-ring");
    if (!gearRing) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gearRing.style.setProperty("--gear-angle", "0deg");
      return;
    }

    let ticking = false;

    const updateGearRotation = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      gearRing.style.setProperty(
        "--gear-angle",
        `${(scrollY * 0.24).toFixed(2)}deg`
      );
      ticking = false;
    };

    const requestGearUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateGearRotation);
    };

    window.addEventListener("scroll", requestGearUpdate, { passive: true });
    updateGearRotation();
  }

  /* =======================================================
     7. SKILLS MODAL ON HOMEPAGE
     ======================================================= */

  function initSkillModal() {
    const skillModal = $("#skillModal");
    const skillModalIcon = $("#modalSkillIcon");
    const skillModalTitle = $("#modalSkillTitle");
    const skillModalDesc = $("#modalSkillDesc");
    const skillModalClose = $(".skill-modal-close", skillModal || document);

    if (!skillModal) return;

    const closeSkillModal = () => {
      skillModal.style.display = "none";
      skillModal.setAttribute("aria-hidden", "true");
      lockBody(false);
    };

    /* Keep the modal's accessibility state synchronized. */
    skillModal.setAttribute("aria-hidden", "true");

    $$(".skill-modal-trigger").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.getAttribute("data-title") || "";
        const iconClass = card.getAttribute("data-icon") || "fa-code";
        const desc = card.getAttribute("data-desc") || "";

        if (skillModalIcon) {
          /* Font Awesome brand icons need fa-brands; normal icons need fa-solid. */
          const isBrandIcon =
            iconClass.includes("microsoft") ||
            iconClass.includes("google") ||
            iconClass.includes("github") ||
            iconClass.includes("linkedin");

          skillModalIcon.className = `${
            isBrandIcon ? "fa-brands" : "fa-solid"
          } ${iconClass}`;
        }

        if (skillModalTitle) skillModalTitle.textContent = title;
        if (skillModalDesc) skillModalDesc.textContent = desc;

        skillModal.style.display = "flex";
        skillModal.setAttribute("aria-hidden", "false");
        lockBody(true);
        skillModalClose?.focus();
      });
    });

    skillModalClose?.addEventListener("click", closeSkillModal);

    skillModal.addEventListener("click", (event) => {
      if (event.target === skillModal) {
        closeSkillModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        skillModal.style.display === "flex"
      ) {
        closeSkillModal();
      }
    });
  }

  /* =======================================================
     8. IMAGE LIGHTBOX + DYNAMIC GALLERY GROUPING
     -------------------------------------------------------
     Code 1 had a single flat image array. That becomes difficult
     to navigate once certificates, badges, logos, testimonials,
     and project snapshots are all present.
     
     The improved version derives a gallery from the image path:
       Certificates
       Badges
       Logos
       Testimonials
       Project_Shoaib_Arif_Snaps
       Project_Zubair_Alam_Snaps
     
     Duplicate image paths are removed inside each group, so the
     same source image cannot appear twice in its arrow sequence.
     ======================================================= */

  const deriveGallery = (src) => {
    if (!src) return null;

    let normalized = src;

    try {
      normalized = decodeURIComponent(src);
    } catch (error) {
      /* Keep the original source if decoding fails. */
    }

    normalized = normalized.replace(/\\/g, "/");

    if (normalized.includes("Project_Shoaib_Arif_Snaps/")) {
      return "Project_Shoaib_Arif_Snaps";
    }

    if (normalized.includes("Project_Zubair_Alam_Snaps/")) {
      return "Project_Zubair_Alam_Snaps";
    }

    const parts = normalized.split("/");

    if (parts.includes("Certificates")) return "Certificates";
    if (parts.includes("Badges")) return "Badges";
    if (parts.includes("Logos")) return "Logos";
    if (parts.includes("Testimonials")) return "Testimonials";

    return null;
  };

  const getElementImageSource = (element) => {
    if (!element) return "";

    if (element.tagName === "IMG") {
      return (
        element.currentSrc ||
        element.getAttribute("src") ||
        element.src ||
        ""
      );
    }

    return (
      element.getAttribute("data-img") ||
      element.dataset.img ||
      element.querySelector("img")?.currentSrc ||
      element.querySelector("img")?.getAttribute("src") ||
      ""
    );
  };

  const getImageAltText = (element) => {
    if (!element) return "Expanded image";

    return (
      element.getAttribute("alt") ||
      element.querySelector("img")?.getAttribute("alt") ||
      element.getAttribute("data-title") ||
      "Expanded image"
    );
  };

  const prepareGalleryTriggers = () => {
    /* Education/provider logos can use the grouped Logos lightbox. */
    $$('img[src*="Logos/"]').forEach((img) => {
      img.classList.add("lightbox-trigger");
    });

    /* Snapshot/testimonial images should use the same lightbox system. */
    $$(".snapshot-img, img.testimonial-img").forEach((img) => {
      img.classList.add("lightbox-trigger");
    });
  };

  const uniqueGalleryItems = (group) => {
    const seen = new Set();
    const items = [];

    const selector =
      'img.lightbox-trigger, img.cert-modal-trigger, .cert-overview-card.cert-modal-trigger';

    $$(selector).forEach((element) => {
      const src = getElementImageSource(element);
      if (!src || deriveGallery(src) !== group) return;

      let absoluteSrc = src;

      try {
        absoluteSrc = new URL(src, document.baseURI).href;
      } catch (error) {
        /* Keep the original source as the deduplication key. */
      }

      if (seen.has(absoluteSrc)) return;
      seen.add(absoluteSrc);

      items.push({
        src,
        title: element.getAttribute("data-title") || element.getAttribute("title") || "",
        alt: getImageAltText(element)
      });
    });

    return items;
  };

  function initImageLightbox() {
    const imageModal = $("#imageModal");
    const imageModalImg = $("#imgFull");

    if (!imageModal || !imageModalImg) return;

    const imageModalClose =
      $("#modalCloseBtn") || $(".modal-close", imageModal);
    const imageModalPrev =
      $("#modalPrevBtn") || $(".modal-prev", imageModal);
    const imageModalNext =
      $("#modalNextBtn") || $(".modal-next", imageModal);

    let currentGroup = null;
    let currentItems = [];
    let lightboxIndex = 0;

    const setArrowState = () => {
      const canNavigate =
        currentGroup &&
        imageGalleryGroups.has(currentGroup) &&
        currentItems.length > 1;

      if (imageModalPrev) imageModalPrev.hidden = !canNavigate;
      if (imageModalNext) imageModalNext.hidden = !canNavigate;

      /* Keep screen readers informed when arrows are unavailable. */
      imageModalPrev?.setAttribute(
        "aria-hidden",
        canNavigate ? "false" : "true"
      );
      imageModalNext?.setAttribute(
        "aria-hidden",
        canNavigate ? "false" : "true"
      );
    };

    const renderCurrentImage = () => {
      const item = currentItems[lightboxIndex];
      if (!item) return;

      imageModalImg.src = item.src;
      imageModalImg.alt = item.alt || "Expanded image";

      if (item.title) {
        imageModalImg.setAttribute("title", item.title);
      } else {
        imageModalImg.removeAttribute("title");
      }
    };

    const closeLightbox = () => {
      if (imageModal.style.display !== "flex") return;

      imageModal.style.display = "none";
      imageModal.setAttribute("aria-hidden", "true");
      imageModalImg.removeAttribute("src");
      imageModalImg.removeAttribute("title");
      currentGroup = null;
      currentItems = [];
      lightboxIndex = 0;
      lockBody(false);
    };

    const openLightbox = (element) => {
      const source = getElementImageSource(element);
      if (!source) return;

      currentGroup = deriveGallery(source);

      if (currentGroup && imageGalleryGroups.has(currentGroup)) {
        currentItems = uniqueGalleryItems(currentGroup);
      } else {
        currentItems = [
          {
            src: source,
            title: element.getAttribute("data-title") || "",
            alt: getImageAltText(element)
          }
        ];
      }

      let absoluteSource = source;

      try {
        absoluteSource = new URL(source, document.baseURI).href;
      } catch (error) {
        /* Keep source unchanged if URL normalization fails. */
      }

      lightboxIndex = currentItems.findIndex((item) => {
        try {
          return new URL(item.src, document.baseURI).href === absoluteSource;
        } catch (error) {
          return item.src === source;
        }
      });

      if (lightboxIndex < 0) lightboxIndex = 0;

      renderCurrentImage();
      setArrowState();

      imageModal.style.display = "flex";
      imageModal.setAttribute("aria-hidden", "false");
      lockBody(true);
      imageModalClose?.focus();
    };

    const moveLightbox = (delta) => {
      if (
        !currentGroup ||
        !imageGalleryGroups.has(currentGroup) ||
        currentItems.length < 2
      ) {
        return;
      }

      lightboxIndex =
        (lightboxIndex + delta + currentItems.length) % currentItems.length;

      renderCurrentImage();
    };

    imageModal.setAttribute("aria-hidden", "true");

    imageModal.addEventListener("click", (event) => {
      if (event.target === imageModal) {
        closeLightbox();
      }
    });

    imageModalClose?.addEventListener("click", closeLightbox);

    imageModalPrev?.addEventListener("click", (event) => {
      event.stopPropagation();
      moveLightbox(-1);
    });

    imageModalNext?.addEventListener("click", (event) => {
      event.stopPropagation();
      moveLightbox(1);
    });

    prepareGalleryTriggers();

    /*
     * Bind each trigger once. This prevents duplicate listeners if
     * an image has both a generic lightbox class and a certificate class.
     */
    $$(".lightbox-trigger, .cert-modal-trigger").forEach((trigger) => {
      /*
       * Certificate overview cards now use the same shared lightbox
       * as badges, education, testimonials, and project snapshots.
       * The existing cert-modal-trigger class is retained because it
       * may also be used by the site's visual styling.
       */
      if (trigger.dataset.lightboxBound === "true") return;

      trigger.dataset.lightboxBound = "true";
      trigger.style.cursor = "pointer";

      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openLightbox(trigger);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (imageModal.style.display !== "flex") return;

      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveLightbox(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveLightbox(1);
      }
    });
  }

  /* =======================================================
     9. HOMEPAGE CERTIFICATE PREVIEW MODAL
     -------------------------------------------------------
     Legacy certificate-modal code is kept for compatibility.
     Certificate overview cards now use the shared image lightbox
     above, giving them the same previous/next navigation as the
     other homepage overview images.
     ======================================================= */

  function initCertificatePreviewModal() {
    const certModal = $("#certModal");
    const modalCertTitle = $("#modalCertTitle");
    const modalCertImg = $("#modalCertImg");
    const certCloseBtn = $(".cert-modal-close", certModal || document);

    if (!certModal || !modalCertImg) return;

    const closeCertModal = () => {
      if (certModal.style.display !== "flex") return;

      certModal.style.display = "none";
      certModal.setAttribute("aria-hidden", "true");
      modalCertImg.removeAttribute("src");
      lockBody(false);
    };

    certModal.setAttribute("aria-hidden", "true");

    $$("#certifications-overview .cert-modal-trigger:not(.lightbox-trigger)").forEach((card) => {
      card.addEventListener("click", (event) => {
        /*
         * This dedicated homepage modal handles the card preview.
         * The generic lightbox may also be attached elsewhere, so
         * only intercept the click when the homepage modal exists.
         */
        event.preventDefault();

        const title = card.getAttribute("data-title") || "Certificate";
        const image = card.getAttribute("data-img") || "";

        if (!image) return;

        if (modalCertTitle) modalCertTitle.textContent = title;
        modalCertImg.src = image;
        modalCertImg.alt = title;
        certModal.style.display = "flex";
        certModal.setAttribute("aria-hidden", "false");
        lockBody(true);
        certCloseBtn?.focus();
      });
    });

    certCloseBtn?.addEventListener("click", closeCertModal);

    certModal.addEventListener("click", (event) => {
      if (event.target === certModal) {
        closeCertModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        certModal.style.display === "flex"
      ) {
        closeCertModal();
      }
    });
  }

  /* =======================================================
     10. CERTIFICATE / BADGE FILTER BUTTONS
     ======================================================= */

  function initFilterButtons() {
    $$(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const targetSectionId = button.getAttribute("data-target");
        const filterValue = button.getAttribute("data-filter");

        if (!targetSectionId || !filterValue) return;

        const targetSection = document.getElementById(targetSectionId);

        /* Update only the filter buttons belonging to this section. */
        $$(`.filter-btn[data-target="${targetSectionId}"]`).forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        if (!targetSection) return;

        targetSection.querySelectorAll(".cert-provider").forEach((provider) => {
          const organization = provider.getAttribute("data-org");

          provider.classList.toggle(
            "hide",
            filterValue !== "all" && organization !== filterValue
          );
        });
      });

      /* Give filters an initial accessible state when missing. */
      if (!button.hasAttribute("aria-pressed")) {
        button.setAttribute(
          "aria-pressed",
          button.classList.contains("active") ? "true" : "false"
        );
      }
    });
  }

  /* =======================================================
     11. CONTINUOUS MARQUEES
     -------------------------------------------------------
     The CSS is expected to animate these tracks with a transform:
       translate3d(...)
     JavaScript only calculates a synchronized duration from the
     actual track width. This keeps the physical scrolling speed
     consistent even when the content size changes.
     
     Supported tracks:
       - logo-slider-track
       - skills-carousel-track
       - certs-carousel-track
       - home-overview-track
     ======================================================= */

  function initMarquees() {
    const tracks = $$(
      ".logo-slider-track, .skills-carousel-track, .certs-carousel-track, .home-overview-track"
    );

    if (!tracks.length) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    tracks.forEach((track) => {
      /*
       * A duplicated marquee half should not be announced twice by a
       * screen reader. This assumes the HTML follows the normal
       * duplicated-track pattern used by continuous marquees.
       */
      const children = Array.from(track.children);

      if (children.length > 1 && children.length % 2 === 0) {
        const half = children.length / 2;
        children.slice(half).forEach((item) => {
          item.setAttribute("aria-hidden", "true");
        });
      }

      /*
       * Reduced-motion users get no automatic movement. The CSS can
       * still provide a manually scrollable track on mobile.
       */
      if (reduceMotion) {
        track.style.removeProperty("--marquee-duration");
        track.style.animationPlayState = "paused";
        return;
      }

      const applyDuration = () => {
        const travelDistance = track.scrollWidth / 2;

        if (!travelDistance || !Number.isFinite(travelDistance)) return;

        /* 60px/s keeps all homepage marquees physically synchronized. */
        const durationSeconds = Math.max(8, travelDistance / 60);
        track.style.setProperty(
          "--marquee-duration",
          `${durationSeconds.toFixed(2)}s`
        );
      };

      applyDuration();
      window.addEventListener("resize", applyDuration, { passive: true });

      $$('img', track).forEach((img) => {
        img.addEventListener("load", applyDuration, { once: true });
      });
    });
  }

  /* =======================================================
     12. GENERIC SNAPSHOT / TESTIMONIAL CAROUSELS
     -------------------------------------------------------
     Each carousel owns its own timer and index. This means:
       - Shoaib snapshots navigate independently.
       - Zubair snapshots navigate independently.
       - CS testimonials navigate independently.
       - Physics testimonials navigate independently.
     
     The code also supports generic .snapshot-carousel and
     .testimonial-carousel wrappers from Code 2.
     ======================================================= */

  function initSnapshotCarousels() {
    const carousels = $$(
      ".snapshot-carousel, .testimonial-carousel, #shoaibCarousel, #zubairCarousel, #csTestimonialsCarousel, #physicsTestimonialsCarousel"
    );

    if (!carousels.length) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    carousels.forEach((carousel) => {
      const images = $$(
        ".snapshot-img, img.testimonial-img",
        carousel
      );

      if (!images.length) return;

      let currentIndex = 0;
      let timer = 0;

      const updatePositions = (nextIndex) => {
        currentIndex = (nextIndex + images.length) % images.length;

        images.forEach((image, index) => {
          image.classList.remove("active", "prev", "next");

          if (index === currentIndex) {
            image.classList.add("active");
            image.setAttribute("aria-hidden", "false");
          } else if (
            index ===
            (currentIndex - 1 + images.length) % images.length
          ) {
            image.classList.add("prev");
            image.setAttribute("aria-hidden", "true");
          } else if (index === (currentIndex + 1) % images.length) {
            image.classList.add("next");
            image.setAttribute("aria-hidden", "true");
          } else {
            image.setAttribute("aria-hidden", "true");
          }
        });
      };

      const moveNext = () => {
        updatePositions(currentIndex + 1);
      };

      updatePositions(0);

      if (images.length < 2 || reduceMotion) return;

      const startTimer = () => {
        if (timer) return;
        timer = window.setInterval(moveNext, 3500);
      };

      const stopTimer = () => {
        if (!timer) return;
        window.clearInterval(timer);
        timer = 0;
      };

      startTimer();

      /* Pause when the user is actively interacting with the carousel. */
      carousel.addEventListener("mouseenter", stopTimer);
      carousel.addEventListener("mouseleave", startTimer);
      carousel.addEventListener("focusin", stopTimer);
      carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
          startTimer();
        }
      });
      carousel.addEventListener("touchstart", stopTimer, {
        passive: true
      });
      carousel.addEventListener("touchend", startTimer, {
        passive: true
      });
    });
  }

  /* =======================================================
     13. PROJECT LIVE PREVIEW MODAL
     ======================================================= */

  function initProjectModal() {
    const projectModalElement = $("#projectModal");
    const projectIframe = $("#projectIframe");
    const closeProjectModalBtn = $("#closeModalBtn");
    const chromeTabTitle = $("#chromeTabTitle");
    const openModalButtons = $$(".open-modal-btn");

    if (!projectModalElement) return;

    const isParentInLightMode = () =>
      document.documentElement.getAttribute("data-theme") === "light";

    const closeProjectModal = () => {
      if (!projectModalElement.classList.contains("active")) return;

      projectModalElement.classList.remove("active");
      projectModalElement.setAttribute("aria-hidden", "true");

      if (projectIframe) {
        projectIframe.src = "";
      }

      lockBody(false);
    };

    projectModalElement.setAttribute("aria-hidden", "true");

    openModalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const projectSrc = button.getAttribute("data-src") || "";
        const projectTitle =
          button.getAttribute("data-title") || "Project View";

        if (!projectSrc) return;

        if (projectIframe) {
          projectIframe.src = projectSrc;
        }

        if (chromeTabTitle) {
          chromeTabTitle.textContent = projectTitle;
        }

        projectModalElement.classList.add("active");
        projectModalElement.setAttribute("aria-hidden", "false");
        lockBody(true);
        closeProjectModalBtn?.focus();
      });
    });

    projectIframe?.addEventListener("load", () => {
      try {
        const iframeDocument =
          projectIframe.contentDocument ||
          projectIframe.contentWindow?.document;

        if (!iframeDocument?.body) return;

        if (isParentInLightMode()) {
          iframeDocument.documentElement.setAttribute("data-theme", "light");
          iframeDocument.body.classList.add("light-mode", "light");
        } else {
          iframeDocument.documentElement.setAttribute("data-theme", "dark");
          iframeDocument.body.classList.remove("light-mode", "light");
        }
      } catch (error) {
        /*
         * Cross-origin iframe access is blocked by the browser.
         * The project preview itself still works normally.
         */
        console.info("Project iframe theme sync skipped:", error);
      }
    });

    closeProjectModalBtn?.addEventListener("click", closeProjectModal);

    projectModalElement.addEventListener("click", (event) => {
      if (event.target === projectModalElement) {
        closeProjectModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        projectModalElement.classList.contains("active")
      ) {
        closeProjectModal();
      }
    });
  }

  /* =======================================================
     14. CONTACT FORM VALIDATION
     -------------------------------------------------------
     HTML should already contain proper required attributes,
     labels, and input types. This JavaScript keeps browser-native
     validation active and reports invalid fields accessibly.
     ======================================================= */

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    });

    /*
     * A small explicit email check is useful when the HTML has an
     * email input but no custom validation message.
     */
    const emailInput =
      form.querySelector('input[type="email"]') ||
      form.querySelector('input[name="email"]');

    if (emailInput) {
      emailInput.addEventListener("input", () => {
        if (emailInput.validity.typeMismatch) {
          emailInput.setCustomValidity("Please enter a valid email address.");
        } else {
          emailInput.setCustomValidity("");
        }
      });
    }
  }

  /* =======================================================
     15. ACCESSIBLE / PERFORMANCE-FRIENDLY IMAGE FALLBACKS
     -------------------------------------------------------
     Images are lazy-loaded where appropriate, decoded asynchronously,
     and given fallback alt text when the HTML omitted it.
     The profile image remains eager so the main hero does not wait
     unnecessarily for lazy loading.
     ======================================================= */

  function initLazyImageFallbacks() {
    const images = $$([
      ".cert-card img",
      ".cert-overview-card img",
      ".home-overview-image",
      ".home-overview-logo",
      ".snapshot-img",
      "img.testimonial-img"
    ].join(", "));

    images.forEach((img) => {
      if (!img.alt) {
        const parentTitle = img.closest("[data-title]")?.getAttribute("data-title");
        img.alt = parentTitle || "Portfolio image";
      }

      if (!img.hasAttribute("loading") && !img.src.includes("profile.jpg")) {
        img.loading = "lazy";
      }

      img.decoding = img.decoding || "async";
    });
  }

  /* =======================================================
     16. EXTERNAL PROJECT LINK SAFETY
     -------------------------------------------------------
     Any external link opened in a new tab gets the recommended
     noopener/noreferrer relationship automatically.
     ======================================================= */

  function initExternalLinkSafety() {
    $$('a[target="_blank"]').forEach((link) => {
      const relTokens = new Set(
        (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean)
      );

      relTokens.add("noopener");
      relTokens.add("noreferrer");

      link.setAttribute("rel", Array.from(relTokens).join(" "));
    });
  }

  /* =======================================================
     17. INITIALIZATION
     -------------------------------------------------------
     Every initializer is independent and defensive, so pages that
     do not contain a particular feature simply skip that section.
     ======================================================= */

  function init() {
    initNavigation();
    initInnerPageNavigation();
    initTheme();
    initTypewriter();
    initGearRotation();
    initSkillModal();
    initImageLightbox();
    initCertificatePreviewModal();
    initFilterButtons();
    initMarquees();
    initSnapshotCarousels();
    initProjectModal();
    initContactForm();
    initLazyImageFallbacks();
    initExternalLinkSafety();

    /*
     * vCard support is initialized last because it is completely
     * independent from the rest of the portfolio functionality.
     */
    initVCardDownload();
  }

  /* =======================================================
     18. VCARD TXT DOWNLOAD
     -------------------------------------------------------
     Kept from Code 1 exactly as a client-side download feature.
     ======================================================= */

  function initVCardDownload() {
    const vcardBtn = $("#download-vcard");
    if (!vcardBtn) return;

    vcardBtn.addEventListener("click", () => {
      const vCardData = `BEGIN:VCARD
VERSION:2.3
FN:Muhammad Affan Bukhari
NICKNAME:Syed Abu Khalid
STATUS:Active Student
TEL:+966567967138
EMAIL:syedabukhalid.pro@gmail.com
ADR:;;Riyadh;Saudi Arabia;;;
END:VCARD`;

      const blob = new Blob([vCardData], {
        type: "text/plain;charset=utf-8"
      });

      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = "Syed_Abu_Khalid_VCard.txt";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();