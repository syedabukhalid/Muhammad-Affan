# 🌐 Personal Portfolio & Showcase Website

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://syedabukhalid.github.io/My-Portfolio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)

Welcome to the repository for my official personal portfolio website. The site is organized as a responsive multi-page portfolio for displaying my technical skills, certifications, verified digital badges, education, experience, projects, and contact information.

👉 **Live Site:** [https://syedabukhalid.github.io/Muhammad-Affan/](https://syedabukhalid.github.io/Muhammad-Affan/)

---

## ✨ Features & Highlights

- **⚡ Multi-Page Responsive Design:** Home, Skills, Certifications, Badges, Education, Experience, Projects, and Contact are separated into dedicated HTML pages.
- **🎨 Consistent Theme:** All pages share the same `style.css`, navigation bar, dark/light theme toggle, responsive behavior, and animated particle background.
- **📜 Credential & Verification Hub:** Direct verification links to credentials from Google, Anthropic, Oracle, Cisco, Confluent Developer, Hackviser, HackerRank, and RedTeamLeaders.
- **🎖️ Interactive Badge Gallery:** Verified digital badges are grouped by provider and include image lightbox viewing and verification links.
- **📁 Portfolio & Project Showcase:** Project pages retain the original snapshot carousels and project-preview modal.
- **📫 Integrated Contact Portal:** Email, phone, WhatsApp, LinkedIn, location, Formspree, and Google Form contact options remain available.
- **🔗 Shared Footer:** Every page includes the same Navigation and Connect & Profiles footer.

---

## 🛠️ Tech Stack & Technologies

* **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+)
* **Styling & Layout:** CSS Grid, Flexbox, Custom Media Queries, Smooth Scrolling
* **Fonts & Icons:** Font Awesome, Devicon
* **Animation / Background:** tsParticles
* **Hosting & Deployment:** GitHub Pages

---

## 📁 Repository Structure

```text
/
├── index.html              # Home / introduction
├── Skills.html             # Skills
├── Certifications.html     # Certifications
├── Badges.html             # Digital badges
├── Education.html          # Education
├── Experience.html         # Experience and testimonials
├── Projects.html           # Projects and project preview modal
├── Contact.html            # Contact information and contact form
├── style.css               # Shared styling for every page
├── script.js               # Shared JavaScript for every page
├── profile.jpg             # Profile image
├── README.md               # Project documentation
│
├── Logos/                  # Organization and technology logos
├── Certificates/           # Certificate images
├── Badges/                 # Badge images
├── Testimonials/           # Experience testimonial snapshots
├── Project_Shoaib_Arif/    # Project files and screenshots
└── Project_Zubair_Alam/    # Project files and screenshots
```

---

## 🧭 Navigation

The shared navigation links all pages together:

**Home → Skills → Certifications → Badges → Education → Experience → Projects → Contact**

Each page also contains a common footer with the same navigation links and external profile/contact links.

---

## 🌙 Dark / Light Mode

The site keeps the original theme toggle. The selected theme is stored in `localStorage`, so the preference is retained while navigating between pages.

---

## 🖼️ Interactive Features

- Animated role typing on the Home page
- tsParticles neural-network background
- Scroll-driven profile gear rotation
- Dark/light theme switching
- Responsive mobile navigation
- Certificate and badge image lightbox
- Previous/next image navigation in the lightbox
- Certification and badge provider filtering
- Project snapshot carousels
- Experience testimonial carousels
- Project live-preview iframe modal
- Home-page vCard download
- Contact form and Google Form fallback

---

## 📜 Notes

The multi-page conversion keeps the existing visual design and content structure intact. The main architectural change is that each major portfolio section now lives on its own HTML page, while `style.css` and `script.js` remain shared across the entire site.
