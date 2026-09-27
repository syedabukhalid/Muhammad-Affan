document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Theme Switcher (Dark / Light Mode)
    // ==========================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        if (body.classList.contains('light-mode')) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    });

    // ==========================================
    // 2. Mobile Navigation Drawer & Touch Handling
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !navLinks.classList.contains('nav-active');
        navLinks.classList.toggle('nav-active', isOpen);
        
        // Prevent background page scrolling when mobile menu is open
        if (window.innerWidth <= 768) {
            body.style.overflow = isOpen ? 'hidden' : '';
        }
    };

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when tapping a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });

    // Close menu when tapping outside of it on mobile
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('nav-active') && 
            !navLinks.contains(e.target) && 
            !hamburger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Reset menu overflow behavior when resizing window to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navLinks.classList.remove('nav-active');
            body.style.overflow = '';
        }
    });

    // ==========================================
    // 3. Mobile-Optimized Timeline Description Modals
    // ==========================================
    const modalButtons = document.querySelectorAll('.view-desc-btn');
    const closeButtons = document.querySelectorAll('.close-btn');
    const modals = document.querySelectorAll('.modal');

    const openModal = (targetModal) => {
        if (!targetModal) return;
        targetModal.style.display = 'flex';
        body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = (modalToClose) => {
        if (!modalToClose) return;
        modalToClose.style.display = 'none';
        
        // Only re-enable scrolling if mobile menu is not active
        if (!navLinks.classList.contains('nav-active')) {
            body.style.overflow = '';
        }
    };

    // Open Modal Listener
    modalButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const modalId = button.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            openModal(targetModal);
        });
    });

    // Close Modal Button Listener
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.closest('.modal'));
        });
    });

    // Close modal when tapping backdrop area
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Touch Swipe-to-Dismiss for Mobile Modals
        let startY = 0;
        let currentY = 0;
        const modalContent = modal.querySelector('.modal-content');

        if (modalContent) {
            modalContent.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });

            modalContent.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].clientY;
            }, { passive: true });

            modalContent.addEventListener('touchend', () => {
                // If swiped down more than 75px, close modal
                if (currentY > startY + 75 && startY !== 0) {
                    closeModal(modal);
                }
                startY = 0;
                currentY = 0;
            });
        }
    });

    // Escape Key to close open Modals or Mobile Menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => closeModal(modal));
            toggleMenu(false);
        }
    });

    // ==========================================
    // 4. Touch-Friendly ScrollSpy Navigation
    // ==========================================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    const onScroll = () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // Offset for sticky navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // ==========================================
    // 5. Contact Form Submission Handling
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Mobile haptic/vibration feedback if supported
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            alert('Thank you! Your message has been sent to Muhammad Zubair Alam.');
            contactForm.reset();
        });
    }
});