/*
 * =========================================================
 * Syed Abu Khalid Portfolio — Shared JavaScript
 * =========================================================
 * This file is loaded by every HTML page in the portfolio.
 *
 * Main responsibilities:
 * 1. Active navigation + responsive hamburger menu
 * 2. Dark/light theme persistence
 * 3. tsParticles background
 * 4. Home typing effect + profile gear rotation
 * 5. Skills and certificate modals
 * 6. Shared image lightbox with previous/next arrows
 * 7. Project preview iframe modal
 * 8. Certificate/badge filtering
 * 9. Snapshot carousels
 * 10. Previous/next page arrows for the inner pages
 * 11. vCard TXT download
 *
 * The code is written defensively: every feature first checks
 * whether the required elements exist on the current page.
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =======================================================
     1. ACTIVE NAVIGATION + MOBILE MENU
     ======================================================= */

  const currentPath = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.querySelector(".nav-links");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");

    const href = (link.getAttribute("href") || "").split("/").pop().toLowerCase();

    if (href === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const closeMobileMenu = () => {
    hamburgerBtn?.classList.remove("active");
    navMenu?.classList.remove("nav-active");
  };

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("nav-active");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  /* =======================================================
     2. PAGE PREVIOUS / NEXT ARROW NAVIGATION
     -------------------------------------------------------
     These arrows are added automatically to:
       Skills → Certifications → Badges → Education
       → Experience → Projects → Contact
     The sequence wraps around, so every requested page has
     both a working previous and next button.
     ======================================================= */

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

  if (currentPageIndex !== -1) {
    const previousPage =
      innerPageOrder[(currentPageIndex - 1 + innerPageOrder.length) % innerPageOrder.length];

    const nextPage =
      innerPageOrder[(currentPageIndex + 1) % innerPageOrder.length];

    const pageNavigation = document.createElement("nav");
    pageNavigation.className = "page-navigation";
    pageNavigation.setAttribute("aria-label", "Previous and next portfolio pages");

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

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.appendChild(pageNavigation);
    }
  }

  /* =======================================================
     3. HOME PAGE TYPING EFFECT
     ======================================================= */

  const typedRoleElement = document.getElementById("typedRole");

  if (typedRoleElement) {
    const roles = [
      "Software Developer",
      "Specializing in Agentic AI integrations",
      "Data Analyst",
      "Cybersecurity enthusiast"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 80;
    const deletingSpeed = 40;
    const pauseBetween = 1800;

    const typeEffect = () => {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typedRoleElement.textContent = currentRole.substring(0, charIndex);

      let timeout = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        timeout = pauseBetween;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        timeout = 500;
      }

      window.setTimeout(typeEffect, timeout);
    };

    typeEffect();
  }

  /* =======================================================
     4. THEME HELPERS + LOGO SWAPPING
     ======================================================= */

  let particlesInstance = null;

  const isLightTheme = () =>
    document.documentElement.getAttribute("data-theme") === "light";

  const getParticleColor = (light) =>
    light ? "#0077b6" : "#00ff87";

  const updateLogosForTheme = (light) => {
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
        selector: 'img[src*="CONFLUENT-Developer_dt_o_logo"], img[src*="CONFLUENT-Developer_lt_o_logo_2"]',
        dark: "Logos/CONFLUENT-Developer_dt_o_logo.png",
        light: "Logos/CONFLUENT-Developer_lt_o_logo_2.png"
      },
      {
        selector: 'img[src*="ICE_dt_1"], img[src*="ICE_lt_1"]',
        dark: "Logos/ICE_dt_1.png",
        light: "Logos/ICE_lt_1.png"
      },
      {
        selector: 'img[src*="Olevels_dt_logo"], img[src*="olevels_lt_logo"]',
        dark: "Logos/Olevels_dt_logo.png",
        light: "Logos/olevels_lt_logo.png"
      }
    ];

    logoRules.forEach(({ selector, dark, light: lightSrc }) => {
      document.querySelectorAll(selector).forEach((img) => {
        img.src = light ? lightSrc : dark;
      });
    });
  };

  const destroyParticles = () => {
    if (particlesInstance && typeof particlesInstance.destroy === "function") {
      particlesInstance.destroy();
      particlesInstance = null;
    }
  };

  const initTsParticles = (light) => {
    if (typeof tsParticles === "undefined") return;

    const container = document.getElementById("tsparticles");
    if (!container) return;

    destroyParticles();

    const particleColor = getParticleColor(light);

    tsParticles
      .load("tsparticles", {
        fullScreen: { enable: false },
        fpsLimit: 60,
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
            outModes: {
              default: "bounce"
            },
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
              links: {
                opacity: 0.75
              }
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
      })
      .then((instance) => {
        particlesInstance = instance;
      })
      .catch((error) => {
        console.warn("tsParticles could not be initialized:", error);
      });
  };

  /* =======================================================
     5. PROFILE GEAR SCROLL ROTATION
     ======================================================= */

  const gearRing = document.querySelector(".gear-ring");

  if (gearRing) {
    const updateGearRotation = () => {
      gearRing.style.setProperty(
        "--gear-angle",
        `${window.scrollY * 0.2}deg`
      );
    };

    window.addEventListener("scroll", updateGearRotation, { passive: true });
    updateGearRotation();
  }

  /* =======================================================
     6. THEME TOGGLE
     ======================================================= */

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = themeToggleBtn?.querySelector("i");

  const applyTheme = (light) => {
    if (light) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");

      themeIcon?.classList.remove("fa-sun");
      themeIcon?.classList.add("fa-moon");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");

      themeIcon?.classList.remove("fa-moon");
      themeIcon?.classList.add("fa-sun");
    }

    updateLogosForTheme(light);
    initTsParticles(light);
  };

  const savedTheme = localStorage.getItem("theme");
  applyTheme(savedTheme === "light");

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      applyTheme(!isLightTheme());
    });
  }

  /* =======================================================
     7. SKILLS MODAL ON HOMEPAGE
     ======================================================= */

  const skillModal = document.getElementById("skillModal");
  const skillModalIcon = document.getElementById("modalSkillIcon");
  const skillModalTitle = document.getElementById("modalSkillTitle");
  const skillModalDesc = document.getElementById("modalSkillDesc");
  const skillModalClose = document.querySelector(".skill-modal-close");

  const closeSkillModal = () => {
    if (skillModal) {
      skillModal.style.display = "none";
    }
  };

  if (
    skillModal &&
    skillModalIcon &&
    skillModalTitle &&
    skillModalDesc
  ) {
    document.querySelectorAll(".skill-modal-trigger").forEach((card) => {
      card.addEventListener("click", () => {
        const title = card.getAttribute("data-title") || "";
        const iconClass = card.getAttribute("data-icon") || "fa-code";
        const desc = card.getAttribute("data-desc") || "";

        skillModalIcon.className =
          iconClass.includes("microsoft") || iconClass.includes("google")
            ? `fa-brands ${iconClass}`
            : `fa-solid ${iconClass}`;

        skillModalTitle.textContent = title;
        skillModalDesc.textContent = desc;
        skillModal.style.display = "flex";
      });
    });

    skillModalClose?.addEventListener("click", closeSkillModal);

    skillModal.addEventListener("click", (event) => {
      if (event.target === skillModal) {
        closeSkillModal();
      }
    });
  }

  /* =======================================================
     8. SHARED IMAGE LIGHTBOX
     -------------------------------------------------------
     Works with:
       - certificate images
       - badge images
       - testimonial snapshots
       - project snapshots
       - homepage overview images
       - any future .lightbox-trigger element
     ======================================================= */

  const imageModal = document.getElementById("imageModal");
  const imageModalImg = document.getElementById("imgFull");
  const imageModalClose = document.querySelector(".modal-close");
  const imageModalPrev = document.getElementById("modalPrevBtn");
  const imageModalNext = document.getElementById("modalNextBtn");

  let lightboxTriggers = [];
  let lightboxIndex = -1;

  const getImageSource = (element) =>
    element?.getAttribute("data-img") ||
    element?.getAttribute("src") ||
    element?.querySelector("img")?.getAttribute("src") ||
    "";

  const openLightboxAt = (index) => {
    if (!imageModal || !imageModalImg) return;
    if (index < 0 || index >= lightboxTriggers.length) return;

    const source = getImageSource(lightboxTriggers[index]);
    if (!source) return;

    const altText =
      lightboxTriggers[index].getAttribute("alt") ||
      lightboxTriggers[index].querySelector("img")?.getAttribute("alt") ||
      "Image preview";

    imageModalImg.src = source;
    imageModalImg.alt = altText;
    imageModal.style.display = "flex";
    lightboxIndex = index;
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!imageModal) return;

    imageModal.style.display = "none";
    imageModalImg?.removeAttribute("src");
    document.body.style.overflow = "";
  };

  if (imageModal) {
    lightboxTriggers = Array.from(
      document.querySelectorAll(
        ".lightbox-trigger, .cert-card img.cert-modal-trigger"
      )
    );

    lightboxTriggers.forEach((trigger, index) => {
      trigger.style.cursor = "pointer";

      trigger.addEventListener("click", () => {
        openLightboxAt(index);
      });
    });

    imageModalClose?.addEventListener("click", closeLightbox);

    imageModal.addEventListener("click", (event) => {
      if (event.target === imageModal) {
        closeLightbox();
      }
    });

    imageModalPrev?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!lightboxTriggers.length) return;

      const nextIndex =
        (lightboxIndex - 1 + lightboxTriggers.length) %
        lightboxTriggers.length;

      openLightboxAt(nextIndex);
    });

    imageModalNext?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!lightboxTriggers.length) return;

      const nextIndex =
        (lightboxIndex + 1) % lightboxTriggers.length;

      openLightboxAt(nextIndex);
    });
  }

  /* =======================================================
     9. HOMEPAGE CERTIFICATE PREVIEW MODAL
     -------------------------------------------------------
     Kept as a separate modal to preserve the existing
     homepage certificate-card behavior.
     ======================================================= */

  const certModal = document.getElementById("certModal");
  const modalCertTitle = document.getElementById("modalCertTitle");
  const modalCertImg = document.getElementById("modalCertImg");
  const certCloseBtn = document.querySelector(".cert-modal-close");

  const closeCertModal = () => {
    if (certModal) {
      certModal.style.display = "none";
      modalCertImg?.removeAttribute("src");
    }
  };

  if (certModal && modalCertTitle && modalCertImg) {
    document
      .querySelectorAll("#certifications-overview .cert-modal-trigger")
      .forEach((card) => {
        card.addEventListener("click", () => {
          const title = card.getAttribute("data-title") || "Certificate";
          const image = card.getAttribute("data-img") || "";

          if (!image) return;

          modalCertTitle.textContent = title;
          modalCertImg.src = image;
          certModal.style.display = "flex";
          document.body.style.overflow = "hidden";
        });
      });

    certCloseBtn?.addEventListener("click", () => {
      closeCertModal();
      document.body.style.overflow = "";
    });

    certModal.addEventListener("click", (event) => {
      if (event.target === certModal) {
        closeCertModal();
        document.body.style.overflow = "";
      }
    });
  }

  /* =======================================================
     10. CERTIFICATE / BADGE FILTER BUTTONS
     ======================================================= */

  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetSectionId = button.getAttribute("data-target");
      const filterValue = button.getAttribute("data-filter");
      const targetSection = document.getElementById(targetSectionId);

      document
        .querySelectorAll(
          `.filter-btn[data-target="${targetSectionId}"]`
        )
        .forEach((btn) => btn.classList.remove("active"));

      button.classList.add("active");

      if (!targetSection) return;

      targetSection.querySelectorAll(".cert-provider").forEach((provider) => {
        const organization = provider.getAttribute("data-org");

        provider.classList.toggle(
          "hide",
          filterValue !== "all" && organization !== filterValue
        );
      });
    });
  });

  /* =======================================================
     11. GENERIC SNAPSHOT CAROUSEL
     -------------------------------------------------------
     Used by:
       - Shoaib project snapshots
       - Zubair project snapshots
       - Computer Science testimonials
       - Physics testimonials
     ======================================================= */

  const initSnapshotCarousel = (carouselId) => {
    const container = document.getElementById(carouselId);
    if (!container) return;

    const images = Array.from(container.querySelectorAll(".snapshot-img"));
    if (images.length < 1) return;

    let currentIndex = 0;

    const updatePositions = () => {
      images.forEach((image, index) => {
        image.classList.remove("active", "prev", "next");

        if (index === currentIndex) {
          image.classList.add("active");
        } else if (
          index ===
          (currentIndex - 1 + images.length) % images.length
        ) {
          image.classList.add("prev");
        } else if (
          index === (currentIndex + 1) % images.length
        ) {
          image.classList.add("next");
        }
      });
    };

    const moveNext = () => {
      currentIndex = (currentIndex + 1) % images.length;
      updatePositions();
    };

    updatePositions();

    /* One timer per carousel. */
    window.setInterval(moveNext, 3500);

    images.forEach((image, index) => {
      image.style.cursor = "pointer";

      image.addEventListener("click", () => {
        /*
         * Project/testimonial navigation stays scoped to this
         * carousel rather than jumping into another page's images.
         */
        lightboxTriggers = images;
        lightboxIndex = index;
        openLightboxAt(index);
      });
    });
  };

  initSnapshotCarousel("shoaibCarousel");
  initSnapshotCarousel("zubairCarousel");
  initSnapshotCarousel("csTestimonialsCarousel");
  initSnapshotCarousel("physicsTestimonialsCarousel");

  /* =======================================================
     12. PROJECT LIVE PREVIEW MODAL
     ======================================================= */

  const projectModalElement = document.getElementById("projectModal");
  const projectIframe = document.getElementById("projectIframe");
  const closeProjectModalBtn = document.getElementById("closeModalBtn");
  const chromeTabTitle = document.getElementById("chromeTabTitle");
  const openModalButtons = document.querySelectorAll(".open-modal-btn");

  const isParentInLightMode = () =>
    document.documentElement.getAttribute("data-theme") === "light";

  const closeProjectModal = () => {
    if (!projectModalElement) return;

    projectModalElement.classList.remove("active");

    if (projectIframe) {
      projectIframe.src = "";
    }

    document.body.style.overflow = "";
  };

  openModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectSrc = button.getAttribute("data-src");
      const projectTitle =
        button.getAttribute("data-title") || "Project View";

      if (!projectModalElement || !projectIframe || !projectSrc) return;

      projectIframe.src = projectSrc;

      if (chromeTabTitle) {
        chromeTabTitle.textContent = projectTitle;
      }

      projectModalElement.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  projectIframe?.addEventListener("load", () => {
    try {
      const iframeDocument =
        projectIframe.contentDocument ||
        projectIframe.contentWindow?.document;

      if (!iframeDocument?.body) return;

      if (isParentInLightMode()) {
        iframeDocument.documentElement.setAttribute(
          "data-theme",
          "light"
        );
        iframeDocument.body.classList.add("light-mode", "light");
      } else {
        iframeDocument.documentElement.setAttribute(
          "data-theme",
          "dark"
        );
        iframeDocument.body.classList.remove("light-mode", "light");
      }
    } catch (error) {
      /* Cross-origin iframe access can fail; the preview still works. */
      console.info("Project iframe theme sync skipped:", error);
    }
  });

  closeProjectModalBtn?.addEventListener("click", closeProjectModal);

  projectModalElement?.addEventListener("click", (event) => {
    if (event.target === projectModalElement) {
      closeProjectModal();
    }
  });

  /* =======================================================
     13. KEYBOARD SHORTCUTS
     ======================================================= */

  document.addEventListener("keydown", (event) => {
    /* Escape closes the open project modal. */
    if (
      event.key === "Escape" &&
      projectModalElement?.classList.contains("active")
    ) {
      closeProjectModal();
      return;
    }

    /* Escape closes the generic image lightbox. */
    if (
      event.key === "Escape" &&
      imageModal &&
      imageModal.style.display === "flex"
    ) {
      closeLightbox();
      return;
    }

    /* Keyboard image navigation. */
    if (
      imageModal &&
      imageModal.style.display === "flex" &&
      lightboxTriggers.length
    ) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();

        const previousIndex =
          (lightboxIndex - 1 + lightboxTriggers.length) %
          lightboxTriggers.length;

        openLightboxAt(previousIndex);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        const nextIndex =
          (lightboxIndex + 1) % lightboxTriggers.length;

        openLightboxAt(nextIndex);
      }
    }
  });

  /* =======================================================
     14. VCard TXT DOWNLOAD
     ======================================================= */

  const vcardBtn = document.getElementById("download-vcard");

  if (vcardBtn) {
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
});