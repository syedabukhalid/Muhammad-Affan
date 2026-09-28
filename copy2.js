/*
  script.txt
  Copy the complete contents of this file into your script.js file.
  This script preserves the existing theme while fixing navigation,
  mobile behavior, image galleries, marquee direction/speed,
  snapshot visibility, theme switching, typewriter fallback,
  project preview modal, and the rotating hero gear.
*/
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const imageGalleryGroups = new Set([
    'Certificates',
    'Badges',
    'Logos',
    'Project_Shoaib_Arif_Snaps',
    'Project_Zubair_Alam_Snaps'
  ]);

  function lockBody(lock) {
    document.body.classList.toggle('modal-open', lock);
  }

  function initTheme() {
    const button = $('#themeToggleBtn');
    const root = document.documentElement;
    if (!button) return;

    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
      root.dataset.theme = saved;
    }

    const syncIcon = () => {
      const icon = button.querySelector('i');
      const light = root.dataset.theme === 'light';
      if (icon) {
        icon.className = light ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      }
      button.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    };

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      localStorage.setItem('portfolio-theme', next);
      syncIcon();
    });

    syncIcon();
  }

  function initMobileNavigation() {
    const button = $('#hamburgerBtn');
    const menu = $('#siteNavigation');
    if (!button || !menu) return;

    const close = () => {
      menu.classList.remove('is-open', 'nav-active');
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open navigation menu');
      document.body.classList.remove('nav-open');
    };

    const toggle = () => {
      const willOpen = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', willOpen);
      menu.classList.toggle('nav-active', willOpen);
      button.classList.toggle('active', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
      button.setAttribute('aria-label', willOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('nav-open', willOpen);
    };

    button.addEventListener('click', toggle);
    $$('.nav-links a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    }, { passive: true });
  }

  function initTypewriter() {
    const target = $('#typedRole');
    if (!target) return;

    const roles = [
      'Software Developer',
      'Specializing in Agentic AI integrations',
      'Data Analyst',
      'Cybersecurity enthusiast'
    ];

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      target.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeSpeed = 62;
    const deleteSpeed = 36;
    const pauseAfterTyping = 1500;
    const pauseAfterDeleting = 450;

    target.textContent = '';

    function tick() {
      const role = roles[roleIndex];
      if (!deleting) {
        charIndex += 1;
        target.textContent = role.slice(0, charIndex);
        if (charIndex === role.length) {
          deleting = true;
          setTimeout(tick, pauseAfterTyping);
          return;
        }
        setTimeout(tick, typeSpeed);
        return;
      }

      charIndex -= 1;
      target.textContent = role.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, pauseAfterDeleting);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }

    tick();
  }

  function initGearRotation() {
    const ring = $('.gear-ring');
    if (!ring) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      ring.style.setProperty('--gear-angle', '0deg');
      return;
    }

    let ticking = false;
    const update = () => {
      const angle = (window.scrollY || window.pageYOffset || 0) * 0.24;
      ring.style.setProperty('--gear-angle', angle.toFixed(2) + 'deg');
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function deriveGallery(src) {
    if (!src) return null;
    const normalized = decodeURIComponent(src).replace(/\\/g, '/');
    if (normalized.includes('Project_Shoaib_Arif_Snaps/')) return 'Project_Shoaib_Arif_Snaps';
    if (normalized.includes('Project_Zubair_Alam_Snaps/')) return 'Project_Zubair_Alam_Snaps';
    const parts = normalized.split('/');
    if (parts.includes('Certificates')) return 'Certificates';
    if (parts.includes('Badges')) return 'Badges';
    if (parts.includes('Logos')) return 'Logos';
    return null;
  }

  function getElementImageSource(element) {
    if (!element) return '';
    if (element.tagName === 'IMG') return element.currentSrc || element.src || element.getAttribute('src') || '';
    return element.dataset.img || element.getAttribute('data-img') || '';
  }

  function prepareGalleryTriggers() {
    // Education/provider logos should also open with the folder-scoped lightbox.
    $$('img[src*="Logos/"]').forEach(img => img.classList.add('lightbox-trigger'));
    // Project snapshot images need to be visible even without a prior click.
    $$('.snapshot-img').forEach(img => img.classList.add('lightbox-trigger'));
  }

  function uniqueGalleryItems(group) {
    const seen = new Set();
    const items = [];
    const selector = 'img.lightbox-trigger, img.cert-modal-trigger, .cert-overview-card.cert-modal-trigger';
    $$(selector).forEach(element => {
      const src = getElementImageSource(element);
      if (!src || deriveGallery(src) !== group) return;
      const key = new URL(src, document.baseURI).href;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ src, title: element.dataset.title || element.alt || '', alt: element.alt || element.dataset.title || 'Expanded image' });
    });
    return items;
  }

  function initImageLightbox() {
    const modal = $('#imageModal');
    const fullImage = $('#imgFull');
    if (!modal || !fullImage) return;

    const closeButton = $('#modalCloseBtn') || $('.modal-close', modal);
    const previous = $('#modalPrevBtn') || $('.modal-prev', modal);
    const next = $('#modalNextBtn') || $('.modal-next', modal);
    let currentGroup = null;
    let currentItems = [];
    let currentIndex = 0;

    const setArrowState = () => {
      const show = currentGroup && imageGalleryGroups.has(currentGroup) && currentItems.length > 1;
      if (previous) previous.hidden = !show;
      if (next) next.hidden = !show;
    };

    const render = () => {
      const item = currentItems[currentIndex];
      if (!item) return;
      fullImage.src = item.src;
      fullImage.alt = item.alt || 'Expanded image';
      if (item.title) fullImage.setAttribute('title', item.title);
    };

    const open = (element) => {
      const src = getElementImageSource(element);
      if (!src) return;
      currentGroup = deriveGallery(src);
      if (currentGroup) currentItems = uniqueGalleryItems(currentGroup);
      else currentItems = [{ src, title: element.dataset.title || '', alt: element.alt || element.dataset.title || 'Expanded image' }];

      const absolute = new URL(src, document.baseURI).href;
      currentIndex = Math.max(0, currentItems.findIndex(item => new URL(item.src, document.baseURI).href === absolute));
      render();
      setArrowState();
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      lockBody(true);
      if (closeButton) closeButton.focus();
    };

    const close = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      fullImage.removeAttribute('src');
      lockBody(false);
    };

    const move = delta => {
      if (!currentGroup || !imageGalleryGroups.has(currentGroup) || currentItems.length < 2) return;
      currentIndex = (currentIndex + delta + currentItems.length) % currentItems.length;
      render();
    };

    modal.setAttribute('aria-hidden', 'true');
    modal.addEventListener('click', event => {
      if (event.target === modal) close();
    });
    closeButton && closeButton.addEventListener('click', close);
    previous && previous.addEventListener('click', () => move(-1));
    next && next.addEventListener('click', () => move(1));

    document.addEventListener('keydown', event => {
      if (modal.style.display !== 'flex') return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });

    prepareGalleryTriggers();
    $$('.lightbox-trigger, .cert-modal-trigger').forEach(element => {
      // Avoid double-binding the same element when it has both classes.
      if (element.dataset.lightboxBound === 'true') return;
      element.dataset.lightboxBound = 'true';
      element.addEventListener('click', event => {
        event.preventDefault();
        open(element);
      });
    });
  }

  function initSkillModal() {
    const modal = $('#skillModal');
    if (!modal) return;
    const icon = $('#modalSkillIcon');
    const title = $('#modalSkillTitle');
    const desc = $('#modalSkillDesc');
    const closeButton = $('.skill-modal-close', modal);

    const close = () => {
      modal.style.display = 'none';
      lockBody(false);
    };

    $$('.skill-modal-trigger').forEach(card => {
      card.addEventListener('click', () => {
        if (icon) icon.className = 'fa-solid ' + (card.dataset.icon || 'fa-circle-info');
        if (title) title.textContent = card.dataset.title || '';
        if (desc) desc.textContent = card.dataset.desc || '';
        modal.style.display = 'flex';
        lockBody(true);
        if (closeButton) closeButton.focus();
      });
    });

    closeButton && closeButton.addEventListener('click', close);
    modal.addEventListener('click', event => {
      if (event.target === modal) close();
    });
    document.addEventListener('keydown', event => {
      if (modal.style.display === 'flex' && event.key === 'Escape') close();
    });
  }

  function initMarquees() {
    const tracks = $$('.logo-slider-track, .skills-carousel-track, .certs-carousel-track, .home-overview-track');
    if (!tracks.length) return;
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    tracks.forEach(track => {
      // Mark the repeated half as decorative for assistive technology.
      const children = Array.from(track.children);
      if (children.length > 1 && children.length % 2 === 0) {
        const half = children.length / 2;
        children.slice(half).forEach(item => item.setAttribute('aria-hidden', 'true'));
      }

      const applyDuration = () => {
        if (reduceMotion) return;
        const travelDistance = track.scrollWidth / 2;
        if (!travelDistance || !Number.isFinite(travelDistance)) return;
        const seconds = Math.max(8, travelDistance / 60);
        track.style.setProperty('--marquee-duration', seconds.toFixed(2) + 's');
      };

      applyDuration();
      window.addEventListener('resize', applyDuration, { passive: true });
      $$('img', track).forEach(img => img.addEventListener('load', applyDuration, { once: true, passive: true }));
    });
  }

  function initSnapshotCarousels() {
    const carousels = $$('.snapshot-carousel, .testimonial-carousel');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
      const images = $$('.snapshot-img, img.testimonial-img', carousel);
      if (!images.length) return;

      let current = 0;
      const setState = nextIndex => {
        current = (nextIndex + images.length) % images.length;
        images.forEach((img, index) => {
          img.classList.remove('active', 'prev', 'next');
          if (index === current) img.classList.add('active');
          else if (index === (current - 1 + images.length) % images.length) img.classList.add('prev');
          else if (index === (current + 1) % images.length) img.classList.add('next');
          img.setAttribute('aria-hidden', index === current ? 'false' : 'true');
        });
      };

      setState(0);
      if (images.length < 2) return;

      const advance = () => setState(current + 1);
      let timer = window.setInterval(advance, 3500);
      carousel.addEventListener('mouseenter', () => {
        window.clearInterval(timer);
        timer = 0;
      });
      carousel.addEventListener('mouseleave', () => {
        if (!timer) timer = window.setInterval(advance, 3500);
      });
      // Touch/keyboard focus should never hide the only visible snapshot.
      carousel.addEventListener('focusin', () => setState(current), { passive: true });
    });
  }

  function initProjectModal() {
    const modal = $('#projectModal');
    if (!modal) return;
    const iframe = $('#projectIframe');
    const title = $('#chromeTabTitle');
    const closeButton = $('#closeModalBtn');

    const close = () => {
      modal.classList.remove('active');
      if (iframe) iframe.src = '';
      lockBody(false);
    };

    $$('.open-modal-btn').forEach(button => {
      button.addEventListener('click', () => {
        if (iframe) iframe.src = button.dataset.src || '';
        if (title) title.textContent = button.dataset.title || 'Project Preview';
        modal.classList.add('active');
        lockBody(true);
        if (closeButton) closeButton.focus();
      });
    });

    closeButton && closeButton.addEventListener('click', close);
    modal.addEventListener('click', event => {
      if (event.target === modal) close();
    });
    document.addEventListener('keydown', event => {
      if (modal.classList.contains('active') && event.key === 'Escape') close();
    });
  }

  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    });
  }

  function initParticles() {
    const container = $('#tsparticles');
    if (!container || !window.tsParticles || typeof window.tsParticles.load !== 'function') return;

    const rootStyles = getComputedStyle(document.documentElement);
    const particleColor = rootStyles.getPropertyValue('--particle-color').trim() || '#00ff87';

    try {
      window.tsParticles.load({
        id: 'tsparticles',
        options: {
          fullScreen: { enable: false },
          background: { color: { value: 'transparent' } },
          particles: {
            number: { value: 42, density: { enable: true, area: 1050 } },
            color: { value: particleColor },
            opacity: { value: 0.32 },
            size: { value: { min: 1, max: 2.6 } },
            links: {
              enable: true,
              color: particleColor,
              distance: 150,
              opacity: 0.2,
              width: 1
            },
            move: { enable: true, speed: 0.45, outModes: { default: 'bounce' } }
          },
          interactivity: {
            detectsOn: 'window',
            events: { onHover: { enable: false }, onClick: { enable: false }, resize: true }
          },
          detectRetina: true
        }
      });
    } catch (error) {
      // Keep the page usable if the optional visual library is unavailable.
    }
  }

  function initLazyImageFallbacks() {
    $$('.cert-card img, .cert-overview-card img, .home-overview-image, .home-overview-logo, .snapshot-img').forEach(img => {
      if (!img.alt) img.alt = img.closest('[data-title]')?.dataset.title || 'Portfolio image';
      if (!img.hasAttribute('loading') && !img.src.includes('profile.jpg')) img.loading = 'lazy';
      img.decoding = img.decoding || 'async';
    });
  }

  function init() {
    initTheme();
    initMobileNavigation();
    initTypewriter();
    initGearRotation();
    initMarquees();
    initImageLightbox();
    initSkillModal();
    initSnapshotCarousels();
    initProjectModal();
    initContactForm();
    initLazyImageFallbacks();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
