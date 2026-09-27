document.addEventListener('DOMContentLoaded', () => {
  // Dynamic Role Typing Animation Implementation
  const typedRoleElement = document.getElementById('typedRole');
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

    function typeEffect() {
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        typedRoleElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typedRoleElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
      }

      let timeout = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentRole.length) {
        timeout = pauseBetween;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        timeout = 500;
      }

      setTimeout(typeEffect, timeout);
    }

    typeEffect();
  }

  // Global reference for tsParticles instance
  let particlesInstance = null;

  // Helper function to dynamically calculate theme color hex values
  const getParticleColor = (isLight) => {
    return isLight ? '#0077b6' : '#00ff87';
  };

  // Helper function to update logos depending on active theme
  const updateLogosForTheme = (isLight) => {
    // Certifications & Slider Section Logos
    const oracleLogos = document.querySelectorAll('img[src*="Oracle_d_logo"], img[src*="Oracle_l_logo"]');
    const anthropicLogos = document.querySelectorAll('img[src*="Anthropic_d_logo"], img[src*="Anthropic_l_logo"]');
    const ciscoLogos = document.querySelectorAll('img[src*="Cisco_logo"], img[src*="Cisco_l_logo"]');
    const ibmLogos = document.querySelectorAll('img[src*="IBM_logo"], img[src*="IBM_lt_logo"]');
    const confluentLogos = document.querySelectorAll('img[src*="CONFLUENT-Developer_dt_o_logo"], img[src*="CONFLUENT-Developer_lt_o_logo_2"]');

    oracleLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/Oracle_l_logo.png' : 'Logos/Oracle_d_logo.webp';
    });
    anthropicLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/Anthropic_l_logo.png' : 'Logos/Anthropic_d_logo.png';
    });
    ciscoLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/Cisco_l_logo.png' : 'Logos/Cisco_logo.webp';
    });
    ibmLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/IBM_lt_logo.png' : 'Logos/IBM_logo.webp';
    });
    confluentLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/CONFLUENT-Developer_lt_o_logo_2.png' : 'Logos/CONFLUENT-Developer_dt_o_logo.png';
    });

    // Education & Slider Section Logos
    const iceLogos = document.querySelectorAll('img[src*="ICE_dt_1"], img[src*="ICE_lt_1"]');
    const olevelsLogos = document.querySelectorAll('img[src*="Olevels_dt_logo"], img[src*="olevels_lt_logo"]');

    iceLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/ICE_lt_1.png' : 'Logos/ICE_dt_1.png';
    });

    olevelsLogos.forEach(logo => {
      logo.src = isLight ? 'Logos/olevels_lt_logo.png' : 'Logos/Olevels_dt_logo.png';
    });
  };

  // Function to initialize tsParticles Neural Network Grid
  const initTsParticles = (isLight) => {
    if (typeof tsParticles === 'undefined') return;

    const particleColor = getParticleColor(isLight);

    tsParticles.load("tsparticles", {
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
        color: {
          value: particleColor
        },
        shape: {
          type: "circle"
        },
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
    }).then(container => {
      particlesInstance = container;
    });
  };

  // Setup Profile Picture Gravity Attraction to Node Lines
  const setupProfileAttraction = () => {
    const profilePic = document.getElementById('profilePic');
    if (!profilePic) return;

    profilePic.addEventListener('mousemove', (e) => {
      if (!particlesInstance) return;
      const rect = profilePic.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Pulse particle links attraction towards profile picture center
      if (particlesInstance.particles && particlesInstance.particles.quadTree) {
        const particlesList = particlesInstance.particles.filter();
        particlesList.forEach(p => {
          const dx = centerX - p.position.x;
          const dy = centerY - p.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            p.velocity.x += (dx / dist) * 0.15;
            p.velocity.y += (dy / dist) * 0.15;
          }
        });
      }
    });
  };

  // 0. Dark / Light Mode Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

  // Retrieve existing user setting from LocalStorage or default to dark mode
  const savedTheme = localStorage.getItem('theme');
  const isInitialLight = savedTheme === 'light';

  if (isInitialLight) {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
    updateLogosForTheme(true);
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    }
    updateLogosForTheme(false);
  }

  initTsParticles(isInitialLight);
  setupProfileAttraction();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        if (themeIcon) {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
        }
        updateLogosForTheme(false);
        initTsParticles(false);
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if (themeIcon) {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
        }
        updateLogosForTheme(true);
        initTsParticles(true);
      }
    });
  }

  // Hamburger Menu Functional Logic
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelector('.nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      hamburgerBtn.classList.toggle('active');
      navLinks.classList.toggle('nav-active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        navLinks.classList.remove('nav-active');
      });
    });
  }

  // Scroll Gear Angle Update
  const gearRing = document.querySelector('.gear-ring');
  window.addEventListener('scroll', () => {
    if (gearRing) {
      const scrollPos = window.scrollY;
      gearRing.style.setProperty('--gear-angle', `${scrollPos * 0.2}deg`);
    }
  });

  // Active Navigation Link Highlight on Scroll (only the visible section is green)
  const sections = document.querySelectorAll('section.section');
  const navItems = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    let current = '';
    const scrollPos = window.scrollY + 120; // offset for fixed header

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    // At the very top, force Home as active
    if (window.scrollY < 100) {
      current = 'home';
    }

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // set correct state on load

  // Modal / Lightbox functionality for Certificates, Badges & Project Snapshots
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('imgFull');
  const closeModal = document.querySelector('.modal-close');
  const prevBtn = document.getElementById('modalPrevBtn');
  const nextBtn = document.getElementById('modalNextBtn');

  // Shared state so both certs and project snapshots can use the same modal + arrows
  let currentTriggers = [];
  let currentImgIndex = -1;

 // ==========================================
// POPUP MODAL CODE (UNIQUE VARIABLE NAMES)
// ==========================================
const projectModalElement = document.getElementById('projectModal');
const projectIframe = document.getElementById('projectIframe');
const closeProjectModalBtn = document.getElementById('closeModalBtn');
const openModalButtons = document.querySelectorAll('.open-modal-btn');
const chromeTabTitle = document.getElementById('chromeTabTitle');

// Helper function to check if current parent site is in light mode
const isParentInLightMode = () => {
  return document.body.classList.contains('light-mode') || 
         document.body.classList.contains('light') || 
         document.documentElement.getAttribute('data-theme') === 'light' ||
         document.body.getAttribute('data-theme') === 'light';
};

// Open Modal
openModalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const projectSrc = btn.getAttribute('data-src');
    const projectTitle = btn.getAttribute('data-title') || 'Project View';
    
    if (projectSrc) {
      projectIframe.src = projectSrc;
      if (chromeTabTitle) {
        chromeTabTitle.textContent = projectTitle;
      }
      projectModalElement.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  });
});

// Pass light/dark mode theme state into the iframe content once loaded
if (projectIframe) {
  projectIframe.addEventListener('load', () => {
    try {
      const iframeDoc = projectIframe.contentDocument || projectIframe.contentWindow.document;
      if (iframeDoc && iframeDoc.body) {
        if (isParentInLightMode()) {
          iframeDoc.body.classList.add('light-mode', 'light');
          iframeDoc.documentElement.setAttribute('data-theme', 'light');
        } else {
          iframeDoc.body.classList.remove('light-mode', 'light');
          iframeDoc.documentElement.setAttribute('data-theme', 'dark');
        }
      }
    } catch (e) {
      // Cross-origin restriction fallback silently handled if applicable
      console.log('Iframe theme synchronization:', e);
    }
  });
}

// Function to Close Modal
const closeProjectModal = () => {
  if (projectModalElement) {
    projectModalElement.classList.remove('active');
    projectIframe.src = ''; // Stop running scripts inside iframe when closed
    document.body.style.overflow = ''; // Restore background scrolling
  }
};

// Close via button click
if (closeProjectModalBtn) {
  closeProjectModalBtn.addEventListener('click', closeProjectModal);
}

// Close when clicking outside the container overlay
if (projectModalElement) {
  projectModalElement.addEventListener('click', (e) => {
    if (e.target === projectModalElement) {
      closeProjectModal();
    }
  });
}

// Close using ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && projectModalElement && projectModalElement.classList.contains('active')) {
    closeProjectModal();
  }
});

  // Certificates & Badges triggers
  const certTriggers = Array.from(document.querySelectorAll('.cert-modal-trigger'));
  certTriggers.forEach((trigger, idx) => {
    trigger.addEventListener('click', () => {
      currentTriggers = certTriggers;
      currentImgIndex = idx;
      openModalAtIndex(currentImgIndex);
    });
  });

  function openModalAtIndex(index) {
    if (index >= 0 && index < currentTriggers.length) {
      modal.style.display = 'flex';
      modalImg.src = currentTriggers[index].src;
    }
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentTriggers.length === 0) return;
      currentImgIndex = (currentImgIndex - 1 + currentTriggers.length) % currentTriggers.length;
      openModalAtIndex(currentImgIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentTriggers.length === 0) return;
      currentImgIndex = (currentImgIndex + 1) % currentTriggers.length;
      openModalAtIndex(currentImgIndex);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'flex') {
      if (e.key === 'Escape') {
        modal.style.display = 'none';
      } else if (e.key === 'ArrowLeft') {
        if (currentTriggers.length === 0) return;
        currentImgIndex = (currentImgIndex - 1 + currentTriggers.length) % currentTriggers.length;
        openModalAtIndex(currentImgIndex);
      } else if (e.key === 'ArrowRight') {
        if (currentTriggers.length === 0) return;
        currentImgIndex = (currentImgIndex + 1) % currentTriggers.length;
        openModalAtIndex(currentImgIndex);
      }
    }
  });

  // Filter functionality for Certificates and Badges
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetSectionId = button.getAttribute('data-target');
      const filterValue = button.getAttribute('data-filter');

      // Update active state for buttons within the same section
      const sectionButtons = document.querySelectorAll(`.filter-btn[data-target="${targetSectionId}"]`);
      sectionButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter providers in target section
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        const providers = targetSection.querySelectorAll('.cert-provider');
        providers.forEach(provider => {
          const org = provider.getAttribute('data-org');
          if (filterValue === 'all' || org === filterValue) {
            provider.classList.remove('hide');
          } else {
            provider.classList.add('hide');
          }
        });
      }
    });
  });

  // Snapshot Carousels setup for Projects (auto-rotate + click opens same lightbox as badges)
  function initCarousel(carouselId) {
    const container = document.getElementById(carouselId);
    if (!container) return;

    const images = Array.from(container.querySelectorAll('.snapshot-img'));
    if (images.length === 0) return;

    let currentIndex = 0;

    function updatePositions() {
      images.forEach((img, idx) => {
        img.classList.remove('active', 'prev', 'next');

        if (idx === currentIndex) {
          img.classList.add('active');
        } else if (idx === (currentIndex - 1 + images.length) % images.length) {
          img.classList.add('prev');
        } else if (idx === (currentIndex + 1) % images.length) {
          img.classList.add('next');
        }
      });
    }

    updatePositions();

    setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      updatePositions();
    }, 3500);

    // Click any snapshot → open the shared modal and allow prev/next only within this project
    images.forEach((img, idx) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        currentTriggers = images;
        currentImgIndex = idx;
        openModalAtIndex(currentImgIndex);
      });
    });
  }

  initCarousel('shoaibCarousel');
  initCarousel('zubairCarousel');

  // Initialize Experience Testimonial Carousels
  initCarousel('csTestimonialsCarousel');
  initCarousel('physicsTestimonialsCarousel');

      // --- DYNAMIC vCARD (.txt output format) ---
    const vcardBtn = document.getElementById('download-vcard');

    vcardBtn.addEventListener('click', () => {
        const vCardData = `BEGIN:VCARD
VERSION: 2.3
FULL NAME: Muhammad Affan Bukhari
NICK NAME: Syed Abu Khalid
STATUS: Active Student
TEL: +966 56 796 7138
EMAIL: syedabukhalid.pro@gmail.com
ADR: Riyadh; Saudi Arabia
END: VCARD`;

        const blob = new Blob([vCardData], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Syed_Abu_Khalid_VCard.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});