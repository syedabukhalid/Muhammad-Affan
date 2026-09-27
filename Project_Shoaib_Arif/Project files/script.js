// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DARK / LIGHT THEME TOGGLE ENGINE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check localStorage or System Preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- 2. MOBILE HAMBURGER DRAWER ---
    const hamburger = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDrawer.classList.remove('open');
        });
    });

    // --- 3. INTERSECTION OBSERVER (SCROLL ANIMATIONS) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // --- 4. ACTIVE NAVIGATION LINK HIGHLIGHTING ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- 5. CONTACT FORM VALIDATION & TOAST ---
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Real-time restrictions
    nameInput.addEventListener('input', () => {
        // Remove numbers and special characters (keep only letters and spaces)
        nameInput.value = nameInput.value.replace(/[^a-zA-Z\s]/g, '');
    });

    phoneInput.addEventListener('input', () => {
        // Remove letters and illegal special characters (keep numbers, spaces, +, -, parentheses)
        phoneInput.value = phoneInput.value.replace(/[^0-9+\s()\-]/g, '');
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validate Name (Alphabetical + spaces only)
        const nameGroup = nameInput.parentElement;
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(nameInput.value.trim())) {
            nameGroup.classList.add('invalid');
            isValid = false;
        } else {
            nameGroup.classList.remove('invalid');
        }

        // Validate Email (Must contain '@')
        const emailGroup = emailInput.parentElement;
        if (!emailInput.value.includes('@') || emailInput.value.trim() === '') {
            emailGroup.classList.add('invalid');
            isValid = false;
        } else {
            emailGroup.classList.remove('invalid');
        }

        // Validate Phone (Numbers only when provided)
        const phoneGroup = phoneInput.parentElement;
        if (phoneInput.value.trim() !== '') {
            const phoneRegex = /^[0-9+\s()\-]+$/;
            if (!phoneRegex.test(phoneInput.value.trim())) {
                phoneGroup.classList.add('invalid');
                isValid = false;
            } else {
                phoneGroup.classList.remove('invalid');
            }
        } else {
            phoneGroup.classList.remove('invalid');
        }

        // Validate other required inputs
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        [subjectInput, messageInput].forEach(input => {
            const formGroup = input.parentElement;
            if (input.value.trim() === '') {
                formGroup.classList.add('invalid');
                isValid = false;
            } else {
                formGroup.classList.remove('invalid');
            }
        });

        if (isValid) {
            // Show Success Toast
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 4000);
        }
    });

    // --- 6. DYNAMIC vCARD GENERATION (.txt output format) ---
    const vcardBtn = document.getElementById('download-vcard');

    vcardBtn.addEventListener('click', () => {
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:Muhammad Shoaib
TITLE:iBwave Certified Technical Project Manager & Transmission Expert
TEL;TYPE=CELL:+966xxxxxxxxx
EMAIL:xxxxxxxxxxxxx@gmail.com
ADR;TYPE=WORK:;;Riyadh;Saudi Arabia
END:VCARD`;

        const blob = new Blob([vCardData], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Muhammad_Shoaib_VCard.txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});