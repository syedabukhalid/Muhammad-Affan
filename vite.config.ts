import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const pages = [
  "index.html",
  "Skills.html",
  "Certifications.html",
  "Badges.html",
  "Education.html",
  "Experience.html",
  "Projects.html",
  "Contact.html",
];

export default defineConfig({
  base: "/Muhammad-Affan/",
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      input: pages.map((page) => resolve(root, page)),
    },
  },
});
