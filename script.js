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
   * get mixed with certificates, badges, logos, Education_logos or project snapshots.
   */
  const imageGalleryGroups = new Set([
    "Certificates",
    "Badges",
    "Logos",
    "Education_logos",
    "home_testimonials",
    "home_projects",
    "computer_science_testimonials",
    "physics_testimonials",
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
      if (!link.querySelector(".nav-roll")) {
        const label = link.textContent.trim();
        const roll = document.createElement("span");
        const track = document.createElement("span");
        const original = document.createElement("span");
        const duplicate = document.createElement("span");

        roll.className = "nav-roll";
        track.className = "nav-roll__track";
        original.className = "nav-roll__label";
        duplicate.className = "nav-roll__label";
        roll.setAttribute("aria-hidden", "true");
        original.textContent = label;
        duplicate.textContent = label;
        track.append(original, duplicate);
        roll.append(track);

        link.setAttribute("aria-label", label);
        link.replaceChildren(roll);
      }

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
     SCROLL AND PAGE-ENTRY REVEALS
     ======================================================= */

  function initScrollAnimations() {
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window) || !document.body) {
      return;
    }

    const pendingElements = new Set();
    let visibilityCheckScheduled = false;

    const showElement = (element) => {
      if (!pendingElements.has(element)) return;

      pendingElements.delete(element);
      element.classList.add("is-visible");
      element.style.willChange = "transform, opacity";
      observer.unobserve(element);

      const clearAnimationState = () => {
        element.style.willChange = "";
        element.style.removeProperty("--reveal-delay");
        element.classList.remove(
          "scroll-reveal",
          "scroll-reveal--fade",
          "scroll-reveal--left",
          "scroll-reveal--right",
          "scroll-reveal--top",
          "scroll-reveal--bottom",
          "scroll-reveal--scale",
          "is-visible"
        );
        element.removeEventListener("transitionend", onTransitionEnd);
      };
      const onTransitionEnd = (event) => {
        if (event.propertyName === "opacity") clearAnimationState();
      };

      element.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(clearAnimationState, 2600);
    };

    const reveal = (elements, direction = "fade", stagger = false, delay = 0) => {
      const delayByGroup = new Map();

      elements.forEach((element) => {
        if (element.classList.contains("scroll-reveal")) return;

        element.classList.add("scroll-reveal", `scroll-reveal--${direction}`);
        if (delay) {
          element.style.setProperty("--reveal-delay", `${delay}ms`);
        }

        if (stagger) {
          const group =
            element.closest(".cert-grid, .skills-grid") || element.parentElement;
          const index = delayByGroup.get(group) || 0;
          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(index * 65, 455)}ms`
          );
          delayByGroup.set(group, index + 1);
        }

        pendingElements.add(element);
        observer.observe(element);
      });
    };

    const revealSelector = (selector, direction, stagger = false, delay = 0) =>
      reveal($$(selector), direction, stagger, delay);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) showElement(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    const currentPath =
      window.location.pathname.split("/").pop().toLowerCase() || "index.html";

    if (currentPath === "index.html") {
      revealSelector("#home .bio, #home #download-vcard", "left");
      revealSelector("#profilePic", "scale");
      revealSelector("#portfolio-stats .stat-card:nth-child(odd)", "top", true);
      revealSelector("#portfolio-stats .stat-card:nth-child(even)", "bottom", true);

      revealSelector("#skills-overview .skills-desc, #skills-overview .skills-action", "left");
      revealSelector("#skills-overview .skills-carousel-side", "right");

      revealSelector("#certifications-overview .certs-carousel-side", "left");
      revealSelector(
        "#certifications-overview .certs-desc, #certifications-overview .certs-action",
        "right"
      );

      revealSelector("#badges-overview .home-overview-desc, #badges-overview .home-overview-action", "left");
      revealSelector("#badges-overview .home-overview-carousel", "right");

      revealSelector("#education-overview .home-overview-carousel", "left");
      revealSelector(
        "#education-overview .home-overview-desc, #education-overview .home-overview-action",
        "right"
      );

      revealSelector(
        "#experience-overview .home-overview-desc, #experience-overview .home-overview-action",
        "left"
      );
      revealSelector("#experience-overview .home-overview-carousel", "right");

      revealSelector("#projects-overview .home-overview-carousel", "left");
      revealSelector(
        "#projects-overview .home-overview-desc, #projects-overview .home-overview-action",
        "right"
      );

      revealSelector("#contact-overview .home-overview-desc, #contact-overview .home-overview-action", "fade");
    } else if (currentPath === "skills.html") {
      revealSelector("#skills .skill-card", "bottom", true);
    } else if (currentPath === "certifications.html" || currentPath === "badges.html") {
      revealSelector(
        "#certifications > p, #badges > p, .filter-container",
        "fade"
      );
      revealSelector(".cert-card", "bottom", true);
    } else if (currentPath === "education.html") {
      revealSelector("#education .edu-card:nth-child(odd)", "left");
      revealSelector("#education .edu-card:nth-child(even)", "right");
    } else if (currentPath === "experience.html") {
      revealSelector(".experience-layout-row.left-box > .exp-card", "left");
      revealSelector(".experience-layout-row.left-box > .testimonial-carousel", "right");
      revealSelector(".experience-layout-row.right-box > .testimonial-carousel", "left");
      revealSelector(".experience-layout-row.right-box > .exp-card", "right");
    } else if (currentPath === "projects.html") {
      revealSelector("#projects > p", "fade", false, 250);
      revealSelector("#projects > .projects-container > .projects-cards > .project-card", "left");
      revealSelector(".project-layout-row.left-box > .project-card", "left");
      revealSelector(".project-layout-row.left-box > .snapshot-carousel", "right");
      revealSelector(".project-layout-row.right-box > .snapshot-carousel", "left");
      revealSelector(".project-layout-row.right-box > .project-card", "right");
    } else if (currentPath === "contact.html") {
      revealSelector("#contact .info-item, #contact .contact-sub", "left");
      revealSelector("#contact .contact-form", "right");
    }

    const checkVisibleElements = () => {
      visibilityCheckScheduled = false;

      pendingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (
          rect.bottom > 0 &&
          rect.top < window.innerHeight * 0.95 &&
          rect.right > 0 &&
          rect.left < window.innerWidth
        ) {
          showElement(element);
        }
      });
    };
    const scheduleVisibilityCheck = () => {
      if (visibilityCheckScheduled) return;
      visibilityCheckScheduled = true;
      window.requestAnimationFrame(checkVisibleElements);
    };

    revealSelector(".page-navigation .page-nav-link:first-child", "left");
    revealSelector(".page-navigation .page-nav-link:last-child", "right");

    document.body.classList.add("motion-ready");
    if (currentPath === "index.html") {
      const profilePic = $("#profilePic");
      if (profilePic) {
        window.requestAnimationFrame(() => showElement(profilePic));
      }
    }
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck, { passive: true });
    scheduleVisibilityCheck();
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
      "a Software Developer",
      "Specializing in Agentic AI integrations",
      "a Data Analyst",
      "a Cybersecurity enthusiast"
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
        dark: "Logos/Education_logos/ICE_dt_1.png",
        light: "Logos/Education_logos/ICE_lt_1.png"
      },
      {
        selector:
          'img[src*="Olevels_dt_logo"], img[src*="olevels_lt_logo"]',
        dark: "Logos/Education_logos/Olevels_dt_logo.png",
        light: "Logos/Education_logos/olevels_lt_logo.png"
      }
    ];

    logoRules.forEach(({ selector, dark, light: lightSrc }) => {
      $$(selector).forEach((img) => {
        img.src = light ? lightSrc : dark;
      });
    });
  }

  /* =======================================================
     5. THEME TOGGLE
     -------------------------------------------------------
     Code 1's localStorage key is preserved so an existing saved
     theme remains valid. Code 2's key is also accepted for users
     coming from that script.
     ======================================================= */

  const isLightTheme = () =>
    document.documentElement.getAttribute("data-theme") === "light";

  function initTheme() {
    const themeToggleBtn = $("#themeToggleBtn");
    const themeIcon = themeToggleBtn?.querySelector("i");

    const savedTheme =
      localStorage.getItem("theme") ||
      localStorage.getItem("portfolio-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

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
    };

    applyTheme(initialTheme === "light");

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
    const skillModalPrev = $("#skillModalPrevBtn");
    const skillModalNext = $("#skillModalNextBtn");
    const skillCards = $$(".skill-modal-trigger").filter(
      (card) => card.getAttribute("aria-hidden") !== "true"
    );

    if (!skillModal) return;

    let currentSkillIndex = 0;

    const renderSkill = () => {
      const card = skillCards[currentSkillIndex];
      if (!card) return;

      const title = card.getAttribute("data-title") || "";
      const iconClass = card.getAttribute("data-icon") || "fa-code";
      const desc = card.getAttribute("data-desc") || "";
      const isBrandIcon =
        iconClass.includes("microsoft") ||
        iconClass.includes("google") ||
        iconClass.includes("github") ||
        iconClass.includes("linkedin");

      if (skillModalIcon) {
        skillModalIcon.className = `${
          isBrandIcon ? "fa-brands" : "fa-solid"
        } ${iconClass}`;
      }

      if (skillModalTitle) skillModalTitle.textContent = title;
      if (skillModalDesc) skillModalDesc.textContent = desc;
    };

    const moveSkill = (delta) => {
      if (skillCards.length < 2) return;

      currentSkillIndex =
        (currentSkillIndex + delta + skillCards.length) % skillCards.length;
      renderSkill();
    };

    const closeSkillModal = () => {
      skillModal.style.display = "none";
      skillModal.setAttribute("aria-hidden", "true");
      if (skillModalPrev) skillModalPrev.hidden = true;
      if (skillModalNext) skillModalNext.hidden = true;
      lockBody(false);
    };

    /* Keep the modal's accessibility state synchronized. */
    skillModal.setAttribute("aria-hidden", "true");

    $$(".skill-modal-trigger").forEach((card) => {
      card.addEventListener("click", () => {
        const clickedSkillIndex = skillCards.indexOf(card);
        currentSkillIndex =
          clickedSkillIndex >= 0
            ? clickedSkillIndex
            : skillCards.findIndex(
                (skillCard) =>
                  skillCard.getAttribute("data-title") ===
                  card.getAttribute("data-title")
              );
        if (currentSkillIndex < 0) currentSkillIndex = 0;
        renderSkill();

        skillModal.style.display = "flex";
        skillModal.setAttribute("aria-hidden", "false");
        if (skillModalPrev) skillModalPrev.hidden = skillCards.length < 2;
        if (skillModalNext) skillModalNext.hidden = skillCards.length < 2;
        lockBody(true);
        skillModalClose?.focus();
      });
    });

    skillModalPrev?.addEventListener("click", (event) => {
      event.stopPropagation();
      moveSkill(-1);
    });

    skillModalNext?.addEventListener("click", (event) => {
      event.stopPropagation();
      moveSkill(1);
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
        return;
      }

      if (skillModal.style.display === "flex" && event.key === "ArrowLeft") {
        event.preventDefault();
        moveSkill(-1);
      }

      if (skillModal.style.display === "flex" && event.key === "ArrowRight") {
        event.preventDefault();
        moveSkill(1);
      }
    });
  }

  /* =======================================================
     8. IMAGE LIGHTBOX + DYNAMIC GALLERY GROUPING
     -------------------------------------------------------
     Code 1 had a single flat image array. That becomes difficult
     to navigate once certificates, badges, logos, testimonials,
     and project snapshots are all present.
     
     Homepage overview sliders intentionally combine both testimonial
     sets and both project sets. Dedicated pages instead derive separate
     galleries from each image path.
     
     Duplicate image paths are removed inside each group, so the
     same source image cannot appear twice in its arrow sequence.
     ======================================================= */

  const deriveGallery = (src, element = null) => {
    if (!src) return null;

    const explicitGroup = element?.closest("[data-gallery]")?.dataset.gallery;
    if (explicitGroup) return explicitGroup;

    if (element?.closest(".home-overview-carousel-testimonials")) {
      return "home_testimonials";
    }

    if (element?.closest(".home-overview-carousel-projects")) {
      return "home_projects";
    }

    if (element?.closest(".home-overview-carousel-education")) {
      return "Education_logos";
    }

    let normalized = src;

    try {
      normalized = decodeURIComponent(src);
    } catch (error) {
      /* Keep the original source if decoding fails. */
    }

    normalized = normalized.replace(/\\/g, "/");
    const normalizedLowerCase = normalized.toLowerCase();

    if (normalizedLowerCase.includes("project_shoaib_arif_snaps/")) {
      return "Project_Shoaib_Arif_Snaps";
    }

    if (normalizedLowerCase.includes("project_zubair_alam_snaps/")) {
      return "Project_Zubair_Alam_Snaps";
    }

    if (normalizedLowerCase.includes("computer_science_students_testimonials/")) {
      return "computer_science_testimonials";
    }

    if (normalizedLowerCase.includes("physics_students_testimonials/")) {
      return "physics_testimonials";
    }

    const parts = normalizedLowerCase.split("/");

    if (parts.includes("certificates")) return "Certificates";
    if (parts.includes("badges")) return "Badges";
    if (parts.includes("education_logos")) return "Education_logos";
    if (parts.includes("logos")) return "Logos";

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
    
    $$('img[src*="Education_logos/"]').forEach((img) => {
      img.classList.add('lightbox-trigger');
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
      if (!src || deriveGallery(src, element) !== group) return;

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
    let touchStartPoint = null;

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

      currentGroup = deriveGallery(source, element);

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
      const clickedElement =
        event.target instanceof Element ? event.target : null;
      const clickedArrow = clickedElement?.closest(
        ".modal-prev, .modal-next"
      );

      if (clickedArrow) {
        event.stopPropagation();
        moveLightbox(clickedArrow.classList.contains("modal-prev") ? -1 : 1);
        return;
      }

      if (event.target === imageModal) {
        closeLightbox();
      }
    });

    imageModalClose?.addEventListener("click", closeLightbox);

    imageModalImg.addEventListener(
      "touchstart",
      (event) => {
        const touch = event.touches[0];
        touchStartPoint = touch
          ? { x: touch.clientX, y: touch.clientY }
          : null;
      },
      { passive: true }
    );

    imageModalImg.addEventListener(
      "touchend",
      (event) => {
        if (!touchStartPoint) return;

        const touch = event.changedTouches[0];
        const deltaX = touch ? touch.clientX - touchStartPoint.x : 0;
        const deltaY = touch ? touch.clientY - touchStartPoint.y : 0;
        touchStartPoint = null;

        if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) {
          return;
        }

        moveLightbox(deltaX < 0 ? 1 : -1);
      },
      { passive: true }
    );

    imageModalImg.addEventListener("touchcancel", () => {
      touchStartPoint = null;
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
     9A. INTERACTIVE HOMEPAGE MARQUEE CONTROLS
     -------------------------------------------------------
     The existing CSS animations continue to control the automatic
     movement exactly as before. This additional feature simply lets
     the user manually move the same animated tracks when desired.

     Supported interactions:
       - Mouse wheel over a carousel
       - Horizontal trackpad scrolling
       - Click-and-drag with a mouse
       - Touch swipe on phones/tablets
       - Horizontal finger movement follows the user's swipe direction

     Manual movement temporarily pauses the CSS animation, changes
     its current timeline position, and then resumes from that new
     position. This prevents the carousel from jumping back to the
     beginning after the user manually moves it.

     The following homepage carousels are included:
       - Skills
       - Certifications
       - Badges
       - Education
       - Experience / Testimonials
       - Projects
     ======================================================= */

  let interactiveMarqueeScrollingInitialized = false;

  function initInteractiveMarqueeScrolling() {
    /* Prevent duplicate event listeners if initialization runs twice. */
    if (interactiveMarqueeScrollingInitialized) return;

    const carousels = [
      {
        containerSelector: ".skills-carousel-side",
        trackSelector: ".skills-carousel-track",
        cardSelector: ".skill-card"
      },
      {
        containerSelector: ".certs-carousel-side",
        trackSelector: ".certs-carousel-track",
        cardSelector: ".cert-overview-card"
      },
      {
        containerSelector: ".home-overview-carousel-badges",
        trackSelector: ".home-overview-track",
        cardSelector: ".home-overview-image-card"
      },
      {
        containerSelector: ".home-overview-carousel-education",
        trackSelector: ".home-overview-track",
        cardSelector: ".home-overview-logo-card"
      },
      {
        containerSelector: ".home-overview-carousel-testimonials",
        trackSelector: ".home-overview-track",
        cardSelector: ".home-overview-image-card"
      },
      {
        containerSelector: ".home-overview-carousel-projects",
        trackSelector: ".home-overview-track",
        cardSelector: ".home-overview-image-card"
      }
    ];

    const getMarqueeAnimation = (track) => {
      if (!track || typeof track.getAnimations !== "function") return null;

      /*
       * CSS animations appear in getAnimations(). We use the first
       * animation with a usable timeline because each marquee track
       * has one continuous CSS animation controlling its transform.
       */
      return (
        track
          .getAnimations()
          .find((animation) => animation.effect && animation.currentTime != null) ||
        null
      );
    };

    const getAnimationDuration = (animation, track) => {
      const effectDuration = animation?.effect?.getComputedTiming?.().duration;

      if (
        typeof effectDuration === "number" &&
        Number.isFinite(effectDuration) &&
        effectDuration > 0
      ) {
        return effectDuration;
      }

      /* Fallback for browsers where the animation effect does not expose duration. */
      const durationText = getComputedStyle(track).animationDuration.split(",")[0].trim();
      if (!durationText) return 0;

      const durationValue = parseFloat(durationText);
      if (!Number.isFinite(durationValue) || durationValue <= 0) return 0;

      return durationText.endsWith("ms")
        ? durationValue
        : durationValue * 1000;
    };

    const moveTrackByPixels = (track, pixelDelta) => {
      if (!track || !Number.isFinite(pixelDelta) || pixelDelta === 0) return false;

      const animation = getMarqueeAnimation(track);
      if (!animation) return false;

      /*
       * The existing marquee keyframes travel from 0% to -50%.
       * Because the HTML contains a duplicated set of items, half of
       * the track width represents one complete seamless loop.
       */
      const loopWidth = track.scrollWidth / 2;
      if (!Number.isFinite(loopWidth) || loopWidth <= 1) return false;

      const duration = getAnimationDuration(animation, track);
      if (!Number.isFinite(duration) || duration <= 0) return false;

      const currentTime = Number(animation.currentTime);
      if (!Number.isFinite(currentTime)) return false;

      /*
       * Positive pixelDelta means "move the visible track to the right".
       * Increasing animation time moves the track left, so the signs are
       * intentionally reversed here.
       */
      const timeDelta = (-pixelDelta / loopWidth) * duration;

      /*
       * Keep the timeline inside one animation cycle. Because the
       * animation repeats forever, wrapping the time this way gives
       * the same visual position without ever producing a negative
       * timeline value when the user scrolls far in the opposite direction.
       */
      let nextTime = currentTime + timeDelta;
      nextTime = ((nextTime % duration) + duration) % duration;

      animation.pause();
      animation.currentTime = nextTime;
      return true;
    };

    const setupCarousel = (container, track, cardSelector) => {
      if (!container || !track || container.dataset.manualScrollBound === "true") {
        return;
      }

      container.dataset.manualScrollBound = "true";
      const cards = $$(cardSelector, container);

      let resumeTimer = null;
      let pointerActive = false;
      let horizontalDrag = false;
      let dragMoved = false;
      let pointerId = null;
      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let suppressClickUntil = 0;

      /*
       * Touch devices get their own swipe state.
       * Keeping touch handling separate from mouse pointer-drag handling
       * prevents mobile browsers from treating a horizontal swipe as an
       * ordinary page gesture before the carousel can respond to it.
       */
      let touchActive = false;
      let touchHorizontal = false;
      let touchMoved = false;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchLastX = 0;

      const clearResumeTimer = () => {
        if (resumeTimer) {
          window.clearTimeout(resumeTimer);
          resumeTimer = null;
        }
      };

      const resumeAnimation = () => {
        clearResumeTimer();

        if (cards.some((card) => card.matches(":hover"))) return;

        const animation = getMarqueeAnimation(track);
        animation?.play();
      };

      const scheduleResume = () => {
        clearResumeTimer();

        /* A short delay lets a series of wheel/swipe movements feel continuous. */
        resumeTimer = window.setTimeout(resumeAnimation, 900);
      };

      cards.forEach((card) => {
        card.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "touch") return;

          clearResumeTimer();
          getMarqueeAnimation(track)?.pause();
        });

        card.addEventListener("pointerleave", (event) => {
          if (event.pointerType === "touch") return;

          if (cards.some((hoveredCard) => hoveredCard.matches(":hover"))) return;

          getMarqueeAnimation(track)?.play();
        });
      });

      /*
       * Mouse wheel + trackpad support.
       * Horizontal trackpad movement uses deltaX directly. A normal
       * mouse wheel uses deltaY as a convenient horizontal control so
       * the user does not need a special horizontal scrollbar.
       */
      container.addEventListener(
        "wheel",
        (event) => {
          let pixelDelta = 0;

          if (event.shiftKey && Math.abs(event.deltaY) > 0) {
            /*
             * Shift + wheel is a horizontal scroll gesture. Browser
             * positive horizontal deltas normally mean "scroll content
             * to the right", which visually moves the content left.
             * Reverse that delta so the carousel follows the user's
             * requested left/right direction.
             */
            pixelDelta = -event.deltaY;
          } else if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
            /*
             * Horizontal trackpad gesture. deltaX uses the browser's
             * scroll direction, so reverse it to match the direction
             * the carousel visibly moves on screen.
             */
            pixelDelta = -event.deltaX;
          } else {
            /* Normal vertical mouse wheel should scroll the webpage, not the carousel. */
            return;
          }

          if (!Number.isFinite(pixelDelta) || Math.abs(pixelDelta) < 0.5) return;

          const moved = moveTrackByPixels(track, pixelDelta);
          if (!moved) return;

          /* Stop the page itself from moving while the user controls the carousel. */
          event.preventDefault();
          event.stopPropagation();
          scheduleResume();
        },
        { passive: false }
      );

      /*
       * Pointer dragging provides the same manual movement on desktop
       * as a swipe provides on touch devices.
       */
      container.addEventListener("pointerdown", (event) => {
        /*
         * Touch screens use the explicit touch handlers below.
         * Keeping pointer handling for mouse input preserves the
         * existing laptop/desktop drag behavior exactly as before.
         */
        if (event.pointerType === "touch") return;
        if (event.pointerType === "mouse" && event.button !== 0) return;

        pointerActive = true;
        horizontalDrag = false;
        dragMoved = false;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        lastX = event.clientX;

        clearResumeTimer();

        const animation = getMarqueeAnimation(track);
        animation?.pause();
      });

      container.addEventListener("pointermove", (event) => {
        /* Touch movement is handled separately below. */
        if (event.pointerType === "touch") return;
        if (!pointerActive || event.pointerId !== pointerId) return;

        const totalX = event.clientX - startX;
        const totalY = event.clientY - startY;

        /* Decide whether this gesture is horizontal or normal page scrolling. */
        if (!horizontalDrag && !dragMoved) {
          if (Math.abs(totalX) < 6 && Math.abs(totalY) < 6) return;

          if (Math.abs(totalX) <= Math.abs(totalY)) {
            /* Vertical gesture: leave it to the browser/page. */
            pointerActive = false;
            return;
          }

          horizontalDrag = true;
          container.setPointerCapture?.(pointerId);
        }

        if (!horizontalDrag) return;

        const deltaX = event.clientX - lastX;
        lastX = event.clientX;

        if (Math.abs(deltaX) < 0.01) return;

        const moved = moveTrackByPixels(track, deltaX);
        if (!moved) return;

        dragMoved = true;
        event.preventDefault();
        scheduleResume();
      });

      const finishPointer = (event) => {
        /* Touch screens use touchend/touchcancel below instead. */
        if (event.pointerType === "touch") return;
        if (!pointerActive || event.pointerId !== pointerId) return;

        if (horizontalDrag && dragMoved) {
          /* Prevent the drag from accidentally activating a card/lightbox on release. */
          suppressClickUntil = performance.now() + 350;
        }

        try {
          if (container.hasPointerCapture?.(pointerId)) {
            container.releasePointerCapture(pointerId);
          }
        } catch (error) {
          /* Pointer capture is optional; failure should never break the carousel. */
        }

        pointerActive = false;
        horizontalDrag = false;
        dragMoved = false;
        pointerId = null;
        scheduleResume();
      };

      container.addEventListener("pointerup", finishPointer);
      container.addEventListener("pointercancel", finishPointer);
      container.addEventListener("lostpointercapture", () => {
        pointerActive = false;
        horizontalDrag = false;
        dragMoved = false;
        pointerId = null;
      });

      /*
       * -------------------------------------------------------------
       * Mobile touch swipe support
       * -------------------------------------------------------------
       * The carousel keeps its automatic CSS animation, but users can
       * also swipe a finger horizontally across it:
       *
       *   Finger moves LEFT  -> carousel moves LEFT
       *   Finger moves RIGHT -> carousel moves RIGHT
       *
       * A vertical finger movement is deliberately handed back to the
       * browser so the normal page scroll remains smooth.
       */
      const getSingleTouch = (event) => {
        if (!event.touches || event.touches.length !== 1) return null;
        return event.touches[0];
      };

      container.addEventListener(
        "touchstart",
        (event) => {
          const touch = getSingleTouch(event);
          if (!touch) return;

          touchActive = true;
          touchHorizontal = false;
          touchMoved = false;
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          touchLastX = touch.clientX;

          clearResumeTimer();

          /* Pause the automatic motion while the finger controls the carousel. */
          const animation = getMarqueeAnimation(track);
          animation?.pause();
        },
        { passive: true }
      );

      container.addEventListener(
        "touchmove",
        (event) => {
          if (!touchActive) return;

          const touch = getSingleTouch(event);
          if (!touch) return;

          const totalX = touch.clientX - touchStartX;
          const totalY = touch.clientY - touchStartY;

          /*
           * Wait for a small movement before deciding whether this is
           * horizontal carousel control or normal vertical page scrolling.
           */
          if (!touchHorizontal && !touchMoved) {
            if (Math.abs(totalX) < 6 && Math.abs(totalY) < 6) return;

            if (Math.abs(totalX) <= Math.abs(totalY)) {
              /*
               * Vertical swipe: stop controlling the carousel and let
               * the browser continue scrolling the page normally.
               */
              touchActive = false;

              const animation = getMarqueeAnimation(track);
              animation?.play();
              return;
            }

            touchHorizontal = true;
          }

          if (!touchHorizontal) return;

          const deltaX = touch.clientX - touchLastX;
          touchLastX = touch.clientX;

          if (!Number.isFinite(deltaX) || Math.abs(deltaX) < 0.01) return;

          /*
           * Finger direction and visible carousel direction should match:
           * moving the finger left moves the carousel left, and vice versa.
           */
          const moved = moveTrackByPixels(track, deltaX);
          if (!moved) return;

          touchMoved = true;

          /*
           * Once the gesture is confirmed as horizontal, prevent the page
           * from turning it into a browser-level horizontal movement.
           */
          event.preventDefault();
          event.stopPropagation();

          scheduleResume();
        },
        { passive: false }
      );

      const finishTouch = () => {
        if (!touchActive) return;

        if (touchHorizontal && touchMoved) {
          /* Prevent the swipe from accidentally opening the card on release. */
          suppressClickUntil = performance.now() + 350;
        }

        touchActive = false;
        touchHorizontal = false;
        touchMoved = false;

        scheduleResume();
      };

      container.addEventListener("touchend", finishTouch, { passive: true });
      container.addEventListener("touchcancel", finishTouch, { passive: true });

      /*
       * A horizontal drag generates a normal click event after release.
       * Suppress only that generated click; ordinary single clicks still
       * open the existing skill modal/lightbox exactly as before.
       */
      container.addEventListener(
        "click",
        (event) => {
          if (performance.now() < suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickUntil = 0;
          }
        },
        true
      );

      /* Respect the existing CSS hover-pause behavior. */
      container.addEventListener("pointerleave", () => {
        if (!pointerActive) {
          const animation = getMarqueeAnimation(track);
          animation?.play();
        }
      });

      /* Keep the page usable if the user tabs through carousel controls. */
      container.addEventListener("focusout", () => {
        window.setTimeout(() => {
          if (!container.contains(document.activeElement) && !pointerActive) {
            const animation = getMarqueeAnimation(track);
            animation?.play();
          }
        }, 0);
      });
    };

    carousels.forEach(({ containerSelector, trackSelector, cardSelector }) => {
      $$(containerSelector).forEach((container) => {
        const track = $(trackSelector, container);
        setupCarousel(container, track, cardSelector);
      });
    });

    interactiveMarqueeScrollingInitialized = true;
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
       - skills-carousel-track
       - certs-carousel-track
       - home-overview-track
     ======================================================= */

  function initMarquees() {
    const tracks = $$(
      ".skills-carousel-track, .certs-carousel-track, .home-overview-track"
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
    initScrollAnimations();
    initTheme();
    initTypewriter();
    initGearRotation();
    initSkillModal();
    initImageLightbox();
    initCertificatePreviewModal();
    initInteractiveMarqueeScrolling();
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