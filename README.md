# 🌐 Personal Portfolio & Showcase Website

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://syedabukhalid.github.io/My-Portfolio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Vue](https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](#)

Welcome to the repository for my official personal portfolio website. The site is organized as a responsive multi-page portfolio for displaying my technical skills, certifications, verified digital badges, education, experience, projects, and contact information.

👉 **Live Site:** [https://syedabukhalid.github.io/Muhammad-Affan/](https://syedabukhalid.github.io/Muhammad-Affan/)

---

## ✨ Features & Highlights

- **⚡ Multi-Page Responsive Design:** Home, Skills, Certifications, Badges, Education, Experience, Projects, and Contact are separated into dedicated HTML pages.
- **🎨 Consistent Theme:** All pages share the same `style.css`, navigation bar, dark/light theme toggle, responsive behavior, and animated particle background.
- **📜 Credential & Verification Hub:** Direct verification links to credentials from Google, Anthropic, Oracle, Cisco, Confluent Developer, Hackviser, HackerRank, and RedTeamLeaders.
- **🎖️ Interactive Badge Gallery:** Verified digital badges are grouped by provider and include image lightbox viewing and verification links.
- **⚡ Electric Portfolio Borders:** Vue-powered animated canvas borders highlight skill, education, experience, certification, badge, project, and image-preview cards.
- **📁 Portfolio & Project Showcase:** Project pages retain the original snapshot carousels and project-preview modal.
- **📫 Integrated Contact Portal:** Email, phone, WhatsApp, LinkedIn, location, Formspree, and Google Form contact options remain available.
- **🔗 Shared Footer:** Every page includes the same Navigation and Connect & Profiles footer.

---

## 🛠️ Tech Stack & Technologies

* **Frontend:** HTML5, CSS3, Modern JavaScript (ES6+), Vue 3, TypeScript
* **Styling & Layout:** CSS Grid, Flexbox, Tailwind CSS utilities, Custom Media Queries, Smooth Scrolling
* **Fonts & Icons:** Font Awesome, Devicon
* **Animation / Background:** tsParticles
* **Build & Deployment:** Vite, GitHub Pages

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
├── src/
│   ├── components/
│   │   ├── ElectricBorder.vue
│   │   └── PortfolioBorders.vue
│   └── main.ts             # Vue enhancement entry for the portfolio pages
├── vite.config.ts          # Multi-page Vue/Tailwind build configuration
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

## ⚡ Electric Borders and Local Development

The Vue border layer mounts over existing portfolio cards so their markup, links, filters, carousels, and lightbox handlers remain unchanged. Borders use the active `--accent-green` theme color when available, with a `#28FF85` fallback, and default to `speed: 1` and `chaos: 0.12`.

Use Node.js 20 or later to install dependencies and run the site locally:

```sh
npm install
npm run dev
```

Create and preview the GitHub Pages build with:

```sh
npm run build
npm run preview
```

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

The portfolio remains a multi-page site with shared `style.css` and `script.js`. Vite builds the existing pages and assets for GitHub Pages, while Vue mounts the animated border layer without replacing the existing card markup or interactions.
