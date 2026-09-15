/**
 * Multi-Page Portfolio Main Script
 * Syed Abu Khalid (Muhammad Affan Bukhari)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initCarousels();
  initCertFilters();
  initCertModal();
});

/* ==========================================================================
   THEME TOGGLE SYSTEM
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('theme') || 'dark';

  if (storedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      }
    });
  }
}

/* ==========================================================================
   MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.querySelector('.nav-links');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

/* ==========================================================================
   REUSABLE CAROUSEL ENGINE
   ========================================================================== */
function initCarousels() {
  const carousels = document.querySelectorAll('.carousel-container');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = carousel.querySelector('.prev-btn');
    const nextBtn = carousel.querySelector('.next-btn');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    const intervalTime = 2000; // 2 seconds requirement

    function updateCarousel() {
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentIndex);
      });

      const isSingleLogo = carousel.classList.contains('single-logo-carousel');
      const offset = isSingleLogo ? -(currentIndex * 100) : -(currentIndex * 60);
      track.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    }

    function startAutoplay() {
      stopAutoplay();
      autoPlayTimer = setInterval(nextSlide, intervalTime);
    }

    function stopAutoplay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    // Manual Controls
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoplay(); // Reset timer immediately
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoplay(); // Reset timer immediately
      });
    }

    // Slide Direct Clicking
    slides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        currentIndex = idx;
        updateCarousel();
        startAutoplay();
      });
    });

    // Pause on Hover
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Initial Start
    updateCarousel();
    startAutoplay();
  });
}

/* ==========================================================================
   CERTIFICATIONS DUAL FILTER ENGINE
   ========================================================================== */
function initCertFilters() {
  const orgGroup = document.getElementById('orgFilterGroup');
  const catGroup = document.getElementById('catFilterGroup');
  const resultsCountSpan = document.getElementById('resultsCount');
  const cards = document.querySelectorAll('.gallery-card');

  if (!orgGroup || !catGroup || !resultsCountSpan) return;

  function filterCertifications() {
    const selectedOrgs = Array.from(orgGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const selectedCats = Array.from(catGroup.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

    let visibleCount = 0;

    cards.forEach(card => {
      const cardIssuer = card.getAttribute('data-issuer');
      const cardCategory = card.getAttribute('data-category');

      const matchOrg = selectedOrgs.includes(cardIssuer);
      const matchCat = selectedCats.includes(cardCategory);

      if (matchOrg && matchCat) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    resultsCountSpan.textContent = visibleCount;
  }

  // Event listener for all checkboxes
  document.querySelectorAll('.checkbox-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', filterCertifications);
  });

  // Action Buttons
  document.getElementById('selectAllOrgs')?.addEventListener('click', () => {
    orgGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    filterCertifications();
  });

  document.getElementById('unselectAllOrgs')?.addEventListener('click', () => {
    orgGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    filterCertifications();
  });

  document.getElementById('selectAllCats')?.addEventListener('click', () => {
    catGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    filterCertifications();
  });

  document.getElementById('unselectAllCats')?.addEventListener('click', () => {
    catGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    filterCertifications();
  });

  // Initial calculation
  filterCertifications();
}

/* ==========================================================================
   CERTIFICATE LIGHTBOX MODAL
   ========================================================================== */
function initCertModal() {
  const modal = document.getElementById('certModal');
  const modalImg = document.getElementById('modalImg');
  const modalClose = document.getElementById('modalClose');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

  if (!modal || !modalImg) return;

  let clickableImages = Array.from(document.querySelectorAll('.clickable-cert'));
  let currentIndex = 0;

  function openModal(index) {
    // Get list of currently visible images
    clickableImages = Array.from(document.querySelectorAll('.gallery-card'))
      .filter(card => card.style.display !== 'none')
      .map(card => card.querySelector('.clickable-cert'));

    if (clickableImages.length === 0) return;

    currentIndex = index;
    modalImg.src = clickableImages[currentIndex].src;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  function showNext() {
    if (clickableImages.length === 0) return;
    currentIndex = (currentIndex + 1) % clickableImages.length;
    modalImg.src = clickableImages[currentIndex].src;
  }

  function showPrev() {
    if (clickableImages.length === 0) return;
    currentIndex = (currentIndex - 1 + clickableImages.length) % clickableImages.length;
    modalImg.src = clickableImages[currentIndex].src;
  }

  // Attach click listener to images in gallery
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('clickable-cert')) {
      const visibleImages = Array.from(document.querySelectorAll('.gallery-card'))
        .filter(card => card.style.display !== 'none')
        .map(card => card.querySelector('.clickable-cert'));
      
      const idx = visibleImages.indexOf(e.target);
      if (idx !== -1) {
        openModal(idx);
      }
    }
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalNext) modalNext.addEventListener('click', showNext);
  if (modalPrev) modalPrev.addEventListener('click', showPrev);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });
}